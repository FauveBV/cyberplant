import { useId, useRef } from 'react';
import styles from './Modal.module.css';

/** Modal / Dialog — usa <dialog> nativo (foco atrapado + Esc + backdrop). */
interface Props {
  triggerLabel: string;
  title: string;
  body: string;
  confirmLabel?: string;
}

export default function Modal({ triggerLabel, title, body, confirmLabel = 'confirmar' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" className={`${styles.btnBase} ${styles.trigger}`} onClick={() => ref.current?.showModal()}>
        {triggerLabel}
      </button>
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === ref.current) close(); // click en backdrop
        }}
      >
        <div className={styles.head}>
          <span id={titleId}>{title}</span>
          <button className={styles.x} aria-label="cerrar" onClick={close}>
            ×
          </button>
        </div>
        <div className={styles.body}>{body}</div>
        <div className={styles.foot}>
          <button className={`${styles.btnBase} ${styles.ghost}`} onClick={close}>
            cancelar
          </button>
          <button className={`${styles.btnBase} ${styles.primary}`} onClick={close}>
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
