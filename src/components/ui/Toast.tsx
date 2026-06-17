import { useRef, useState } from 'react';
import styles from './Toast.module.css';

/** Toast — aviso efímero auto-descartable (isla React). aria-live=polite. */
interface Props {
  message?: string;
  label?: string;
  duration?: number;
}

export default function Toast({ message = 'Tokens copiados ✓', label = 'mostrar toast', duration = 3000 }: Props) {
  const [items, setItems] = useState<number[]>([]);
  const id = useRef(0);
  const push = () => {
    const k = ++id.current;
    setItems((s) => [...s, k]);
    setTimeout(() => setItems((s) => s.filter((x) => x !== k)), duration);
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={push}>
        {label}
      </button>
      <div className={styles.stack} aria-live="polite">
        {items.map((k) => (
          <div key={k} className={styles.toast} role="status">
            <span className={styles.bar} aria-hidden="true" />
            <span>{message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
