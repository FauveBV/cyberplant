import type { AudioFeatures } from './types';

type Band = { lo: number; hi: number };

/**
 * Fuente y análisis de audio del espécimen.
 * Micrófono (ambiental) o audio del sistema (getDisplayMedia).
 * Extrae features por banda en Hz con auto-normalización (rango dinámico).
 * Portado 1:1 desde wallpaper.html (band/norm/flux/centroid).
 */
export class SignatureAudio {
  analyser: AnalyserNode | null = null;
  audioOn = false;
  label = '';
  SR = 44100;

  private actx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private freq: Uint8Array | null = null;
  private prevMag: Uint8Array | null = null;
  private nz: Record<'all' | 'bass' | 'voice' | 'synth' | 'high', Band> = {
    all: { lo: 0, hi: 0.05 },
    bass: { lo: 0, hi: 0.05 },
    voice: { lo: 0, hi: 0.05 },
    synth: { lo: 0, hi: 0.05 },
    high: { lo: 0, hi: 0.05 },
  };

  async enableMic(): Promise<{ ok: boolean; label: string }> {
    if (this.audioOn) return { ok: true, label: this.label };
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      this.start(s, 'micrófono · ambiental');
      return { ok: true, label: this.label };
    } catch {
      return { ok: false, label: 'micrófono no disponible' };
    }
  }

  async enableSystem(): Promise<{ ok: boolean; label: string }> {
    if (this.audioOn) return { ok: true, label: this.label };
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      if (!s.getAudioTracks().length) {
        s.getTracks().forEach((t) => t.stop());
        return { ok: false, label: 'sin pista de audio — marcá «compartir audio»' };
      }
      s.getVideoTracks().forEach((t) => t.stop()); // no necesitamos el video
      this.start(s, 'audio del sistema');
      return { ok: true, label: this.label };
    } catch {
      return { ok: false, label: 'captura cancelada' };
    }
  }

  stop(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.actx?.close().catch(() => {});
    this.analyser = null;
    this.freq = null;
    this.prevMag = null;
    this.audioOn = false;
    this.label = '';
    this.stream = null;
    this.actx = null;
  }

  private start(stream: MediaStream, label: string): void {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.actx = new AC();
    if (this.actx.state === 'suspended') this.actx.resume();
    const src = this.actx.createMediaStreamSource(stream);
    this.analyser = this.actx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.55;
    this.SR = this.actx.sampleRate || 44100;
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.prevMag = new Uint8Array(this.analyser.frequencyBinCount);
    src.connect(this.analyser);
    this.stream = stream;
    this.audioOn = true;
    this.label = label;
  }

  /** energía media (0..1) de una banda en Hz */
  private band(loHz: number, hiHz: number): number {
    const freq = this.freq!;
    const bh = this.SR / this.analyser!.fftSize;
    const a = Math.max(0, Math.floor(loHz / bh));
    const b = Math.min(freq.length - 1, Math.ceil(hiHz / bh));
    let s = 0;
    let c = 0;
    for (let i = a; i <= b; i++) {
      s += freq[i];
      c++;
    }
    return c ? s / (c * 255) : 0;
  }

  /** normaliza con piso/techo móviles → aprovecha todo el rango dinámico */
  private norm(v: number, st: Band): number {
    st.lo += (v - st.lo) * (v < st.lo ? 0.25 : 0.004);
    st.hi += (v - st.hi) * (v > st.hi ? 0.5 : 0.012);
    const d = st.hi - st.lo;
    return d > 0.0008 ? Math.max(0, Math.min(1, (v - st.lo) / d)) : 0;
  }

  /** lee y devuelve las features del frame; null si no hay audio activo */
  read(): AudioFeatures | null {
    if (!(this.audioOn && this.analyser && this.freq)) return null;
    const freq = this.freq;
    // cast: el tipo DOM exige Uint8Array<ArrayBuffer> (TS 5.7); runtime correcto.
    this.analyser.getByteFrequencyData(freq as Uint8Array<ArrayBuffer>);
    const nb = freq.length;
    let flux = 0;
    let hflux = 0;
    let cen = 0;
    let mag = 0;
    const hcut = Math.floor(nb * 0.55);
    for (let i = 0; i < nb; i++) {
      const v = freq[i];
      cen += i * v;
      mag += v;
      if (this.prevMag) {
        const d = v - this.prevMag[i];
        if (d > 0) {
          flux += d;
          if (i > hcut) hflux += d;
        }
      }
    }
    if (this.prevMag) for (let i = 0; i < nb; i++) this.prevMag[i] = freq[i];
    flux /= nb * 255;
    hflux /= (nb - hcut) * 255;
    const centroid = mag > 0 ? cen / mag / nb : 0.5;

    const kRaw = this.band(40, 150);
    const vRaw = this.band(180, 900);
    const syRaw = this.band(900, 4000);
    const hRaw = this.band(4000, 13000);
    const aRaw = this.band(40, 13000);

    return {
      level: aRaw,
      flux,
      hflux,
      centroid,
      bands: {
        kick: this.norm(kRaw, this.nz.bass),
        voice: this.norm(vRaw, this.nz.voice),
        synth: this.norm(syRaw, this.nz.synth),
        high: this.norm(hRaw, this.nz.high),
        all: this.norm(aRaw, this.nz.all),
      },
      raw: { kick: kRaw, voice: vRaw, synth: syRaw, all: aRaw },
    };
  }
}
