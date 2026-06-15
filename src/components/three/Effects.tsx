import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Pixelation } from '@react-three/postprocessing';
import { type Params } from '../../lib/specimen';

// Post-procesado: Bloom = bioluminiscencia (slider org); Pixelation = glitch (slider glitch).
// (DOF de cámara no se usa: las partículas aditivas no escriben profundidad; el desenfoque
//  del ciclo de vida se hace por-partícula en el fragment shader.)
export default function Effects({ params }: { params: Params }) {
  const bloom = useRef<any>(null);
  const pix = useRef<any>(null);

  useFrame(() => {
    const org = params.org / 100;
    const g = params.glitch / 100;
    if (bloom.current) bloom.current.intensity = 0.5 + org * 1.8;
    if (pix.current) pix.current.granularity = g > 0.02 ? g * 12 : 0;
  });

  return (
    <EffectComposer>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.15} intensity={0.8} />
      <Pixelation ref={pix} granularity={4} />
    </EffectComposer>
  );
}
