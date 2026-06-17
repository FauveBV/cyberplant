import { useId, useState } from 'react';
import styles from './Accordion.module.css';

/** Accordion — secciones colapsables (isla React). aria-expanded + region. */
interface Item {
  title: string;
  content: string;
}

export default function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number[]>([0]);
  const base = useId();
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));

  return (
    <div className={styles.acc}>
      {items.map((it, i) => {
        const isOpen = open.includes(i);
        return (
          <div className={styles.item} key={i}>
            <button
              className={styles.head}
              aria-expanded={isOpen}
              aria-controls={`${base}-${i}`}
              onClick={() => toggle(i)}
            >
              <span>{it.title}</span>
              <span aria-hidden="true">{isOpen ? '–' : '+'}</span>
            </button>
            <div id={`${base}-${i}`} role="region" hidden={!isOpen} className={styles.panel}>
              {it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
