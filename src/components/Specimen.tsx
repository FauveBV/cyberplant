import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import type { WebGLRenderer } from 'three';
import { type Key, type Params, SLIDERS, DEFAULTS, mulberry32, makeRng } from '../lib/specimen';
import { $seed } from '../stores/identity';
import { type Tier, detectTier, saveTier, savedTier } from '../lib/capability';
import Specimen2D from './Specimen2D';

// El Canvas 3D (con three/R3F/postprocessing) vive en su propio chunk y se carga SOLO en
// tier 'full' → mobile y equipos de bajos recursos (tier 'lite') nunca descargan three.
const SpecimenCanvas = lazy(() => import('./three/SpecimenCanvas'));

function announce(msg: string) {
  const el = document.getElementById('live');
  if (el) el.textContent = msg;
}

export default function Specimen() {
  const hudPixRef = useRef<HTMLDivElement>(null);
  const hudDataRef = useRef<HTMLDivElement>(null);
  const hudStatusRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const [vals, setVals] = useState<Params>({ ...DEFAULTS });
  const [playing, setPlaying] = useState(true);
  const [ctrlsOpen, setCtrlsOpen] = useState(true);
  const [seed, setSeed] = useState<number | null>(null);
  const [tier, setTier] = useState<Tier | null>(null); // null hasta detectar en cliente

  // estado del motor (sin re-render)
  const paramsRef = useRef<Params>({ ...DEFAULTS });
  const playingRef = useRef(true);
  const timeRef = useRef(0);
  const seedRef = useRef(0);
  const smoothRef = useRef(true);
  const glRef = useRef<WebGLRenderer | null>(null);
  const lite2dRef = useRef<HTMLCanvasElement | null>(null);
  const manualRef = useRef(false); // true si el tier fue elegido a mano → no auto-degradar por FPS

  // init: semilla, reduced-motion, consola según viewport
  useEffect(() => {
    const reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    smoothRef.current = !reduceMotion;
    if (reduceMotion) {
      playingRef.current = false;
      setPlaying(false);
    }
    const s = Math.floor(Math.random() * 999999);
    seedRef.current = s;
    setSeed(s);
    $seed.set(s);
    setCtrlsOpen(window.matchMedia('(min-width:721px)').matches);
    manualRef.current = savedTier() !== null; // hubo override manual guardado
    setTier(detectTier()); // 'full' (3D) o 'lite' (2D) según capacidad / override guardado
    updateHUD();
    return () => gsap.killTweensOf(paramsRef.current);
  }, []);

  // Lupas: overlay 2D que muestrea el canvas WebGL (ya post-procesado) y dibuja recortes
  // magnificados. El contenido refleja el glitch (el canvas ya viene pixelado); los marcos
  // son trazos del overlay → siempre nítidos, nunca afectados por el glitch.
  useEffect(() => {
    if (tier !== 'full') return; // las lupas-overlay solo en 3D; el 2D dibuja las suyas
    let raf = 0;
    const draw = () => {
      const ov = overlayRef.current;
      const src =
        glRef.current?.domElement ??
        (document.querySelector('#stage .stage-canvas canvas') as HTMLCanvasElement | null);
      if (src && ov) {
        const W = src.width,
          H = src.height;
        if (W && H) {
          if (ov.width !== W) ov.width = W;
          if (ov.height !== H) ov.height = H;
          const c = ov.getContext('2d');
          if (c) {
            c.clearRect(0, 0, W, H);
            const arms = Math.round(paramsRef.current.arms);
            const glitch = paramsRef.current.glitch / 100;
            const cx = W * 0.5,
              cy = H * 0.5,
              scale = Math.min(W, H);
            const zoom = 2.0 + arms * 0.85; // más cuadrados → más zoom
            const lw = Math.max(1, W * 0.0012);
            const rng = makeRng(seedRef.current);
            for (let b = 0; b < arms; b++) {
              const r = rng(40000 + b);
              const sq = scale * (0.13 + r() * 0.05);
              const qx = cx + (r() - 0.5) * W * 0.62;
              const qy = cy + (r() - 0.5) * H * 0.6 - sq / 2;
              const srcSize = Math.max(6, sq / zoom);
              const sxC = cx + (r() - 0.5) * scale * 0.95;
              const syC = cy + (r() - 0.5) * scale * 0.95;
              const sx = Math.max(0, Math.min(W - srcSize, sxC - srcSize / 2));
              const sy = Math.max(0, Math.min(H - srcSize, syC - srcSize / 2));
              // contenido magnificado: pixelado sólo si la escena está glitcheada
              c.imageSmoothingEnabled = !(glitch > 0.12);
              try {
                c.drawImage(src, sx, sy, srcSize, srcSize, qx, qy, sq, sq);
              } catch (e) {
                /* drawImage puede fallar con regiones inválidas */
              }
              // marco (nítido siempre; no depende del glitch)
              c.strokeStyle = 'rgba(237,237,237,.6)';
              c.lineWidth = lw;
              c.strokeRect(qx, qy, sq, sq);
              // ticks (handle) en esquina superior izquierda, verde marca
              c.strokeStyle = 'rgba(122,176,110,.9)';
              c.lineWidth = lw * 1.6;
              const t = sq * 0.18;
              c.beginPath();
              c.moveTo(qx, qy + t);
              c.lineTo(qx, qy);
              c.lineTo(qx + t, qy);
              c.stroke();
              // conector a la región fuente + marca de qué se magnifica
              c.strokeStyle = 'rgba(237,237,237,.22)';
              c.lineWidth = lw * 0.7;
              c.beginPath();
              c.moveTo(sxC, syC);
              c.lineTo(qx + sq / 2, qy + sq / 2);
              c.stroke();
              c.strokeStyle = 'rgba(237,237,237,.55)';
              c.strokeRect(sx, sy, srcSize, srcSize);
            }
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [tier]);

  // HUD científico (matriz de datos + análisis pixelado + estado) — idéntico al 2D
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
    if (hs)
      hs.textContent = (playingRef.current ? 'creciendo…' : 'en pausa') + '  ·  semilla #' + seedRef.current;
  }

  // sliders → tween suave de los params (GSAP); 'arms' es entero e instantáneo
  function setTarget(k: Key, v: number) {
    if (k === 'arms') {
      paramsRef.current.arms = v;
      return;
    }
    if (smoothRef.current) {
      gsap.to(paramsRef.current, { [k]: v, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
    } else {
      paramsRef.current[k] = v;
    }
  }

  function onSlider(k: Key, v: number) {
    setVals((prev) => ({ ...prev, [k]: v }));
    setTarget(k, v);
  }

  function togglePlay() {
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    announce(next ? 'Animación reanudada' : 'Animación en pausa');
    updateHUD();
  }

  function reseed() {
    const s = Math.floor(Math.random() * 999999);
    seedRef.current = s;
    setSeed(s);
    $seed.set(s);
    updateHUD();
  }

  function savePng() {
    const canvas = tier === 'lite' ? lite2dRef.current : (glRef.current?.domElement ?? null);
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'espiral-' + seedRef.current + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  function toggleCtrls() {
    setCtrlsOpen((open) => {
      const next = !open;
      announce(next ? 'Consola de parámetros visible' : 'Consola oculta');
      return next;
    });
  }

  // alterna manualmente entre 3D pleno y 2D liviano (persistido)
  function toggleTier() {
    manualRef.current = true; // elección explícita → el guard de FPS no vuelve a degradar
    setTier((cur) => {
      const next: Tier = cur === 'full' ? 'lite' : 'full';
      saveTier(next);
      announce(next === 'full' ? 'Modo pleno (3D) activado' : 'Modo ligero (2D) activado');
      return next;
    });
  }

  // auto-degradar a 2D si el FPS del 3D es bajo (solo si el tier fue automático).
  // useCallback: referencia estable → no rompe el memo de SpecimenCanvas (si no, cada
  // re-render de Specimen —p.ej. colapsar la consola o mover un slider— re-montaría el
  // EffectComposer y se perdería la animación).
  const onLowPerf = useCallback(() => {
    if (manualRef.current) return;
    setTier((cur) => {
      if (cur !== 'full') return cur;
      announce('Rendimiento bajo: cambiando a modo ligero (2D)');
      return 'lite';
    });
  }, []);

  return (
    <div className="stage" id="stage">
      {tier === 'full' && (
        <div
          className="stage-canvas"
          role="img"
          aria-label="Espécimen generativo: nube de partículas bioluminiscentes en 3D que orbita y cambia con el tiempo, con paneles lupa y glitch, en animación continua"
        >
          <Suspense fallback={null}>
            <SpecimenCanvas
              paramsRef={paramsRef}
              playingRef={playingRef}
              timeRef={timeRef}
              glRef={glRef}
              seedRef={seedRef}
              onLowPerf={onLowPerf}
              perfGuardEnabled={!manualRef.current}
            />
          </Suspense>
        </div>
      )}
      {tier === 'lite' && (
        <Specimen2D
          paramsRef={paramsRef}
          playingRef={playingRef}
          seedRef={seedRef}
          canvasRef={lite2dRef}
        />
      )}
      {tier === 'full' && <canvas ref={overlayRef} className="mag-overlay" aria-hidden="true" />}

      <motion.button
        className="ctrls-toggle"
        id="ctrlsToggle"
        type="button"
        aria-expanded={ctrlsOpen}
        aria-controls="ctrls"
        onClick={toggleCtrls}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        {ctrlsOpen ? '⚙ ocultar' : '⚙ parámetros'}
      </motion.button>

      <div className="stage-actions">
        <motion.button
          className="btn"
          id="playBtn"
          type="button"
          aria-pressed={playing}
          aria-label={playing ? 'Pausar la animación' : 'Reanudar la animación'}
          onClick={togglePlay}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          {playing ? '⏸ pausa' : '▶ play'}
        </motion.button>
        <motion.button
          className="btn"
          id="reseed"
          type="button"
          aria-label="Generar una nueva semilla aleatoria"
          onClick={reseed}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95, rotate: -8 }}
        >
          ↻ semilla
        </motion.button>
        <motion.button
          className="btn"
          id="savePng"
          type="button"
          aria-label="Descargar como imagen PNG"
          onClick={savePng}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          ↧ png
        </motion.button>
        {tier && (
          <motion.button
            className="btn"
            id="tierBtn"
            type="button"
            aria-pressed={tier === 'lite'}
            aria-label={
              tier === 'full'
                ? 'Cambiar a modo ligero 2D, para equipos de bajos recursos'
                : 'Cambiar a modo pleno 3D'
            }
            onClick={toggleTier}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            {tier === 'full' ? '◆ pleno' : '◇ ligero'}
          </motion.button>
        )}
      </div>

      <div className="hud" aria-hidden="true">
        <div className="hud-title">
          Cyberplanta luminis<span className="hud-sub">espécimen generativo · v5</span>
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

      <AnimatePresence>
        {ctrlsOpen && (
          <motion.div
            className="ctrls"
            id="ctrls"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
