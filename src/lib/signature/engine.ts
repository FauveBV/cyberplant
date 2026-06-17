import type { AudioFeatures, MeterFrame, Palette, RGB } from './types';

/** mulberry32 — PRNG determinista (semilla → secuencia reproducible) */
function rng(s: number): () => number {
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Part {
  a0: number; r0: number; dir: number; z: number; rad: number; tf: number;
  ph: number; ph2: number; kind: 'field' | 'synth'; push: number; pf: number;
  col: RGB | null; nat: RGB; hum: RGB; x: number; y: number;
  sq?: number; ex?: number; exv?: number; flick?: number; frate?: number; tang?: number; colK?: number;
}

const SIL = 0.028; // umbral de silencio (nivel crudo)

/**
 * Motor visual del espécimen. Canvas 2D puro, sin libs.
 * Estética y comportamiento portados 1:1 desde wallpaper.html;
 * la paleta se inyecta (derivada de tokens) y el audio llega por un provider.
 */
export class SignatureEngine {
  private ctx: CanvasRenderingContext2D;
  private pal: Palette;
  private reduce: boolean;
  private seed: number;

  private w = 0;
  private h = 0;
  private dpr = 1;
  private parts: Part[] = [];
  private nodes: Part[] = [];
  private sc!: HTMLCanvasElement;
  private sctx!: CanvasRenderingContext2D;
  private lo!: HTMLCanvasElement;
  private loctx!: CanvasRenderingContext2D;
  private hlA!: HTMLCanvasElement;
  private hlAc!: CanvasRenderingContext2D;
  private hlB!: HTMLCanvasElement;
  private hlBc!: CanvasRenderingContext2D;

  private t = 0;
  private rot = 0;
  private last = 0;
  private haloR = 0;
  private raf = 0;
  private running = false;

  // parámetros (objetivo + suavizado)
  private loud = 0.15;
  private glitchE = 0;
  private bpm = 92;
  private naturalness = 0.6;
  private sLoud = 0.15;
  private sGlitch = 0;
  private sWind = 0.12;
  private sNat = 0.6;
  private bassAvg = 0;
  private lastKick = 0;
  private kick = 0;
  private highAvg = 0;
  private lastSnare = 0;
  private snare = 0;
  private beatEnv = 0;
  private voiceTarget = 0;
  private voiceE = 0;
  private synthTarget = 0;
  private synthE = 0;
  private level = 0;
  private ambientTarget = 0;
  private ambientE = 0;
  private ambPhase = 0;
  private sharpTarget = 0.4;
  private sCen = 0.4;
  private fluxAvg = 0;
  private onsets: number[] = [];
  private lastOnset = 0;

  private features: () => AudioFeatures | null = () => null;
  private meterCb: ((m: MeterFrame) => void) | null = null;

  constructor(
    private cv: HTMLCanvasElement,
    palette: Palette,
    opts: { reducedMotion?: boolean; seed?: number } = {}
  ) {
    this.ctx = cv.getContext('2d')!;
    this.pal = palette;
    this.reduce = opts.reducedMotion ?? false;
    this.seed = opts.seed ?? 29;
  }

  setFeaturesProvider(fn: () => AudioFeatures | null) {
    this.features = fn;
  }
  onMeter(cb: (m: MeterFrame) => void) {
    this.meterCb = cb;
  }
  get audioActive() {
    return this.level > SIL;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.size();
    if (this.reduce) this.frame(performance.now());
    else this.raf = requestAnimationFrame(this.frame);
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  exportPNG(filename = 'cyberplant-wall.png') {
    const a = document.createElement('a');
    a.download = filename;
    a.href = this.cv.toDataURL('image/png');
    a.click();
  }

  size() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.cv.getBoundingClientRect();
    this.w = rect.width || window.innerWidth;
    this.h = rect.height || window.innerHeight;
    this.cv.width = this.w * this.dpr;
    this.cv.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const mk = () => {
      const c = document.createElement('canvas');
      c.width = this.w;
      c.height = this.h;
      return c;
    };
    this.sc = mk();
    this.sctx = this.sc.getContext('2d')!;
    this.lo = document.createElement('canvas');
    this.loctx = this.lo.getContext('2d')!;
    this.hlA = mk();
    this.hlAc = this.hlA.getContext('2d')!;
    this.hlB = mk();
    this.hlBc = this.hlB.getContext('2d')!;
    this.build();
  }

  private pick(arr: RGB[], r: () => number): RGB {
    return arr[(r() * arr.length) | 0];
  }

  private build() {
    const r = rng(this.seed);
    const maxR = Math.min(this.w, this.h) * 0.34;
    const n = Math.min(480, Math.max(140, Math.floor((this.w * this.h) / 5200)));
    this.parts = [];
    this.nodes = [];
    for (let i = 0; i < n; i++) {
      const rr = Math.pow(r(), 1.7) * maxR; // denso al centro
      const a0 = r() * 6.283;
      const kind: 'field' | 'synth' = r() < 0.17 ? 'synth' : 'field';
      const p: Part = {
        a0,
        r0: rr,
        dir: 1,
        z: 0.4 + r() * 0.6,
        rad: 0.7 + r() * 2.6,
        tf: 0.4 + r() * 0.9,
        ph: r() * 6.283,
        ph2: r() * 6.283,
        kind,
        push: 0,
        pf: 0.5 + r() * 0.9,
        col: null,
        nat: this.pick(this.pal.NAT, r),
        hum: this.pick(this.pal.HUM, r),
        x: 0,
        y: 0,
      };
      if (kind === 'synth') {
        p.col = this.pick(this.pal.SYNTH, r);
        p.rad = 1.0 + r() * 2.4;
      }
      this.parts.push(p);
    }
    // nodos (kick) con cuadrado-lupa + línea al centro · sólo del campo normal
    const k = Math.min(28, Math.max(14, Math.floor(n * 0.08)));
    const stride = Math.max(1, Math.floor(n / k));
    for (let i = 0; i < n && this.nodes.length < k; i += stride) {
      let j = i;
      while (j < n && this.parts[j].kind !== 'field') j++;
      if (j < n && !this.parts[j].sq) {
        const p = this.parts[j];
        p.sq = 6 + r() * 12;
        p.ex = 0;
        p.exv = 0;
        p.flick = 0;
        p.frate = 18;
        p.tang = 0;
        p.colK = 0.6;
        this.nodes.push(p);
      }
    }
  }

  /** kick (bajo): la eyección codifica cualidades del golpe */
  private fireKick(str: number, swirl = 0, frate = 18, nat = this.sNat) {
    this.kick = Math.max(this.kick, str);
    for (const nd of this.nodes) {
      if (Math.random() < 0.42) {
        nd.exv! += (38 + Math.random() * 95) * str; // distancia ← fuerza
        nd.flick = 1;
        nd.frate = frate; // parpadeo ← metálico
        nd.tang = swirl; // deriva ← viento
        nd.colK = nat; // color ← centroide
      }
    }
  }

  private glow(g: CanvasRenderingContext2D, cx: number, cy: number, rr: number, rgb: RGB, al: number) {
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
    grd.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${al.toFixed(3)})`);
    grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    g.fillStyle = grd;
    g.beginPath();
    g.arc(cx, cy, rr, 0, 6.283);
    g.fill();
  }
  private mix(a: RGB, b: RGB, k: number): RGB {
    return [(a[0] + (b[0] - a[0]) * k) | 0, (a[1] + (b[1] - a[1]) * k) | 0, (a[2] + (b[2] - a[2]) * k) | 0];
  }
  private haloShape(g: CanvasRenderingContext2D, cx: number, cy: number, R: number, irr: number) {
    const N = 72;
    g.beginPath();
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * 6.283;
      const k = R * (1 + irr * (Math.sin(a * 3 + this.t * 1.3) * 0.5 + Math.sin(a * 5 - this.t * 0.9) * 0.3 + Math.sin(a * 8 + this.t * 2.1) * 0.2));
      const x = cx + Math.cos(a) * k;
      const y = cy + Math.sin(a) * k;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
  }
  private drawHalo(g: CanvasRenderingContext2D, cx: number, cy: number, R: number, vE: number, col: RGB) {
    if (vE < 0.02 || R < 4) return;
    const irr = 0.06 + vE * 0.85;
    const a = Math.min(0.6, 0.1 + vE * 0.7);
    const Rmax = R * (1 + irr);
    const c = `${col[0]},${col[1]},${col[2]}`;
    const grd = g.createRadialGradient(cx, cy, Math.max(1, R * 0.15), cx, cy, Rmax);
    grd.addColorStop(0, `rgba(${c},${(a * 0.18).toFixed(3)})`);
    grd.addColorStop(0.68, `rgba(${c},${(a * 0.12).toFixed(3)})`);
    grd.addColorStop(0.9, `rgba(${c},${a.toFixed(3)})`);
    grd.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = grd;
    this.haloShape(g, cx, cy, R, irr);
    g.fill();
  }
  private drawAmbient(g: CanvasRenderingContext2D, cx: number, cy: number, maxR: number, aE: number) {
    if (aE < 0.03) return;
    const rings = 3;
    g.lineWidth = 1.2;
    for (let i = 0; i < rings; i++) {
      const ph = (this.ambPhase + i / rings) % 1;
      const R = ph * maxR;
      if (R < 6) continue;
      const al = aE * 0.55 * (1 - ph);
      if (al < 0.01) continue;
      const c = this.pal.AMB[i % this.pal.AMB.length];
      g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${al.toFixed(3)})`;
      const N = 90;
      g.beginPath();
      for (let j = 0; j <= N; j++) {
        const a = (j / N) * 6.283;
        const wob = 1 + 0.05 * Math.sin(a * 6 + this.t * 2 + i * 1.7);
        const x = cx + Math.cos(a) * R * wob;
        const y = cy + Math.sin(a) * R * wob;
        j ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.closePath();
      g.stroke();
    }
  }

  /** mapeo audio→parámetros + detección de golpes (portado de readAudio) */
  private applyFeatures(f: AudioFeatures | null) {
    if (!f) {
      this.level = 0;
      return;
    }
    const { bands, raw, flux, hflux, centroid } = f;
    this.level = raw.all;
    this.loud = bands.all * 0.85;
    this.glitchE = Math.min(1, bands.high * 0.7 + flux * 2.8);
    this.naturalness = Math.max(0, Math.min(1, 1 - centroid * 1.4));
    this.voiceTarget = bands.voice * 0.85;
    this.synthTarget = bands.synth * 0.85;
    this.sharpTarget = Math.min(1, centroid * 2.2);
    const sustain = Math.min(1, (raw.synth + raw.voice) * 1.3);
    const trans = Math.min(1, flux * 7);
    this.ambientTarget = raw.all > SIL ? Math.max(0, sustain * (1 - trans)) : 0;
    const now = performance.now() / 1000;
    if (raw.all > SIL) {
      this.bassAvg += (bands.kick - this.bassAvg) * 0.08;
      if (bands.kick > 0.5 && bands.kick > this.bassAvg + 0.15 && now - this.lastKick > 0.12) {
        this.lastKick = now;
        this.fireKick(Math.min(1, bands.kick * 0.85 + 0.2), this.sWind * 70, 12 + bands.high * 46, this.naturalness);
      }
      this.highAvg += (hflux - this.highAvg) * 0.12;
      if (hflux > this.highAvg * 1.6 && hflux > 0.007 && now - this.lastSnare > 0.08) {
        this.lastSnare = now;
        this.snare = Math.max(this.snare, Math.min(1, hflux * 5 + 0.3));
        this.beatEnv = 1;
      }
      this.fluxAvg += (flux - this.fluxAvg) * 0.1;
      if (flux > this.fluxAvg * 1.5 && flux > 0.01 && now - this.lastOnset > 0.26) {
        if (this.lastOnset) {
          this.onsets.push(now - this.lastOnset);
          if (this.onsets.length > 8) this.onsets.shift();
        }
        this.lastOnset = now;
        this.beatEnv = 1;
        const s = [...this.onsets].sort((a, b) => a - b);
        const med = s[s.length >> 1];
        if (med) this.bpm = Math.max(50, Math.min(190, 60 / med));
      }
    }
  }

  private frame = (now: number) => {
    const dts = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const f = this.features();
    this.applyFeatures(f);
    const react = !!f && this.level > SIL;
    if (!react) {
      this.loud = 0.05;
      this.glitchE = 0;
      this.naturalness = 0.55;
      this.voiceTarget = 0;
      this.synthTarget = 0;
      this.ambientTarget = 0;
      this.bpm = 60;
    }
    // suavizado / envolventes
    this.sLoud += (this.loud - this.sLoud) * 0.18;
    this.sGlitch += (this.glitchE - this.sGlitch) * (this.glitchE > this.sGlitch ? 0.6 : 0.07);
    this.sNat += (this.naturalness - this.sNat) * 0.08;
    this.voiceE += (this.voiceTarget - this.voiceE) * 0.22;
    this.synthE += (this.synthTarget - this.synthE) * 0.22;
    this.ambientE += (this.ambientTarget - this.ambientE) * 0.06;
    this.sCen += (this.sharpTarget - this.sCen) * 0.08;
    this.ambPhase += dts * (0.05 + this.ambientE * 0.14);
    const windTarget = 0.04 + (this.bpm / 120) * 1.0;
    this.sWind += (windTarget - this.sWind) * 0.06;
    this.kick *= 0.87;
    this.snare *= 0.78;
    this.beatEnv *= 0.92;
    const gE = Math.min(1, this.sGlitch + this.kick * 0.45 + this.snare * 0.8);

    this.t += dts * (0.4 + this.sLoud);
    this.rot += this.sWind * dts;
    const w = this.w, h = this.h;
    const cx = w * 0.5 + Math.sin(this.t * 0.15) * w * 0.04;
    const cy = h * 0.5 + Math.cos(this.t * 0.12) * h * 0.045;
    const turbAmp = 6 + this.sLoud * 120 + this.kick * 60;

    if (this.meterCb) this.meterCb({ kick: this.kick, voice: this.voiceE, synth: this.synthE, snare: this.snare });

    // resorte de eyección + deriva tangencial + parpadeo de nodos
    for (const nd of this.nodes) {
      nd.exv! += -0.045 * nd.ex!;
      nd.exv! *= 0.9;
      nd.ex! += nd.exv!;
      if (nd.ex! > 380) nd.ex = 380;
      else if (nd.ex! < -60) nd.ex = -60;
      if (nd.flick! > 0) nd.a0 += nd.tang! * 0.00018 * nd.flick!;
      nd.flick! *= 0.94;
    }

    const sctx = this.sctx;
    const BG = this.pal.BG;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalCompositeOperation = 'source-over';
    sctx.globalAlpha = 1;
    sctx.fillStyle = `rgb(${BG[0]},${BG[1]},${BG[2]})`;
    sctx.fillRect(0, 0, w, h);
    sctx.globalCompositeOperation = 'lighter';
    this.glow(sctx, cx, cy, Math.max(w, h) * 0.3, [31, 61, 240], 0.05 + this.sLoud * 0.07);

    // HALO de VOZ irregular + feedback de imagen (ping-pong)
    const hTgt = Math.min(w, h) * 0.1 + this.voiceE * Math.min(w, h) * 0.62;
    this.haloR += (hTgt - this.haloR) * 0.12;
    {
      const fb = Math.max(this.voiceE, this.ambientE);
      this.hlAc.setTransform(1, 0, 0, 1, 0, 0);
      this.hlAc.clearRect(0, 0, w, h);
      const zoom = 1.004 + fb * 0.05;
      const decay = 0.42 + fb * 0.52;
      const dw = w * zoom, dh = h * zoom;
      this.hlAc.globalCompositeOperation = 'source-over';
      this.hlAc.globalAlpha = decay;
      this.hlAc.drawImage(this.hlB, (w - dw) / 2, (h - dh) / 2, dw, dh);
      this.hlAc.globalAlpha = 1;
      this.hlAc.globalCompositeOperation = 'lighter';
      const hcol = this.mix([255, 120, 180], [255, 40, 205], Math.min(1, this.sCen));
      this.drawHalo(this.hlAc, cx, cy, this.haloR, this.voiceE, hcol);
      this.drawAmbient(this.hlAc, cx, cy, Math.min(w, h) * 0.7, this.ambientE);
      sctx.globalCompositeOperation = 'lighter';
      sctx.drawImage(this.hlA, 0, 0);
      const ta = this.hlA, tac = this.hlAc;
      this.hlA = this.hlB;
      this.hlAc = this.hlBc;
      this.hlB = ta;
      this.hlBc = tac;
    }

    // posiciones
    for (const p of this.parts) {
      const ang = p.a0 + this.rot * p.dir;
      const ox = Math.sin(this.t * 1.3 + p.ph) * Math.cos(this.t * 0.7 + p.ph2) * turbAmp * p.tf;
      const oy = Math.cos(this.t * 1.1 + p.ph) * Math.sin(this.t * 0.9 + p.ph2) * turbAmp * p.tf;
      let er = p.r0;
      if (p.sq) er += p.ex!;
      else if (p.kind === 'synth') {
        p.push += (this.synthE * 220 * p.pf - p.push) * 0.16;
        er += p.push;
      }
      p.x = cx + Math.cos(ang) * er + ox;
      p.y = cy + Math.sin(ang) * er * 1.12 + oy;
    }
    // líneas radiales centro → nodos
    sctx.lineWidth = 1;
    sctx.strokeStyle = `rgba(200,210,255,${(0.16 + this.sLoud * 0.22).toFixed(3)})`;
    for (const nd of this.nodes) {
      sctx.beginPath();
      sctx.moveTo(cx, cy);
      sctx.lineTo(nd.x, nd.y);
      sctx.stroke();
    }

    // partículas brillantes
    const bright = 0.6 + this.sLoud * 0.9;
    for (const p of this.parts) {
      if (p.sq && p.flick! > 0.05) {
        const osc = Math.sin(this.t * (p.frate || 18) + p.ph);
        if (osc < 0 && Math.random() < p.flick!) continue;
      }
      let vb = 1;
      let col: RGB;
      if (p.kind === 'synth') {
        col = p.col!;
        vb = Math.min(3.4, 1 + this.synthE * 3.4 * p.pf);
      } else {
        const ck = p.sq && p.flick! > 0.05 ? p.colK! : this.sNat;
        col = this.mix(p.hum, p.nat, ck);
      }
      const fb = p.sq ? 1 + p.flick! * 0.9 : 1;
      const rr = p.rad * p.z * (3.4 + this.sLoud * 4) * fb * vb;
      this.glow(sctx, p.x, p.y, rr, col, Math.min(0.98, 0.45 * p.z * bright * fb * Math.min(2.2, vb)));
      sctx.globalAlpha = Math.min(1, 0.7 * p.z * bright * Math.min(1.5, vb));
      sctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      sctx.beginPath();
      sctx.arc(p.x, p.y, Math.max(0.6, p.rad * p.z * 1.7 * fb * Math.min(1.6, vb)), 0, 6.283);
      sctx.fill();
      sctx.globalAlpha = Math.min(1, 0.95 * p.z * bright * Math.min(1.6, vb));
      sctx.fillStyle = '#fff';
      sctx.beginPath();
      sctx.arc(p.x, p.y, Math.max(0.5, p.rad * p.z * 0.85 * fb), 0, 6.283);
      sctx.fill();
    }
    // SNARE: speckle blanco
    if (this.snare > 0.12) {
      sctx.globalCompositeOperation = 'lighter';
      const N = Math.floor(this.snare * 150);
      sctx.fillStyle = `rgba(237,237,255,${(0.5 * this.snare).toFixed(3)})`;
      for (let i = 0; i < N; i++) {
        const sx = Math.random() * w, sy = Math.random() * h, ss = 1 + Math.random() * 2.4;
        sctx.fillRect(sx, sy, ss, ss);
      }
    }
    // cuadrados-lupa
    sctx.globalCompositeOperation = 'source-over';
    sctx.lineWidth = 1;
    for (const nd of this.nodes) {
      if (nd.flick! > 0.05 && Math.random() < nd.flick! * 0.5) continue;
      const s = nd.sq! * (1 + nd.flick! * 0.7);
      sctx.strokeStyle = 'rgba(237,237,237,0.5)';
      sctx.strokeRect(nd.x - s / 2, nd.y - s / 2, s, s);
      if (nd.flick! > 0.2) {
        sctx.strokeStyle = `rgba(255,61,196,${(0.55 * nd.flick!).toFixed(3)})`;
        sctx.strokeRect(nd.x - s / 2 + 3, nd.y - s / 2 - 2, s, s);
      }
    }

    // presentación: pixelación + slices
    const ctx = this.ctx;
    const pb = 1.5 + gE * 7;
    const loW = Math.max(1, Math.floor(w / pb)), loH = Math.max(1, Math.floor(h / pb));
    this.lo.width = loW;
    this.lo.height = loH;
    this.loctx.imageSmoothingEnabled = true;
    this.loctx.clearRect(0, 0, loW, loH);
    this.loctx.drawImage(this.sc, 0, 0, w, h, 0, 0, loW, loH);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.lo, 0, 0, loW, loH, 0, 0, w, h);

    if (gE > 0.18) {
      const bands = 2 + Math.floor(gE * 6);
      for (let i = 0; i < bands; i++) {
        const by = Math.random() * h, bh = 4 + Math.random() * 22 * gE, dx = (Math.random() - 0.5) * 60 * gE;
        ctx.drawImage(this.sc, 0, by, w, bh, dx, by, w, bh);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.5 * gE;
        ctx.drawImage(this.sc, 0, by, w, bh, dx * 0.6 + 6, by, w, bh);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    }
    // scanlines
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#000';
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    ctx.globalAlpha = 1;

    if (!this.reduce && this.running) this.raf = requestAnimationFrame(this.frame);
  };
}
