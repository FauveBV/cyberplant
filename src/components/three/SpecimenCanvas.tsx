import { memo } from 'react';
import { Canvas } from '@react-three/fiber';
import type { WebGLRenderer } from 'three';
import { type Params } from '../../lib/specimen';
import ParticleField from './ParticleField';
import Effects from './Effects';
import PerfGuard from './PerfGuard';

// props estables (literales fuera del render para no reconfigurar R3F)
const CAMERA = { position: [0, 0, 3.2] as [number, number, number], fov: 50 };
const GL = { preserveDrawingBuffer: true, antialias: true };
const DPR: [number, number] = [1, 2];

export interface SpecimenCanvasProps {
  paramsRef: React.RefObject<Params>;
  playingRef: React.RefObject<boolean>;
  timeRef: React.RefObject<number>;
  glRef: React.RefObject<WebGLRenderer | null>;
  seedRef: React.RefObject<number>;
  onLowPerf: () => void; // baja a tier 'lite' si el FPS es bajo
  perfGuardEnabled: boolean; // false si el tier fue elegido a mano
}

// Canvas 3D aislado y memoizado: TODAS sus props son refs estables → se monta una sola vez y
// nunca se re-renderiza desde afuera (clave: el EffectComposer no tolera re-montarse).
// Vive en su propio chunk: se importa con lazy() sólo en tier 'full' (mobile/lite no baja three).
function SpecimenCanvas({
  paramsRef,
  playingRef,
  timeRef,
  glRef,
  seedRef,
  onLowPerf,
  perfGuardEnabled,
}: SpecimenCanvasProps) {
  return (
    <Canvas
      dpr={DPR}
      camera={CAMERA}
      gl={GL}
      onCreated={(state) => {
        glRef.current = state.gl;
      }}
    >
      <color attach="background" args={['#04050a']} />
      <ParticleField params={paramsRef.current} playingRef={playingRef} seedRef={seedRef} timeRef={timeRef} />
      <Effects params={paramsRef.current} />
      <PerfGuard onLow={onLowPerf} enabled={perfGuardEnabled} />
    </Canvas>
  );
}

export default memo(SpecimenCanvas);
