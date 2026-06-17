# Sistema de diseño — cyberplant

Identidad visual propia de **Fauve Bellenger**. Este documento es la **fuente de verdad escrita**
y coincide 1:1 con `src/tokens/tokens.json` (`:root` del sitio) y con el archivo de Figma.

> **Figma:** https://www.figma.com/design/nVA6rfuhuTFcurWLZS8dRv — `cyberplant — Design System`
> **Tokens (fuente única):** `src/tokens/tokens.json` (W3C DTCG) → genera `src/styles/tokens.css` y `public/tokens.json`.
> **No editar `tokens.css` a mano.** Correr `npm run tokens:export` (o `predev`/`prebuild`).

---

## 1. Principios y tesis

- **Tesis:** *mostrar las reglas, no esconderlas.* La grilla, el error y el algoritmo son el lenguaje, no el adorno.
- **Eje:** humano/diseñado (gris, concreto, cromas sintéticos) ↔ natural (verde y azul, húmedo, orgánico/vegetal).
- **Color audiovisual:** todo se define en **RGB** (pantalla); al imprimir se remapea a CMYK.
- **Acento de marca:** azul eléctrico `#1f3df0`. **Rojo señal** `#d4380d` = lo sintético/humano, uso mínimo (alerta/error).
- **Magenta** `#ff3dc4` (`--bio-magenta`) = croma bioluminiscente de la firma; rol semántico **`--color-pending`** (pendiente/borrador). Distinto del rojo señal.

---

## 2. Tokens

Modo oscuro = base. El **modo claro** sólo redefine ciertos colores (overrides de `:root[data-theme="light"]`).
En Figma: una colección **`cyberplant`** con dos modos **`dark`** / **`light`**.

### 2.1 Color — primitivos

| Token CSS | Variable Figma | dark | light | Uso |
|---|---|---|---|---|
| `--bg` | `color/bg` | `#0a0a0a` | `#e6e1d4` | Fondo base |
| `--surface` | `color/surface` | `#161616` | `#f1ecdf` | Superficies / tarjetas |
| `--overlay` | `color/overlay` | `#191917` | `#ddd7c8` | Bordes, divisores, fondos de grilla |
| `--prev-bg` | `color/prev-bg` | `#0d0d0d` | `#efe8d8` | Fondo de previews |
| `--line` | `color/line` | `#ededed` | `#14130e` | Texto principal / líneas fuertes |
| `--paper` | `color/paper` | `#e6e1d4` | `#0a0a0a` | Papel (inverso del fondo) |
| `--muted` | `color/muted` | `#8a857c` | `#646055` | Texto secundario / etiquetas |
| `--txt` | `color/txt` | `#cfcfca` | `#403d33` | Texto de cuerpo |
| `--blue` | `color/blue` | `#1f3df0` | `#1f3df0` | Acento de marca (fills/bordes) |
| `--signal` | `color/signal` | `#d4380d` | `#c5350c` | Señal: alerta / error / sintético |
| `--moss` | `color/moss` | `#5a6b4d` | `#566848` | Natural (verde) |
| `--mineral` | `color/mineral` | `#b8a888` | `#9b8b69` | Cálido (mineral) |
| `--c-blue-text` | `color/c-blue-text` | `#5b78ff` | `#1f3df0` | Texto azul AA |
| `--c-moss-text` | `color/c-moss-text` | `#7d9169` | `#4c5d3f` | Texto verde AA |
| `--c-mineral-text` | `color/c-mineral-text` | `#b8a888` | `#6f6243` | Texto cálido AA |
| `--c-signal-text` | `color/c-signal-text` | `#ff3dc4` | `#ff3dc4` | Texto señal AA (sin variante clara) |
| `--bio-magenta` | `color/bio-magenta` | `#ff3dc4` | `#ff3dc4` | Croma bioluminiscente / pendiente |
| `--bio-pink` | `color/bio-pink` | `#ff6fb3` | `#ff6fb3` | Bioluminiscencia |
| `--bio-yellow` | `color/bio-yellow` | `#ffd23d` | `#ffd23d` | Bioluminiscencia |
| `--bio-orange` | `color/bio-orange` | `#ff8a3d` | `#ff8a3d` | Bioluminiscencia |
| `--bio-stem` | `color/bio-stem` | `#5e9a6a` | `#5e9a6a` | Tallo / verde firma |

> **Capa de color de texto AA** (`--c-*-text`): variantes con contraste ≥ 4.5 sobre el modo oscuro.
> Para **texto** usar siempre `--c-blue-text` / `--c-moss-text` / `--c-mineral-text` / `--c-signal-text`,
> no los primitivos `--blue`/`--moss`/`--mineral`/`--signal` (esos son para fills/bordes).

### 2.2 Color — semánticos (alias → primitivo)

| Token CSS | Variable Figma | → primitivo | Uso |
|---|---|---|---|
| `--color-bg` | `semantic/color-bg` | `bg` | Fondo |
| `--color-surface` | `semantic/color-surface` | `surface` | Superficie |
| `--color-border` | `semantic/color-border` | `overlay` | Borde |
| `--color-text-primary` | `semantic/color-text-primary` | `line` | Texto principal |
| `--color-text-secondary` | `semantic/color-text-secondary` | `txt` | Texto cuerpo |
| `--color-text-muted` | `semantic/color-text-muted` | `muted` | Texto atenuado |
| `--color-accent` | `semantic/color-accent` | `blue` | Acento (fill) |
| `--color-accent-text` | `semantic/color-accent-text` | `c-blue-text` | Acento (texto) |
| `--color-signal` | `semantic/color-signal` | `signal` | Señal (fill) |
| `--color-signal-text` | `semantic/color-signal-text` | `c-signal-text` | Señal (texto) |
| `--color-pending` | `semantic/color-pending` | `bio-magenta` | Pendiente / borrador / en construcción |
| `--color-natural` | `semantic/color-natural` | `moss` | Natural (fill) |
| `--color-natural-text` | `semantic/color-natural-text` | `c-moss-text` | Natural (texto) |
| `--color-warm` | `semantic/color-warm` | `mineral` | Cálido (fill) |
| `--color-warm-text` | `semantic/color-warm-text` | `c-mineral-text` | Cálido (texto) |

### 2.3 Tipografía

**Familias** — mono = `"IBM Plex Mono"` (`font/font-mono`), display = `"Syne"` (`font/font-display`), sans = `"IBM Plex Sans"` (`font/font-sans`).
Mono = cuerpo/UI por defecto · Syne = display (lane modular) · Plex Sans = párrafos largos (portafolio/bio).

**Tamaños** (`fontSize/*`):

| Token | Valor | Figma |
|---|---|---|
| `--fs-3xs` | 10px | `fs-3xs` = 10 |
| `--fs-2xs` | 11px | `fs-2xs` = 11 |
| `--fs-xs` | 12px | `fs-xs` = 12 |
| `--fs-sm` | 13px | `fs-sm` = 13 |
| `--fs-md` | 14px | `fs-md` = 14 |
| `--fs-base` | 15px | `fs-base` = 15 |
| `--fs-h3` | 18px | `fs-h3` = 18 |
| `--fs-h1` | `clamp(34px, 6.2vw, 82px)` | `fs-h1-min` 34 / `fs-h1-max` 82 |
| `--fs-h2` | `clamp(26px, 4vw, 46px)` | `fs-h2-min` 26 / `fs-h2-max` 46 |
| `--fs-thesis` | `clamp(20px, 2.6vw, 30px)` | `fs-thesis-min` 20 / `fs-thesis-max` 30 |
| `--fs-specimen` | `clamp(48px, 9vw, 120px)` | `fs-specimen-min` 48 / `fs-specimen-max` 120 |

**Pesos** (`fontWeight/*`): light 300 · regular 400 · medium 500 · semibold 600 · bold 700 · black 800.
*(En Syne, 800 se mapea al estilo `ExtraBold`.)*

**Interlineado** (`lineHeight/*`, multiplicador): `--lh-specimen` .86 · `--lh-h1` .92 · `--lh-solid` 1 · `--lh-display` 1.18 · `--lh-body` 1.55 · `--lh-loose` 1.7.

**Tracking** (`letterSpacing/*`; CSS en `em`, Figma en %):

| Token | CSS | Figma % |
|---|---|---|
| `--tr-tightest` | -.02em | -2 |
| `--tr-tight` | -.01em | -1 |
| `--tr-normal` | .01em | 1 |
| `--tr-wide` | .04em | 4 |
| `--tr-wider` | .06em | 6 |
| `--tr-caps` | .08em | 8 |
| `--tr-caps-lg` | .1em | 10 |
| `--tr-caps-xl` | .14em | 14 |
| `--tr-widest` | .22em | 22 |
| `--tr-mega` | .3em | 30 |

**Estilos de texto (Figma)** — ligados a variables (`fontSize`/`letterSpacing`/`fontFamily`):

| Estilo | Familia | Peso | Tamaño | Interlineado | Tracking | Caja |
|---|---|---|---|---|---|---|
| `Display/H1` | Syne | 800 | 82 (clamp 34→82) | .92 | -2% | UPPER |
| `Display/H2` | Syne | 700 | 46 (clamp 26→46) | 1 | -1% | UPPER |
| `Display/H3` | Syne | 600 | 18 | auto | 1% | — |
| `Display/Thesis` | Syne | 600 | 30 (clamp 20→30) | 1.18 | -1% | — |
| `Display/Specimen` | Syne | 800 | 120 (clamp 48→120) | .86 | -2% | UPPER |
| `Mono/base…3xs` | IBM Plex Mono | 400 | 15 / 14 / 13 / 12 / 11 / 10 | auto | — | — |
| `Mono/Tag` | IBM Plex Mono | 400 | 12 | auto | 22% | UPPER |
| `Mono/Label-sm` | IBM Plex Mono | 400 | 12 | auto | 14% | UPPER |

### 2.4 Espaciado (base-4)

`space/*` — idénticos en ambos modos:

| Token | px | · | Token | px |
|---|---|---|---|---|
| `--sp-px` | 1 | | `--sp-8` | 24 |
| `--sp-1` | 2 | | `--sp-9` | 30 |
| `--sp-2` | 4 | | `--sp-10` | 36 |
| `--sp-3` | 6 | | `--sp-11` | 42 |
| `--sp-4` | 8 | | `--sp-12` | 48 |
| `--sp-5` | 12 | | `--sp-14` | 64 |
| `--sp-6` | 16 | | `--sp-16` | 88 |
| `--sp-7` | 20 | | `--space-section-top` / `--space-section-bottom` | 120 |

### 2.5 Layout · bordes · radios

| Token CSS | Valor | Variable Figma |
|---|---|---|
| `--maxw` | 1180px | `layout/maxw` = 1180 |
| `--gut` | 24px | `layout/gut` = 24 |
| `--bw` | 1px | `border/bw` = 1 |
| `--radius-full` | 50% | `border/radius-full` = **9999** (pill en Figma) |

### 2.6 No-variable (documentado, fuera de Figma)

Figma no admite curvas/duraciones ni `clamp()` como variable. Fuente de verdad:

- **Motion:** `--dur-fast` .2s · `--dur` .3s · `--dur-slow` .5s · `--dur-slower` .6s · `--ease` `cubic-bezier(.22, 1, .36, 1)`.
- **Fluidos:** `--fs-h1/h2/thesis/specimen` usan `clamp()` (los min/max sí existen como `fontSize/*-min` · `*-max`).

### 2.7 Estados, elevación y utilidades (gaps formalizados)

Derivados de la paleta (única fuente); en CSS y en variables Figma.

| Token CSS | Valor / origen | Uso |
|---|---|---|
| `--color-success` | ← `c-moss-text` | estado: éxito |
| `--color-warning` | ← `bio-yellow` | estado: advertencia |
| `--color-info` | ← `c-blue-text` | estado: información |
| `--color-error` | ← `signal` (#d4380d) | error — **separado de pending** (uso gráfico ≥3:1) |
| `--color-pending` | ← `bio-magenta` (#ff3dc4) | pendiente / borrador |
| `--shadow-1` / `-2` / `-glow` | suave / elevada / glow azul | elevación |
| `--radius-0` / `-sm` / `-pill` | 0 / 2px / 9999px | radios (`--radius-full` 50% = círculo) |
| `--focus-ring` | doble anillo (`--bg` + `--c-blue-text`) | foco visible reutilizable |
| `--z-base…max` | 0 · 10 · 50 · 100 · 1000 · 1100 · 9999 | raised/sticky/overlay/modal/toast/max |
| `--bp-sm/md/lg` | 520 / 720 / 860 px | breakpoints |
| `--opacity-disabled` | .45 | disabled = opacidad + dashed sobre `--overlay` (no se inventa color) |
| `--font-icon` | `Lilex`, mono | iconografía por glifos/ligaduras |

---

## 3. Inventario de componentes

Organizados por nivel atómico (igual que en Figma). Todos enlazan sus propiedades visuales a variables.

### Atoms
| Componente | Anatomía | Variantes / estados |
|---|---|---|
| **Tag** (`.tag`) | línea acento 34×1 + nº (`c-blue-text`) + label (`muted`, `Mono/Tag`) | props Number · Label |
| **Headings** (`h1/h2/h3`) | — | `Level = H1 · H2 · H3` |
| **Button** (`.btn`) | mono, fs-xs, tr-caps, UPPER, padding `--sp-4` | `Style = Default·Primary·Glass` × `State = Default·Hover·Focus·Disabled·Loading` |
| **GridBtn / Toggle** (`.gridbtn`) | mono fs-3xs, tr-caps-lg, UPPER | `State = Default·Hover·Pressed` (`aria-pressed`) |
| **Link** (`a`) | `c-blue-text` | `State = Default·Hover` (subrayado) |
| **Pill** (`.pill`) | borde + texto `c-blue-text`, `--sp-1/--sp-4` | prop Label |
| **Badge** (`.badge`) | fill `c-blue-text`, texto `bg`, `--sp-1/--sp-3` | prop Label |
| **Range / Dots / Cursor / Line&Radius / Swatch Row** | átomos de UI sueltos | — |

### Molecules
Token Card (`.tok`, chip+name+hex+role, hover) · Cluster Card (`.cluster`, `Polo = Cold·Warm` × `State`) ·
Console Slider + Axis Slider (`.ctrl`, track 2px / gradiente) · Color Scale (`Tipo = Humano·Natural`) ·
Metaline · OS Bar · Footer Column · Step (`State = Default·Active`) · Nav Link (`State = Default·Hover`) ·
OS-choice Card (`Default·New`, usa Badge) · Todo Item · Contact Row · CV Item · Case Metric · Placeholder Figure.

### Organisms
HUD · OS Window (`.oswin`) · Topbar · Footer · Masthead · Axis Box (`.axisbox`) ·
Clusters Grid · Tokens Grid · Type Specimen Grid · Flow · OS-choices Grid · Case-metrics Grid ·
Bio Block · Backlog · **Signature Stage** (HUD + consola flotante + acciones).

### Templates
BaseLayout · Editorial · Case study · Landing · Section (esqueletos de layout).

### Pages (maquetas hi-fi)
`/` Landing · `/sistema` (+ `/sistema/ui` showcase de componentes) · `/cyberdeck` · `/musicplant` · `/portafolio` · `/portafolio/ejemplo` · `/bio` · `/wallpaper` (deck, fullscreen).
**Dos vistas** en Figma: `Pages · desktop` (1440) y `Pages · mobile` (390), cada una con panel de especificaciones.

### Patrones de página (documentados en `/sistema`)
- **11 · Portafolio:** `.ph` (pendiente, magenta), `.soon-prev`, `.case-meta`, `.ph-figure`, `.case-block`/`.lead`, `.case-metrics`, `.case-nav`, clusters "próximamente".
- **12 · Bio:** `.cv-date`, viñeta `.cv-bullets li::before`, `.cv-item`, `.cv-note`, `ul.contact`, `.skills`, `.cv-bullets.cols`.

### Estados de interacción (specs, no tokens)
- **Hover:** borde → acento + `translateY(-2px)`, transición `--dur`/`--ease`.
- **Focus:** `outline 2px var(--c-blue-text)`, offset 3px (`:focus-visible`) en todo control.
- **Pressed/Active:** `aria-pressed="true"` → borde + texto `c-blue-text` + fondo azul 12%.
- **Loading:** spinner; **Disabled:** `opacity .4`.

### Biblioteca de componentes UI (`src/components/ui/`)

Componentes de código: **`.astro` estáticos** (cero JS) + **islas React** (CSS module) para lo interactivo. Token-only, accesibles, portables. Showcase en vivo: **`/sistema/ui`**.

- **P0** — Button · Input · Textarea · Select · Checkbox · Radio · **Switch** (React) · Nav · Breadcrumb · Alert · Badge · StatusDot · Table · SpecSheet · EmptyState.
- **P1/P2** — **Tabs · Accordion · Modal (`<dialog>`) · Toast** (React) · Tooltip · Code · Metric · Skeleton · Progress.

> Consumidos por `/cyberdeck` (form, spec-sheet, table, alerts, badges, breadcrumb).

---

## 4. Accesibilidad (WCAG 2.1 AA)

- Contraste de texto ≥ 4.5 vía la **capa `--c-*-text`** (sobre el modo oscuro único).
- Foco visible (`:focus-visible`, outline 2px + offset) · `aria-pressed` en el play del espécimen · región `aria-live` · skip link.
- `prefers-reduced-motion`: espécimen en pausa, sin scroll suave ni reveals; todo visible.

---

## 5. Guía de uso

### En web (CSS)
```css
.boton {
  background: var(--color-accent-text);  /* semántico */
  color: var(--bg);
  padding: var(--sp-4) var(--sp-6);
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: var(--tr-caps);
}
```
- Consumir **semánticos** (`--color-*`) cuando exista el rol; primitivos sólo si no hay semántico.
- Texto cromático → `--c-*-text` (AA). Modo claro: `:root[data-theme="light"]` (sólo overrides de color).
- No editar `tokens.css`: editar `tokens.json` → `npm run tokens:export`.

### En Figma
- Bindear fills/strokes/padding/gap/radios a **variables** (no valores sueltos).
- Aplicar **estilos de texto** (`Display/*`, `Mono/*`) en vez de tipografía manual.
- Cambiar **modo** (dark/light) desde el panel de variables de la colección `cyberplant`.

### Correspondencia de nombres CSS ↔ Figma
| CSS | Figma | Nota |
|---|---|---|
| `--bg`, `--blue`, … | `color/bg`, `color/blue`, … | primitivos |
| `--color-*` | `semantic/color-*` | semánticos (alias) |
| `--sp-*`, `--maxw`, `--gut` | `space/*`, `layout/*` | números |
| `--fs-*` | `fontSize/*` | fluidos como par `*-min`/`*-max` |
| `--fw-*` `--lh-*` `--tr-*` | `fontWeight/*` `lineHeight/*` `letterSpacing/*` | tracking en % (`.08em` → 8) |
| `--bw`, `--radius-full` | `border/*` | `radius-full`: 50% (CSS) / 9999 (Figma) |
| `--font-mono/display/sans` | `font/*` | sólo nombre de familia |
| **Code syntax (Dev Mode)** | `var(--<token>)` | en cada variable |

---

## 6. Firma generativa — módulo (`src/lib/signature`)

El espécimen audio-reactivo como **módulo TS reutilizable** (canvas 2D, sin libs). Paleta derivada de tokens; audio opcional. Estética portada 1:1 del original.

- `engine.ts` — render + mapeo audio→visual (graves → eyección · agudos → glitch · voz → halo · ambient → ondas) + pixelación/feedback.
- `audio.ts` — fuente mic/sistema + análisis por banda Hz con auto-normalización.
- `palette.ts` — paleta desde CSS vars (`--blue`, `--bio-magenta`, …); **sin hex de marca** (los fallbacks solo espejan el token).
- `index.ts` — API: `createSignature(canvas) → { start, stop, setAudioSource('mic'|'system'|null), exportPNG, onMeter }`.

**Consumidores:** `/musicplant` (página web, con topbar/footer) y `/wallpaper` (deck, fullscreen — **M** micrófono · **G** sistema · **S** PNG). La firma de la home (`Specimen2D` / R3F) queda **intacta**.

---

## 7. Stack

Astro 5 + React 19 (islas) + TypeScript + Tailwind v4 · salida estática · deploy en **Vercel**
(`cyberplant.vercel.app`, redeploy en cada push a `main`). Fuentes por Google Fonts (sin CDN propio).
Animación: three.js / R3F (espécimen 3D) · motor 2D para mobile/netbook · GSAP + ScrollTrigger + Lenis · Motion.
