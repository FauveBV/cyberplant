import { atom } from 'nanostores';

// Estado compartido entre islas (reemplaza el querySelector global del index.html monolítico).

// Semilla del espécimen. Specimen la escribe; SeedValue (ventana OS, sección 06) la lee.
// null = aún no inicializada (se muestra "—", igual que el original).
export const $seed = atom<number | null>(null);
