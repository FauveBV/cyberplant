// Detección de capacidad para elegir el renderer del espécimen: 3D pleno vs 2D liviano.

export type Tier = 'full' | 'lite';

const STORE_KEY = 'cyberplant-tier';

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function savedTier(): Tier | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v === 'full' || v === 'lite' ? v : null;
  } catch {
    return null;
  }
}

export function saveTier(t: Tier) {
  try {
    localStorage.setItem(STORE_KEY, t);
  } catch {
    /* almacenamiento no disponible */
  }
}

// Elige tier automáticamente. El override manual (localStorage) tiene prioridad.
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'lite';

  const manual = savedTier();
  if (manual) return manual;

  const mm = window.matchMedia;
  if (mm && mm('(prefers-reduced-motion: reduce)').matches) return 'lite';
  if (!hasWebGL()) return 'lite';
  if (mm && (mm('(max-width: 720px)').matches || mm('(pointer: coarse)').matches)) return 'lite';

  const cores = navigator.hardwareConcurrency || 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (cores <= 2 || mem <= 2) return 'lite';

  return 'full';
}
