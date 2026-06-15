import { useEffect } from 'react';
import gsap from 'gsap';
import { type Params, mulberry32 } from '../lib/specimen';

interface Props {
  paramsRef: React.RefObject<Params>;
  playingRef: React.RefObject<boolean>;
  seedRef: React.RefObject<number>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const PAL = [
  [31, 61, 240],
  [122, 176, 110],
  [184, 168, 136],
  [236, 238, 245],
];
const SIG = [212, 56, 13];

// Renderer 2D liviano (port del drawSpiral original): canvas 2D, sin WebGL ni post-proceso.
// Corre en mobile y equipos de bajos recursos. Glitch y cuadrados-lupa van incluidos en el dibujo.
export default function Specimen2D({ paramsRef, playingRef, seedRef, canvasRef }: Props) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const smooth = typeof gsap !== 'undefined';
    let phase = 0;
    let pix: HTMLCanvasElement | null = null;

    const rng = (i: number) => mulberry32(((seedRef.current * 131071) ^ (i * 2246822519)) >>> 0);
    const n2 = (x: number, y: number) => (Math.sin(x * 1.7) + Math.sin(y * 1.3)) * 0.5;

    function fit() {
      const r = cv!.getBoundingClientRect();
      cv!.width = Math.max(1, r.width * devicePixelRatio);
      cv!.height = Math.max(1, r.height * devicePixelRatio);
    }

    function draw() {
      fit();
      const d = paramsRef.current;
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
      const N = Math.floor(900 + ((dens - 80) / 820) * 4200);
      const rot = phase * 0.5,
        cR = Math.cos(rot),
        sR = Math.sin(rot),
        scale = Math.min(W, H) * 0.34;

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
        ctx!.fillStyle = `rgba(236,238,245,${0.05 + 0.1 * Math.abs(Math.sin(phase + i))})`;
        ctx!.fillRect(r() * W, r() * H, dpr, dpr);
      }

      // gránulos con ciclo de vida (nacen nítidos → crecen → se difuminan)
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
        const nf = 1.3 + turns * 0.55;
        const nz = n2(bx * nf + i * 0.0006, bz * nf + phase * 0.06);
        const ripple = 0.12 * Math.sin(by * turns * 0.9 + phase * 1.2);
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
        const life = (phase * 0.18 * (0.5 + 0.5 * r()) + off) % 1;
        const grow = Math.sin(life * Math.PI);
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

      // GLITCH: bajo-muestreo de la escena con bloques duros
      if (glitch > 0.02) {
        const pc = pix || (pix = document.createElement('canvas'));
        const p = pc.getContext('2d')!;
        const f = Math.max(0.04, 1 / (1 + glitch * 22));
        pc.width = Math.max(1, (W * f) | 0);
        pc.height = Math.max(1, (H * f) | 0);
        p.imageSmoothingEnabled = false;
        p.clearRect(0, 0, pc.width, pc.height);
        p.drawImage(cv!, 0, 0, pc.width, pc.height);
        ctx!.imageSmoothingEnabled = false;
        ctx!.drawImage(pc, 0, 0, pc.width, pc.height, 0, 0, W, H);
        ctx!.imageSmoothingEnabled = true;
      }

      // grafo de nodos
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

      // CUADRADOS-lupa: magnifican regiones (más cuadrados → más zoom)
      ctx!.imageSmoothingEnabled = false;
      const zoom = 2.0 + anchors * 0.85;
      for (let b = 0; b < anchors; b++) {
        const r = rng(40000 + b);
        const sq = Math.min(W, H) * (0.13 + r() * 0.05);
        const qx = cx + (r() - 0.5) * W * 0.62,
          qy = cy + (r() - 0.5) * H * 0.6 - sq / 2;
        const srcSize = Math.max(6, sq / zoom);
        const sxC = cx + (r() - 0.5) * scale * 0.95,
          syC = cy + (r() - 0.5) * scale * 0.95;
        const sx = Math.max(0, Math.min(W - srcSize, sxC - srcSize / 2)),
          sy = Math.max(0, Math.min(H - srcSize, syC - srcSize / 2));
        try {
          ctx!.drawImage(cv!, sx, sy, srcSize, srcSize, qx, qy, sq, sq);
        } catch (e) {
          /* región inválida */
        }
        ctx!.strokeStyle = 'rgba(236,238,245,.6)';
        ctx!.lineWidth = Math.max(1, dpr * 0.8);
        ctx!.strokeRect(qx, qy, sq, sq);
        ctx!.strokeStyle = 'rgba(236,238,245,.25)';
        ctx!.lineWidth = dpr * 0.6;
        ctx!.beginPath();
        ctx!.moveTo(sxC, syC);
        ctx!.lineTo(qx + sq / 2, qy + sq / 2);
        ctx!.stroke();
        ctx!.strokeStyle = 'rgba(236,238,245,.7)';
        ctx!.strokeRect(sx, sy, srcSize, srcSize);
      }
      ctx!.imageSmoothingEnabled = true;
    }

    // dirty-check: si está en marcha dibuja cada frame; si está en pausa (o reduced-motion,
    // que arranca pausado), sólo redibuja cuando cambian parámetros/semilla.
    let rafId = 0;
    let lastKey = '';
    const snapshot = () => {
      const d = paramsRef.current;
      return `${seedRef.current}|${d.turns}|${d.rise}|${d.dens}|${d.glitch}|${d.org}|${d.morph}|${Math.round(d.arms)}`;
    };
    function frame() {
      let need = false;
      if (playingRef.current) {
        const dr = smooth ? gsap.ticker.deltaRatio() : 1;
        phase += 0.014 * (paramsRef.current.rot / 100) * dr;
        need = true;
      }
      const key = snapshot();
      if (key !== lastKey) {
        lastKey = key;
        need = true;
      }
      if (need) draw();
    }
    function raf() {
      frame();
      rafId = requestAnimationFrame(raf);
    }

    draw();
    lastKey = snapshot();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    if (smooth) gsap.ticker.add(frame);
    else raf();

    return () => {
      window.removeEventListener('resize', onResize);
      if (smooth) gsap.ticker.remove(frame);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="spiral"
      role="img"
      aria-label="Espécimen generativo: nube de partículas bioluminiscentes que orbita sobre fondo oscuro, con cuadrados-lupa y glitch, en animación continua"
    />
  );
}
