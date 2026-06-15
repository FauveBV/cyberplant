import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface Props {
  onLow: () => void; // se llama una vez si el FPS promedio es bajo
  enabled: boolean; // false si el tier fue elegido manualmente (no degradar)
}

// Mide el FPS del render 3D tras un warmup; si está sostenidamente bajo, dispara onLow()
// para que el wrapper baje a tier 'lite' (2D). Mide una sola vez.
export default function PerfGuard({ onLow, enabled }: Props) {
  const t = useRef(0); // tiempo acumulado
  const frames = useRef(0); // frames contados tras el warmup
  const done = useRef(false);

  const WARMUP = 1.0; // s ignorados al inicio (carga/jank)
  const WINDOW = 2.5; // s de medición
  const MIN_FPS = 24; // por debajo → degradar

  useFrame((_, delta) => {
    if (done.current || !enabled) return;
    t.current += delta;
    if (t.current < WARMUP) return;
    frames.current++;
    const elapsed = t.current - WARMUP;
    if (elapsed >= WINDOW) {
      done.current = true;
      const fps = frames.current / elapsed;
      if (fps < MIN_FPS) onLow();
    }
  });

  return null;
}
