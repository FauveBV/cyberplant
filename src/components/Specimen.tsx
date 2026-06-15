import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
// @ts-ignore — simplex-noise 2.4.0 (API new SimplexNoise(seed).noise2D); sin tipos propios
import SimplexNoise from 'simplex-noise';
import { $seed } from '../stores/identity';

type Key = 'arms' | 'turns' | 'rise' | 'dens' | 'glitch' | 'org' | 'rot' | 'morph';

const SLIDERS: { key: Key; id: string; label: string; min: number; max: number; def: number; aria: string }[] = [
  { key: 'arms', id: 'pArms', label: 'Cuadrados · zoom', min: 1, max: 8, def: 4, aria: 'Cuadrados-lupa: cantidad y nivel de zoom' },
  { key: 'turns', id: 'pTurns', label: 'Ondulación · turbulencia', min: 2, max: 14, def: 5, aria: 'Ondulación / turbulencia de la superficie' },
  { key: 'rise', id: 'pRise', label: 'Altura', min: 0, max: 100, def: 60, aria: 'Altura de los tallos' },
  { key: 'dens', id: 'pDens', label: 'Densidad', min: 80, max: 900, def: 560, aria: 'Densidad del campo' },
  { key: 'glitch', id: 'pGlitch', label: 'Glitch', min: 0, max: 100, def: 18, aria: 'Intensidad de glitch' },
  { key: 'org', id: 'pOrg', label: 'Bioluminiscencia', min: 0, max: 100, def: 48, aria: 'Bioluminiscencia / glow' },
  { key: 'rot', id: 'pRot', label: 'Viento', min: 0, max: 100, def: 30, aria: 'Velocidad del viento' },
  { key: 'morph', id: 'pMorph', label: 'Morfología · humano→natural', min: 0, max: 100, def: 40, aria: 'Morfología: de geométrico (humano) a orgánico (natural)' },
];

const DEFAULTS = SLIDERS.reduce((o, s) => ((o[s.key] = s.def), o), {} as Record<Key, number>);

// PRNG determinista (mismo que el original)
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function announce(msg: string) {
  const el = document.getElementById('live');
  if (el) el.textContent = msg;
}

export default function Specimen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudPixRef = useRef<HTMLDivElement>(null);
  const hudDataRef = useRef<HTMLDivElement>(null);
  const hudStatusRef = useRef<HTMLDivElement>(null);

  const [vals, setVals] = useState<Record<Key, number>>({ ...DEFAULTS });
  const [playing, setPlaying] = useState(true);
  const [ctrlsOpen, setCtrlsOpen] = useState(true);
  const [seed, setSeed] = useState<number | null>(null);

  // refs del motor (persisten sin re-render)
  const disp = useRef<Record<Key, number>>({ ...DEFAULTS });
  const phase = useRef(0);
  const playingRef = useRef(true);
  const seedRef = useRef(0);
  const simplexRef = useRef<any>(null);
  const pixRef = useRef<HTMLCanvasElement | null>(null);
  const smoothRef = useRef(true);

  // funciones del motor expuestas a los handlers vía refs
  const drawRef = useRef<() => void>(() => {});
  const setTargetRef = useRef<(k: Key, v: number) => void>(() => {});
  const updateHUDRef = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smooth = typeof gsap !== 'undefined' && !reduceMotion;
    smoothRef.current = smooth;

    // semilla inicial
    let s = Math.floor(Math.random() * 999999);
    seedRef.current = s;
    setSeed(s);
    $seed.set(s);
    simplexRef.current = typeof SimplexNoise !== 'undefined' ? new SimplexNoise(String(s)) : null;

    function fit() {
      const r = cv!.getBoundingClientRect();
      cv!.width = Math.max(1, r.width * devicePixelRatio);
      cv!.height = Math.max(1, r.height * devicePixelRatio);
    }
    function n2(x: number, y: number) {
      return simplexRef.current ? simplexRef.current.noise2D(x, y) : (Math.sin(x * 1.7) + Math.sin(y * 1.3)) * 0.5;
    }
    function rng(i: number) {
      return mulberry32(((seedRef.current * 131071) ^ (i * 2246822519)) >>> 0);
    }

    function drawSpiral() {
      fit();
      const d = disp.current;
      const W = cv!.width,
        H = cv!.height,
        dpr = devicePixelRatio,
        cx = W * 0.55,
        cy = H * 0.5;
      const turns = d.turns,
        rise = d.rise / 100,
        dens = d.dens,
        glitch = d.glitch / 100,
        org = d.org / 100,
        m = d.morph / 100,
        anchors = Math.round(d.arms);
      const N = Math.floor(900 + ((dens - 80) / 820) * 4200); // 900..5100 gránulos
      const ph = phase.current;
      const rot = ph * 0.5,
        cR = Math.cos(rot),
        sR = Math.sin(rot),
        scale = Math.min(W, H) * 0.34;
      const PAL = [
        [31, 61, 240],
        [122, 176, 110],
        [184, 168, 136],
        [236, 238, 245],
      ];
      const SIG = [212, 56, 13]; // azul·verde·mineral·blanco + señal

      ctx!.globalCompositeOperation = 'source-over';
      ctx!.fillStyle = '#04050a';
      ctx!.fillRect(0, 0, W, H);
      const hz = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      hz.addColorStop(0, `rgba(31,61,240,${0.06 + org * 0.1})`);
      hz.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = hz;
      ctx!.fillRect(0, 0, W, H);
      for (let i = 0; i < 80; i++) {
        const r = rng(9000 + i);
        ctx!.fillStyle = `rgba(236,238,245,${0.05 + 0.1 * Math.abs(Math.sin(ph + i))})`;
        ctx!.fillRect(r() * W, r() * H, dpr, dpr);
      }

      // gránulos: nacen pequeños y nítidos → crecen y se vuelven borrosos (ciclo de vida)
      ctx!.globalCompositeOperation = 'lighter';
      const proj: number[][] = [];
      for (let i = 0; i < N; i++) {
        const r = rng(i);
        const u = r() * 2 - 1,
          th = r() * Math.PI * 2,
          rr = Math.cbrt(r());
        const bx = Math.sqrt(1 - u * u) * Math.cos(th),
          by = u,
          bz = Math.sqrt(1 - u * u) * Math.sin(th);
        const nf = 1.3 + turns * 0.55; // Ondulación = frecuencia de turbulencia
        const nz = n2(bx * nf + i * 0.0006, bz * nf + ph * 0.06);
        const ripple = 0.12 * Math.sin(by * turns * 0.9 + ph * 1.2); // ondas concéntricas
        const rad = rr * (0.5 + (0.5 + 1.3 * m) * Math.abs(nz)) * (1 + ripple);
        const X = bx * rad,
          Y = by * rad * (0.8 + rise * 1.0),
          Z = bz * rad;
        const x2 = X * cR - Z * sR,
          z2 = X * sR + Z * cR;
        const per = 1 / (1.9 - z2 * 0.7),
          px = cx + x2 * scale * per,
          py = cy + Y * scale * per,
          depth = (z2 + 1) / 2;
        const off = r();
        const life = (ph * 0.18 * (0.5 + 0.5 * r()) + off) % 1; // ciclo 0..1
        const grow = Math.sin(life * Math.PI); // nace, crece, se disuelve
        const k = r(),
          col = k > 0.97 ? SIG : PAL[(k * PAL.length) | 0];
        const sz = (0.6 + grow * grow * (2 + org * 9)) * dpr * (0.55 + depth * 0.7);
        if (sz < 1.6) {
          ctx!.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.35 + depth * 0.5})`;
          ctx!.fillRect(px, py, sz + dpr * 0.5, sz + dpr * 0.5);
        } else {
          const R = sz * 3.2,
            g = ctx!.createRadialGradient(px, py, 0, px, py, R);
          const a = (0.5 - grow * 0.32) * (0.6 + org * 0.6);
          g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${a})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(px, py, R, 0, 7);
          ctx!.fill();
        }
        if (i % 23 === 0) proj.push([px, py, depth]);
      }
      ctx!.globalCompositeOperation = 'source-over';

      // GLITCH = lo borroso se pixela: bajo-muestreo de la escena con bloques duros
      if (glitch > 0.02) {
        const pc = pixRef.current || (pixRef.current = document.createElement('canvas'));
        const p = pc.getContext('2d')!;
        const f = Math.max(0.04, 1 / (1 + glitch * 22)); // más glitch → bloques más grandes
        pc.width = Math.max(1, (W * f) | 0);
        pc.height = Math.max(1, (H * f) | 0);
        p.imageSmoothingEnabled = false;
        p.clearRect(0, 0, pc.width, pc.height);
        p.drawImage(cv!, 0, 0, pc.width, pc.height);
        ctx!.imageSmoothingEnabled = false;
        ctx!.drawImage(pc, 0, 0, pc.width, pc.height, 0, 0, W, H);
        ctx!.imageSmoothingEnabled = true;
      }

      // grafo de nodos: handles cuadrados sobre la nube (densidad fija)
      ctx!.lineWidth = dpr * 0.6;
      const hub = proj[3] || [cx, cy];
      proj.slice(0, 40).forEach((pp, idx) => {
        ctx!.strokeStyle = 'rgba(236,238,245,.20)';
        ctx!.beginPath();
        ctx!.moveTo(hub[0], hub[1]);
        ctx!.lineTo(pp[0], pp[1]);
        ctx!.stroke();
        ctx!.strokeStyle = 'rgba(236,238,245,.55)';
        ctx!.strokeRect(pp[0] - 2.5, pp[1] - 2.5, 5, 5);
        if (idx % 5 === 0) {
          ctx!.fillStyle = 'rgba(122,176,110,.9)';
          ctx!.fillRect(pp[0] - 1, pp[1] - 1, 2 * dpr, 2 * dpr);
        }
      });

      // CUADRADOS-lupa: cada uno magnifica una región del espécimen.
      // más cuadrados → más zoom (más detalle) en cada uno.
      ctx!.imageSmoothingEnabled = false; // detalle pixelado al magnificar
      const zoom = 2.0 + anchors * 0.85;
      for (let b = 0; b < anchors; b++) {
        const r = rng(40000 + b);
        const sq = Math.min(W, H) * (0.13 + r() * 0.05);
        const qx = cx + (r() - 0.5) * W * 0.62,
          qy = cy + (r() - 0.5) * H * 0.6 - sq / 2;
        const srcSize = Math.max(6, sq / zoom); // región fuente (más pequeña = más zoom)
        const sxC = cx + (r() - 0.5) * scale * 0.95,
          syC = cy + (r() - 0.5) * scale * 0.95;
        const sx = Math.max(0, Math.min(W - srcSize, sxC - srcSize / 2)),
          sy = Math.max(0, Math.min(H - srcSize, syC - srcSize / 2));
        try {
          ctx!.drawImage(cv!, sx, sy, srcSize, srcSize, qx, qy, sq, sq); // zoom de la imagen
        } catch (e) {
          /* drawImage puede fallar si la región es inválida */
        }
        ctx!.strokeStyle = 'rgba(236,238,245,.6)';
        ctx!.lineWidth = Math.max(1, dpr * 0.8);
        ctx!.strokeRect(qx, qy, sq, sq);
        ctx!.strokeStyle = 'rgba(236,238,245,.25)';
        ctx!.lineWidth = dpr * 0.6; // conector a la región fuente
        ctx!.beginPath();
        ctx!.moveTo(sxC, syC);
        ctx!.lineTo(qx + sq / 2, qy + sq / 2);
        ctx!.stroke();
        ctx!.strokeStyle = 'rgba(236,238,245,.7)';
        ctx!.strokeRect(sx, sy, srcSize, srcSize); // marca de qué se está magnificando
      }
      ctx!.imageSmoothingEnabled = true;
    }

    // HUD científico (matriz de datos + análisis pixelado + estado)
    function updateHUD() {
      const hd = hudDataRef.current;
      if (hd) {
        const r = mulberry32((seedRef.current ^ 0x9e3779b9) >>> 0);
        let str = '';
        for (let y = 0; y < 11; y++) {
          let row = '';
          for (let x = 0; x < 4; x++) {
            const v = (r() * 2 - 1).toFixed(4);
            row += (+v >= 0 ? '+' : '') + v + '  ';
          }
          str += row + '\n';
        }
        hd.textContent = str;
      }
      const hp = hudPixRef.current;
      if (hp) {
        const r = mulberry32((seedRef.current * 7 + 1) >>> 0);
        let h = '';
        for (let i = 0; i < 64; i++) {
          const k = r();
          const c =
            k > 0.86
              ? 'rgba(31,61,240,.9)'
              : k > 0.66
                ? 'rgba(184,168,136,.8)'
                : k > 0.34
                  ? 'rgba(122,176,110,.75)'
                  : 'transparent';
          h += `<span style="background:${c}"></span>`;
        }
        hp.innerHTML = h;
      }
      const hs = hudStatusRef.current;
      if (hs) hs.textContent = (playingRef.current ? 'creciendo…' : 'en pausa') + '  ·  semilla #' + seedRef.current;
    }

    // sliders → tween suave del estado mostrado (GSAP); 'arms' es entero e instantáneo
    function setTarget(k: Key, v: number) {
      if (k === 'arms') {
        disp.current.arms = v;
        if (!playingRef.current) drawSpiral();
        return;
      }
      if (smooth) {
        gsap.to(disp.current, {
          [k]: v,
          duration: 0.7,
          ease: 'power3.out',
          overwrite: 'auto',
          onUpdate: () => {
            if (!playingRef.current) drawSpiral();
          },
        });
      } else {
        disp.current[k] = v;
        if (!playingRef.current) drawSpiral();
      }
    }

    drawRef.current = drawSpiral;
    setTargetRef.current = setTarget;
    updateHUDRef.current = updateHUD;

    // loop: ticker de GSAP (independiente del frame-rate) o RAF de respaldo
    let rafId = 0;
    function frame() {
      if (playingRef.current) {
        const dr = smooth ? gsap.ticker.deltaRatio() : 1;
        phase.current += 0.014 * (disp.current.rot / 100) * dr;
      }
      drawSpiral();
    }
    function raf() {
      frame();
      rafId = requestAnimationFrame(raf);
    }

    // reducción de movimiento: arranca en pausa, sin loop
    if (reduceMotion) {
      playingRef.current = false;
      setPlaying(false);
    }

    drawSpiral();
    updateHUD();
    if (!reduceMotion) {
      if (smooth) gsap.ticker.add(frame);
      else raf();
    }

    const onResize = () => drawSpiral();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (smooth) gsap.ticker.remove(frame);
      if (rafId) cancelAnimationFrame(rafId);
      gsap.killTweensOf(disp.current);
    };
  }, []);

  // ---- handlers de UI ----
  function onSlider(k: Key, v: number) {
    setVals((prev) => ({ ...prev, [k]: v }));
    setTargetRef.current(k, v);
  }

  function togglePlay() {
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    announce(next ? 'Animación reanudada' : 'Animación en pausa');
    updateHUDRef.current();
  }

  function reseed() {
    const s = Math.floor(Math.random() * 999999);
    seedRef.current = s;
    setSeed(s);
    $seed.set(s);
    if (typeof SimplexNoise !== 'undefined') simplexRef.current = new SimplexNoise(String(s));
    updateHUDRef.current();
    if (!playingRef.current) drawRef.current();
  }

  function savePng() {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement('a');
    a.download = 'espiral-' + seedRef.current + '.png';
    a.href = cv.toDataURL('image/png');
    a.click();
  }

  function toggleCtrls() {
    setCtrlsOpen((open) => {
      const next = !open;
      announce(next ? 'Consola de parámetros visible' : 'Consola oculta');
      return next;
    });
  }

  return (
    <div className="stage" id="stage">
      <canvas
        ref={canvasRef}
        id="spiral"
        role="img"
        aria-label="Espécimen generativo: campo de tallos bioluminiscentes que crecen sobre fondo oscuro, con nube de partículas y cajas wireframe, en animación continua"
      />
      <button
        className="ctrls-toggle"
        id="ctrlsToggle"
        type="button"
        aria-expanded={ctrlsOpen}
        aria-controls="ctrls"
        onClick={toggleCtrls}
      >
        {ctrlsOpen ? '⚙ ocultar' : '⚙ parámetros'}
      </button>
      <div className="stage-actions">
        <button
          className="btn"
          id="playBtn"
          type="button"
          aria-pressed={playing}
          aria-label={playing ? 'Pausar la animación' : 'Reanudar la animación'}
          onClick={togglePlay}
        >
          {playing ? '⏸ pausa' : '▶ play'}
        </button>
        <button className="btn" id="reseed" type="button" aria-label="Generar una nueva semilla aleatoria" onClick={reseed}>
          ↻ semilla
        </button>
        <button className="btn" id="savePng" type="button" aria-label="Descargar como imagen PNG" onClick={savePng}>
          ↧ png
        </button>
      </div>

      <div className="hud" aria-hidden="true">
        <div className="hud-title">
          Cyberplanta luminis<span className="hud-sub">espécimen generativo · v4</span>
        </div>
        <div className="hud-lines">
          | verde · azul = lo natural
          <br />| rojo señal = lo sintético / humano (mínimo)
          <br />| RGB en pantalla → CMYK al imprimir
        </div>
        <div className="hud-panels">
          <div className="hud-frame hud-img" id="hudImg" />
          <div className="hud-frame" id="hudPix" ref={hudPixRef} />
          <div className="hud-frame hud-data" id="hudData" ref={hudDataRef} />
        </div>
        <div className="hud-status" id="hudStatus" ref={hudStatusRef}>
          creciendo…
        </div>
      </div>

      <div className={ctrlsOpen ? 'ctrls' : 'ctrls collapsed'} id="ctrls">
        <div className="ctrls-head">parámetros · consola</div>
        {SLIDERS.map((s) => (
          <div className="ctrl" key={s.key}>
            <label htmlFor={s.id}>
              {s.label} <b>{vals[s.key]}</b>
            </label>
            <input
              type="range"
              id={s.id}
              min={s.min}
              max={s.max}
              value={vals[s.key]}
              aria-label={s.aria}
              onChange={(e) => onSlider(s.key, +e.target.value)}
            />
          </div>
        ))}
        <div className="seedline">
          semilla · <b>{seed === null ? '—' : '#' + seed}</b>
          <br />
          <span style={{ color: 'rgba(255,255,255,.4)' }}>determinista · reproducible</span>
        </div>
      </div>
    </div>
  );
}
