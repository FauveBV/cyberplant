// Genera el CSS del sitio y el export para Figma desde la fuente única src/tokens/tokens.json (DTCG).
//   → src/styles/tokens.css   (:root con todos los --tokens; consumido por global.css)
//   → public/tokens.json      (copia DTCG descargable para importar en Figma / Tokens Studio)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'src/tokens/tokens.json');
const tokens = JSON.parse(readFileSync(src, 'utf8'));

// alias DTCG {grupo.nombre} → var(--nombre); valores literales pasan tal cual
function cssValue(v) {
  if (typeof v === 'string') {
    const m = v.match(/^\{(.+)\}$/);
    if (m) return `var(--${m[1].split('.').pop()})`;
  }
  return String(v);
}

const blocks = [];
for (const [group, items] of Object.entries(tokens)) {
  if (group.startsWith('$')) continue;
  const decls = [];
  for (const [name, tok] of Object.entries(items)) {
    if (name.startsWith('$') || !tok || tok.$value === undefined) continue;
    decls.push(`--${name}:${cssValue(tok.$value)};`);
  }
  if (decls.length) blocks.push(`  /* ${group} */\n  ${decls.join(' ')}`);
}

// vars runtime / alias (no son tokens de export: aliases de fuente + estado mutado por JS)
blocks.push(
  '  /* runtime / alias (no exportados) */\n' +
    '  --accent:var(--blue); --warmth:0; --grow:0;\n' +
    '  --mono:var(--font-mono); --display:var(--font-display); --sans:var(--font-sans);'
);

const css =
  '/* GENERADO por scripts/build-tokens.mjs desde src/tokens/tokens.json — no editar a mano. */\n' +
  ':root{\n' +
  blocks.join('\n') +
  '\n}\n';

writeFileSync(resolve(root, 'src/styles/tokens.css'), css);

mkdirSync(resolve(root, 'public'), { recursive: true });

// --- Export Figma: formato NATIVO de Tokens Studio (value/type, no DTCG $value/$type) ---
// (Tokens Studio en modo por defecto no lee DTCG; este formato importa directo.)
const TS_TYPE = {
  color: 'color',
  'color-semantic': 'color',
  font: 'fontFamilies',
  fontSize: 'fontSizes',
  fontWeight: 'fontWeights',
  lineHeight: 'lineHeights',
  letterSpacing: 'letterSpacing',
  space: 'spacing',
  border: 'borderWidth',
  motion: 'other',
  layout: 'sizing',
};

const set = {};
for (const [group, items] of Object.entries(tokens)) {
  if (group.startsWith('$')) continue;
  const g = {};
  for (const [name, tok] of Object.entries(items)) {
    if (name.startsWith('$') || !tok || tok.$value === undefined) continue;
    let type = TS_TYPE[group] || 'other';
    if (group === 'border') type = name.includes('radius') ? 'borderRadius' : 'borderWidth';
    g[name] = { value: String(tok.$value), type };
  }
  set[group] = g;
}
const tokensStudio = {
  cyberplant: set,
  // un theme que habilita el set → necesario para que "Export → Variables" cree Variables en Figma
  $themes: [
    {
      id: 'cyberplant',
      name: 'Cyberplant',
      selectedTokenSets: { cyberplant: 'enabled' },
      $figmaCollectionId: '',
      $figmaModeId: '',
      $figmaVariableReferences: {},
    },
  ],
  $metadata: { tokenSetOrder: ['cyberplant'] },
};

// público (lo que descarga el botón → importa en Tokens Studio)
writeFileSync(resolve(root, 'public/tokens.json'), JSON.stringify(tokensStudio, null, 2) + '\n');
// DTCG estándar (referencia / round-trip), por si se usa el modo DTCG del plugin
writeFileSync(resolve(root, 'public/tokens.dtcg.json'), JSON.stringify(tokens, null, 2) + '\n');

console.log('✓ tokens: tokens.css + public/tokens.json (Tokens Studio) + public/tokens.dtcg.json');
