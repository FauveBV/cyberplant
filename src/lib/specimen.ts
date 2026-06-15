// Definiciones compartidas del espécimen (isla DOM + componentes R3F).

export type Key = 'arms' | 'turns' | 'rise' | 'dens' | 'glitch' | 'org' | 'rot' | 'morph';

export const SLIDERS: {
  key: Key;
  id: string;
  label: string;
  min: number;
  max: number;
  def: number;
  aria: string;
}[] = [
  { key: 'arms', id: 'pArms', label: 'Cuadrados · zoom', min: 1, max: 8, def: 4, aria: 'Cuadrados-lupa: cantidad y nivel de zoom' },
  { key: 'turns', id: 'pTurns', label: 'Ondulación · turbulencia', min: 2, max: 14, def: 5, aria: 'Ondulación / turbulencia de la superficie' },
  { key: 'rise', id: 'pRise', label: 'Altura', min: 0, max: 100, def: 60, aria: 'Altura de los tallos' },
  { key: 'dens', id: 'pDens', label: 'Densidad', min: 80, max: 900, def: 560, aria: 'Densidad del campo' },
  { key: 'glitch', id: 'pGlitch', label: 'Glitch', min: 0, max: 100, def: 18, aria: 'Intensidad de glitch' },
  { key: 'org', id: 'pOrg', label: 'Bioluminiscencia', min: 0, max: 100, def: 48, aria: 'Bioluminiscencia / glow' },
  { key: 'rot', id: 'pRot', label: 'Viento', min: 0, max: 100, def: 30, aria: 'Velocidad del viento' },
  { key: 'morph', id: 'pMorph', label: 'Morfología · humano→natural', min: 0, max: 100, def: 40, aria: 'Morfología: de geométrico (humano) a orgánico (natural)' },
];

export type Params = Record<Key, number>;

export const DEFAULTS: Params = SLIDERS.reduce((o, s) => ((o[s.key] = s.def), o), {} as Params);

// número máximo de partículas reservadas (la densidad activa una fracción vía uActive)
export const N_MAX = 5100;

// PRNG determinista (idéntico al espécimen 2D original)
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// rng por elemento estable por semilla (mismo mapeo que el original)
export function makeRng(seed: number) {
  return (i: number) => mulberry32(((seed * 131071) ^ (i * 2246822519)) >>> 0);
}

// fracción activa de partículas según el slider de densidad (80..900 → 900..5100 / N_MAX)
export function densActive(dens: number) {
  const n = Math.floor(900 + ((dens - 80) / 820) * 4200);
  return Math.min(1, Math.max(0, n / N_MAX));
}
