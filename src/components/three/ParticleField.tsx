import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type Params, N_MAX, makeRng, densActive, DEFAULTS } from '../../lib/specimen';
import { SNOISE } from './glsl';

// paleta de marca: azul · verde · mineral · blanco + señal (idéntica al 2D)
const PAL = [
  [31, 61, 240],
  [122, 176, 110],
  [184, 168, 136],
  [236, 238, 245],
];
const SIG = [212, 56, 13];

const VERT = /* glsl */ `
  precision highp float;
  uniform float uTime, uTurns, uRise, uOrg, uMorph, uActive, uScale;
  attribute float aBase, aLifeOff, aLifeSpeed, aIdx, aNoiseOff;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  ${SNOISE}
  void main(){
    // densidad: oculta partículas por encima de la fracción activa
    if (aIdx > uActive){ gl_Position = vec4(2.0,2.0,2.0,1.0); gl_PointSize = 0.0; vAlpha = 0.0; vColor = vec3(0.0); return; }
    vec3 d = position;                                  // dirección base en la esfera
    float nf = 1.3 + uTurns * 0.55;                     // turbulencia = frecuencia
    float nz = snoise(vec2(d.x*nf + aNoiseOff, d.z*nf + uTime*0.06));
    float ripple = 0.12 * sin(d.y*uTurns*0.9 + uTime*1.2);
    float rad = aBase * (0.5 + (0.5 + 1.3*uMorph)*abs(nz)) * (1.0 + ripple);
    vec3 pos = vec3(d.x*rad, d.y*rad*(0.8 + uRise), d.z*rad);
    float a = uTime * 0.5;                              // órbita en Y
    float c = cos(a), s = sin(a);
    pos = vec3(pos.x*c - pos.z*s, pos.y, pos.x*s + pos.z*c);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float life = fract(uTime*0.18*aLifeSpeed + aLifeOff);
    float grow = sin(life * 3.14159265);               // nace, crece, se disuelve
    gl_PointSize = (0.6 + grow*grow*(2.0 + uOrg*9.0)) * uScale / max(0.15, -mv.z);
    vColor = aColor;
    vAlpha = clamp(grow, 0.0, 1.0) * (0.4 + 0.6*clamp(grow, 0.0, 1.0));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uOrg;
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    // gránulo redondo blando: el crecido es más grande y borroso (profundidad de campo por partícula)
    float dd = length(gl_PointCoord - 0.5);
    if (dd > 0.5) discard;
    float a = smoothstep(0.5, 0.0, dd) * vAlpha;
    if (a <= 0.001) discard;
    gl_FragColor = vec4(vColor * (0.55 + uOrg*0.7), a);
  }
`;

interface Props {
  params: Params; // objeto mutable (tweens con gsap); se lee cada frame
  playingRef: React.RefObject<boolean>;
  seedRef: React.RefObject<number>; // semilla por ref (no re-renderiza el Canvas; ver Specimen)
  timeRef: React.RefObject<number>;
}

export default function ParticleField({ params, playingRef, seedRef, timeRef }: Props) {
  // la semilla se sincroniza por ref → estado interno (re-render local, NO del Canvas/EffectComposer)
  const [seed, setSeed] = useState(seedRef.current);

  // atributos deterministas por semilla (regenerados al cambiar la semilla)
  const geometry = useMemo(() => {
    const rng = makeRng(seed);
    const pos = new Float32Array(N_MAX * 3);
    const aBase = new Float32Array(N_MAX);
    const aLifeOff = new Float32Array(N_MAX);
    const aLifeSpeed = new Float32Array(N_MAX);
    const aColor = new Float32Array(N_MAX * 3);
    const aIdx = new Float32Array(N_MAX);
    const aNoiseOff = new Float32Array(N_MAX);
    for (let i = 0; i < N_MAX; i++) {
      const r = rng(i);
      const u = r() * 2 - 1,
        th = r() * Math.PI * 2,
        rr = Math.cbrt(r());
      pos[i * 3] = Math.sqrt(1 - u * u) * Math.cos(th);
      pos[i * 3 + 1] = u;
      pos[i * 3 + 2] = Math.sqrt(1 - u * u) * Math.sin(th);
      aBase[i] = rr;
      aLifeOff[i] = r();
      aLifeSpeed[i] = 0.5 + 0.5 * r();
      const k = r();
      const col = k > 0.97 ? SIG : PAL[(k * PAL.length) | 0];
      aColor[i * 3] = col[0] / 255;
      aColor[i * 3 + 1] = col[1] / 255;
      aColor[i * 3 + 2] = col[2] / 255;
      aIdx[i] = i / N_MAX;
      aNoiseOff[i] = i * 0.0006;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aBase', new THREE.BufferAttribute(aBase, 1));
    g.setAttribute('aLifeOff', new THREE.BufferAttribute(aLifeOff, 1));
    g.setAttribute('aLifeSpeed', new THREE.BufferAttribute(aLifeSpeed, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
    g.setAttribute('aIdx', new THREE.BufferAttribute(aIdx, 1));
    g.setAttribute('aNoiseOff', new THREE.BufferAttribute(aNoiseOff, 1));
    return g;
  }, [seed]);

  const uniforms = useRef({
    uTime: { value: 0 },
    uTurns: { value: DEFAULTS.turns },
    uRise: { value: DEFAULTS.rise / 100 },
    uOrg: { value: DEFAULTS.org / 100 },
    uMorph: { value: DEFAULTS.morph / 100 },
    uActive: { value: densActive(DEFAULTS.dens) },
    uScale: { value: 14.0 },
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: uniforms.current,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
      }),
    []
  );

  useFrame((state, delta) => {
    if (seedRef.current !== seed) setSeed(seedRef.current); // reseed → reconstruye geometría (re-render local)
    if (playingRef.current) timeRef.current += delta * 0.84 * (params.rot / 100);
    const u = uniforms.current;
    u.uTime.value = timeRef.current;
    u.uTurns.value = params.turns;
    u.uRise.value = params.rise / 100;
    u.uOrg.value = params.org / 100;
    u.uMorph.value = params.morph / 100;
    u.uActive.value = densActive(params.dens);
    u.uScale.value = state.gl.domElement.height * 0.006;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
