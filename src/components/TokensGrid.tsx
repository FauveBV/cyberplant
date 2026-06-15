import { useRef, useState } from 'react';

// [nombre, hex, rol] — mismos tokens que el index.html monolítico
const TOKENS: [string, string, string][] = [
  ['bg', '#0a0a0a', 'fondo'],
  ['surface', '#161616', 'superficie'],
  ['overlay', '#222220', 'bordes'],
  ['line', '#ededed', 'texto'],
  ['paper', '#e6e1d4', 'papel cálido'],
  ['muted', '#8a857c', 'secundario'],
  ['blue', '#1f3df0', 'acento primario'],
  ['signal', '#d4380d', 'rojo señal · mínimo'],
  ['moss', '#5a6b4d', 'cálido activo'],
  ['mineral', '#b8a888', 'cálido activo'],
];

function announce(msg: string) {
  const el = document.getElementById('live');
  if (el) el.textContent = msg;
}

export default function TokensGrid() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copy(name: string, hexv: string) {
    if (navigator.clipboard) navigator.clipboard.writeText(hexv);
    announce(`Token ${name} copiado: ${hexv}`);
    setCopied(name);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 900);
  }

  return (
    <div className="tokens" id="tokGrid">
      {TOKENS.map(([name, hexv, role]) => {
        const isCopied = copied === name;
        return (
          <button
            key={name}
            className="tok"
            type="button"
            aria-label={`Copiar token ${name}, ${hexv} — ${role}`}
            onClick={() => copy(name, hexv)}
          >
            <div className="chip" style={{ background: hexv }} />
            <div className="meta">
              <span className="name">{name}</span>
              <span className="hex" style={isCopied ? { color: 'var(--c-blue-text)' } : undefined}>
                {isCopied ? 'copiado' : hexv}
              </span>
            </div>
            <div className="role">{role}</div>
          </button>
        );
      })}
    </div>
  );
}
