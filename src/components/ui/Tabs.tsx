import { useId, useRef, useState } from 'react';
import styles from './Tabs.module.css';

/** Tabs — pestañas accesibles (isla React). Roles ARIA + navegación con flechas. */
interface Tab {
  label: string;
  content: string;
}

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };

  return (
    <div>
      <div className={styles.tabs} role="tablist">
        {tabs.map((t, i) => (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${base}-t${i}`}
            aria-selected={active === i}
            aria-controls={`${base}-p${i}`}
            tabIndex={active === i ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${base}-p${i}`}
          aria-labelledby={`${base}-t${i}`}
          hidden={active !== i}
          className={styles.panel}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
