import { SignatureEngine } from './engine';
import { SignatureAudio } from './audio';
import { paletteFromTokens } from './palette';
import type { AudioSourceKind, MeterFrame, SignatureHandle, SignatureOptions } from './types';

/**
 * Firma generativa de cyberplant — módulo reutilizable (web + wallpaper del deck).
 * Canvas 2D, sin libs. Paleta derivada de tokens; audio opcional (mic/sistema).
 *
 *   const sig = createSignature(canvas);
 *   sig.start();
 *   await sig.setAudioSource('mic');   // o 'system' · null
 *   sig.exportPNG();                    // tecla S / feh del deck
 */
export function createSignature(canvas: HTMLCanvasElement, opts: SignatureOptions = {}): SignatureHandle {
  const reduced =
    opts.reducedMotion ?? (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion:reduce)').matches);
  const palette = opts.palette ?? paletteFromTokens();
  const audio = new SignatureAudio();
  const engine = new SignatureEngine(canvas, palette, { reducedMotion: !!reduced, seed: opts.seed });
  engine.setFeaturesProvider(() => audio.read());

  let resizeT: number | undefined;
  const onResize = () => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(() => engine.size(), 150);
  };
  window.addEventListener('resize', onResize);

  return {
    start: () => engine.start(),
    stop: () => engine.stop(),
    destroy: () => {
      engine.stop();
      audio.stop();
      window.removeEventListener('resize', onResize);
    },
    async setAudioSource(kind: AudioSourceKind) {
      if (kind === 'mic') return audio.enableMic();
      if (kind === 'system') return audio.enableSystem();
      audio.stop();
      return { ok: true, label: '' };
    },
    exportPNG: (filename?: string) => engine.exportPNG(filename),
    onMeter: (cb: (m: MeterFrame) => void) => engine.onMeter(cb),
    get audioOn() {
      return audio.audioOn;
    },
  };
}

export { paletteFromTokens } from './palette';
export type { AudioSourceKind, MeterFrame, Palette, SignatureHandle, SignatureOptions } from './types';
