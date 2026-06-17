import { useState } from 'react';
import styles from './Switch.module.css';

/**
 * Switch — toggle accesible (isla React). role="switch" + aria-checked,
 * teclado (Espacio/Enter). Controlado si se pasa `onChange`, si no autónomo.
 */
interface Props {
  label?: string;
  checked?: boolean;
  name?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export default function Switch({ label, checked, name, disabled, onChange }: Props) {
  const [internal, setInternal] = useState(checked ?? false);
  const isControlled = onChange !== undefined && checked !== undefined;
  const on = isControlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        name={name}
        disabled={disabled}
        className={styles.switch}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle();
          }
        }}
      />
      {label && <span>{label}</span>}
    </span>
  );
}
