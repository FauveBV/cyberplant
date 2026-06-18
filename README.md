# cyberplant

Sistema de identidad visual propia de **Fauve Bellenger** — documento vivo (un colofón)
y pieza de portfolio. Proyecto personal: convertir un netbook viejo en *cyberdeck* y usar
el proceso para definir una identidad replicable a portfolio, redes y al propio entorno.

- **Tesis:** mostrar las reglas, no esconderlas. La grilla, el error y el algoritmo se ven
  y construyen el lenguaje, en vez de decorarlo.
- **Eje:** humano/diseñado ↔ natural. Lo humano es la piedra, el concreto, el gris y los
  cromas sintéticos que no existen en la naturaleza; lo natural es el verde y el azul, lo
  húmedo, lo vegetal y orgánico.
- **Color:** todo se define en **RGB** (vive en pantalla); al imprimir se remapea a **CMYK**.

## Stack

Astro 5 + React 19 (islas) + TypeScript + Tailwind v4 · salida estática · deploy en
**Vercel** (`cyberplant.vercel.app`, redeploy en cada push a `main`). Sin CDN; fuentes por
Google Fonts (IBM Plex Mono · Syne · IBM Plex Sans · Lilex para iconografía).

```bash
npm install
npm run dev       # localhost:4321
npm run build     # build para Vercel (híbrido) · corre tokens:export antes
npm run tokens:export   # regenera tokens.css + exports desde tokens.json
```

## Estructura

```
src/
  tokens/tokens.json        Única fuente de tokens (W3C DTCG)
  styles/tokens.css         Generado · :root con todas las CSS vars (no editar a mano)
  styles/global.css         CSS del sistema (importa tokens.css)
  components/ui/            Biblioteca de componentes (.astro + islas React)
  components/sections/      Secciones del colofón (/sistema)
  components/three/         Espécimen 3D (R3F) · Specimen2D.tsx (tier liviano)
  lib/signature/           Firma generativa audio-reactiva (módulo reutilizable)
  data/                    Contenido editable (YAML) que consume el CMS
  pages/                   /, /sistema (+/ui), /cyberdeck, /musicplant, /portafolio, /bio, /wallpaper, /keystatic
keystatic.config.ts        Esquema del CMS (Keystatic) · en la raíz
```

## Páginas

| Ruta | Qué es |
|---|---|
| `/` | Landing — el espécimen como hero ambiental |
| `/sistema` | El colofón / design system (tokens · atoms · molecules · organisms) |
| `/sistema/ui` | Showcase en vivo de la biblioteca de componentes |
| `/cyberdeck` | Guía de traspaso del netbook a cyberdeck |
| `/musicplant` | La firma generativa, reactiva al sonido, como pieza web |
| `/wallpaper` | El espécimen a pantalla completa (wallpaper del deck) |
| `/portafolio` · `/portafolio/ejemplo` · `/bio` | Casos y bio |
| `/keystatic` | Panel del CMS (editar contenido) |

## Gestión de contenidos (CMS)

El sitio tiene un CMS propio con **[Keystatic](https://keystatic.com)** (git-based): un panel
en **`/keystatic`** que edita **archivos de contenido del repo** (no una base externa).
Editar contenido **no toca plantillas ni componentes** — el contenido vive separado en
`src/data/*.yaml` y las páginas lo leen vía `@keystatic/core/reader`.

**Dónde editar:**
- **En vivo:** `cyberplant.vercel.app/keystatic` → login con GitHub (Keystatic Cloud,
  proyecto `fauve/cyberplant`). Al guardar, commitea al repo y Vercel redeploya.
- **Local:** `npm run dev` → `localhost:4321/keystatic` (sin login; guarda en los archivos).

**Qué es editable** (singletons en `keystatic.config.ts` → `src/data/`):

| Panel | Archivo | Contenido |
|---|---|---|
| Landing | `landing.yaml` | nombre, bajada, áreas, link de firma |
| Sistema · cabecera | `sistema.yaml` | título, acento, bajada, metaline |
| Bio | `bio.yaml` | educación, experiencia, habilidades, intereses, contacto |
| Cyberdeck | `cyberdeck.yaml` | cabecera, ficha, opciones de OS, tabla, pasos, backlog |
| Portafolio | `portafolio.yaml` | cabecera + casos |
| Caso de ejemplo | `caso-ejemplo.yaml` | título, bajada, ficha, bloques, métricas |

**Infra:** el adapter `@astrojs/vercel` hace el deploy **híbrido** — las páginas públicas se
prerenderizan (estáticas) y solo `/keystatic` y `/api/keystatic` corren on-demand.

> Para agregar un campo editable: definilo en `keystatic.config.ts` y leelo en la página
> con el reader. Lo que NO es "contenido" (componentes, firma, formularios) queda en plantilla.

## Sistema de diseño

Tokens como **única fuente de verdad** (`src/tokens/tokens.json`, formato W3C DTCG):
color (primitivos + semánticos `--color-*`), tipografía, espaciado base-4, estados
(success/warning/info/error, con `error` ≠ `pending`), elevación, radios, focus-ring,
z-index, breakpoints y motion. El script `scripts/build-tokens.mjs` genera `tokens.css`
(web) y los exports para Figma / Tokens Studio.

**Componentes** (`src/components/ui/`): `.astro` estáticos + islas React para lo
interactivo, token-only y accesibles. **Firma generativa** desacoplada en
`src/lib/signature/` (canvas 2D, sin libs, audio-reactiva), reutilizada por la web y el
wallpaper del deck.

> Documentación completa del sistema: **[`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md)**
> (tokens, componentes, módulo de firma, accesibilidad, guía CSS ↔ Figma).
> Figma: <https://www.figma.com/design/nVA6rfuhuTFcurWLZS8dRv>

## Tokens base (modo oscuro)

| token | hex | rol |
|---|---|---|
| `--bg` | `#0a0a0a` | fondo |
| `--surface` | `#161616` | superficie |
| `--overlay` | `#191917` | bordes / divisores |
| `--line` | `#ededed` | texto principal |
| `--paper` | `#e6e1d4` | papel cálido / fondo light |
| `--muted` | `#8a857c` | texto secundario (AA) |
| `--blue` | `#1f3df0` | acento de marca |
| `--signal` | `#d4380d` | rojo señal / error · uso mínimo |
| `--moss` | `#5a6b4d` | verde natural |
| `--mineral` | `#b8a888` | cálido / transición |
| `--bio-magenta` | `#ff3dc4` | croma bioluminiscente / pending |

*(Capa de texto AA: `--c-blue-text` · `--c-moss-text` · `--c-mineral-text` · `--c-signal-text`.)*

## Accesibilidad

WCAG 2.1 AA: capa de color de texto con contraste ≥ 4.5:1, foco visible por teclado
(`--focus-ring` / `:focus-visible`), roles y nombres accesibles en controles, `aria-live`
para feedback, y respeto de `prefers-reduced-motion` (la firma cae a un idle calmo).
