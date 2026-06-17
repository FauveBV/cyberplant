/** Tipos del módulo de firma generativa (espécimen audio-reactivo). */

export type RGB = [number, number, number];

/** Paleta del eje humano↔natural + tintes de efecto. Derivada de tokens. */
export interface Palette {
  /** campo natural (orgánico): verde/azul */
  NAT: RGB[];
  /** campo humano-diseñado (sintético): gris/magenta */
  HUM: RGB[];
  /** voz · cálido/expresivo (rosa→naranja→magenta) */
  VOICE: RGB[];
  /** sintetizadores · eléctrico/frío (azules) */
  SYNTH: RGB[];
  /** tintes internos del efecto ambient (blanco·lila·verde pálido) */
  AMB: RGB[];
  /** fondo de la escena */
  BG: RGB;
}

/** Señales espectrales por frame (salida del análisis de audio). */
export interface AudioFeatures {
  /** nivel crudo 0..1 (banda completa) — para detectar silencio */
  level: number;
  /** flux espectral total (transientes) */
  flux: number;
  /** flux de agudos (snare/hi-hat) */
  hflux: number;
  /** centroide espectral 0..1 (brillo) */
  centroid: number;
  /** bandas normalizadas 0..1 (auto-rango por banda) */
  bands: { kick: number; voice: number; synth: number; high: number; all: number };
  /** bandas crudas (para sustain/ambient y umbral de silencio) */
  raw: { kick: number; voice: number; synth: number; all: number };
}

/** Lecturas en vivo para el medidor (calibración). */
export interface MeterFrame {
  kick: number;
  voice: number;
  synth: number;
  snare: number;
}

export type AudioSourceKind = 'mic' | 'system' | null;

export interface SignatureOptions {
  /** semilla determinista (mulberry32). Default 29. */
  seed?: number;
  /** respeta prefers-reduced-motion. Default: detectado. */
  reducedMotion?: boolean;
  /** paleta; default: derivada de los tokens del :root. */
  palette?: Palette;
}

export interface SignatureHandle {
  start(): void;
  stop(): void;
  destroy(): void;
  /** activa/cambia la fuente de audio. Devuelve la etiqueta o un error legible. */
  setAudioSource(kind: AudioSourceKind): Promise<{ ok: boolean; label: string }>;
  /** exporta el frame actual a PNG (descarga). */
  exportPNG(filename?: string): void;
  /** callback por frame con el medidor (opcional). */
  onMeter(cb: (m: MeterFrame) => void): void;
  readonly audioOn: boolean;
}
