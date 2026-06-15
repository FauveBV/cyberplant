import { useEffect, useState } from 'react';

// eje humano↔natural: gris humano (#6f6f6a) → verde natural (selva) mezclado por el eje.
const HUMANO = [111, 111, 106];
const NATURAL = [90, 139, 90];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hex = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

export default function AxisSlider() {
  const [value, setValue] = useState(22);

  const t = value / 100;
  const r = lerp(HUMANO[0], NATURAL[0], t);
  const g = lerp(HUMANO[1], NATURAL[1], t);
  const b = lerp(HUMANO[2], NATURAL[2], t);
  const acc = '#' + hex(r) + hex(g) + hex(b);
  const mode = t < 0.33 ? 'humano-dominante' : t < 0.66 ? 'tensión activa' : 'natural-dominante';

  // los swatches se reproporcionan: el gris humano cede, verde y azul natural crecen
  const flex0 = (6 - 4 * t).toFixed(2);
  const flex1 = (1 + 2 * t).toFixed(2);
  const flex2 = (1 + 2.4 * t).toFixed(2);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--accent', acc);
    root.setProperty('--warmth', String(value));
    root.setProperty('--grow', (t * 0.6).toFixed(3));
  }, [value, acc, t]);

  return (
    <div className="axisbox">
      <div className="axislabels">
        <span className="l">◄ humano / diseñado</span>
        <span className="r">natural / valdiviana ►</span>
      </div>
      <input
        type="range"
        id="warmth"
        min={0}
        max={100}
        value={value}
        aria-label="Eje: de humano/diseñado a natural"
        onChange={(e) => setValue(+e.target.value)}
      />
      <div className="axisread">
        <span>
          posición · <b>{value}</b>/100
        </span>
        <span>
          modo · <b>{mode}</b>
        </span>
        <span>
          acento · <b>{acc}</b>
        </span>
      </div>
      <div className="swatchrow">
        <div style={{ background: '#6f6f6a', flex: flex0 }} />
        <div style={{ background: 'var(--moss)', flex: flex1 }} />
        <div style={{ background: 'var(--blue)', flex: flex2 }} />
      </div>
    </div>
  );
}
