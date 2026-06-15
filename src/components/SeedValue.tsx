import { useStore } from '@nanostores/react';
import { $seed } from '../stores/identity';

// muestra la semilla del espécimen en la ventana OS (sección 06). La escribe Specimen.
export default function SeedValue() {
  const seed = useStore($seed);
  return <span>{seed ?? '—'}</span>;
}
