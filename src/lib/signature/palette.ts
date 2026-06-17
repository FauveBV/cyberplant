import type { Palette, RGB } from './types';

/** hex (#rrggbb) → [r,g,b] */
function hx(h: string): RGB {
  h = h.replace('#', '').trim();
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** aclara un color hacia blanco (k 0..1) */
function lighten(c: RGB, k: number): RGB {
  return [
    Math.round(c[0] + (255 - c[0]) * k),
    Math.round(c[1] + (255 - c[1]) * k),
    Math.round(c[2] + (255 - c[2]) * k),
  ];
}

/** lee un token de color del :root (CSS var). Fallback si no hay DOM o el token falta. */
function token(name: string, fallback: string): RGB {
  if (typeof document !== 'undefined') {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (v && v.startsWith('#')) return hx(v);
  }
  return hx(fallback);
}

/**
 * Paleta del espécimen derivada de los tokens del proyecto (única fuente).
 * Sin hex de marca hardcodeados: todo sale de las CSS vars del :root.
 * (Los fallbacks reflejan los tokens, por si corre sin DOM.)
 */
export function paletteFromTokens(): Palette {
  const blue = token('--blue', '#1f3df0');
  const cblue = token('--c-blue-text', '#5b78ff');
  const moss = token('--moss', '#5a6b4d');
  const cmoss = token('--c-moss-text', '#7d9169');
  const mineral = token('--mineral', '#b8a888');
  const stem = token('--bio-stem', '#5e9a6a');
  const line = token('--line', '#ededed');
  const muted = token('--muted', '#8a857c');
  const txt = token('--txt', '#cfcfca');
  const mag = token('--bio-magenta', '#ff3dc4');
  const pink = token('--bio-pink', '#ff6fb3');
  const orange = token('--bio-orange', '#ff8a3d');
  const bg = token('--bg', '#0a0a0a');

  return {
    NAT: [stem, cmoss, cblue, mineral, moss, cblue],
    HUM: [line, muted, mag, txt, line, mag],
    VOICE: [pink, orange, mag],
    // 3er azul = c-blue-text aclarado (preserva el azul claro del original sin hex suelto)
    SYNTH: [cblue, lighten(cblue, 0.4), blue],
    // tintes del efecto ambient (no son colores de marca): blanco · lila · verde pálido
    AMB: [
      [235, 235, 255],
      [200, 180, 255],
      [185, 235, 205],
    ],
    BG: bg,
  };
}
