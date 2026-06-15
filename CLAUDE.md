# cyberplant — contexto para Claude Code

Sistema de identidad visual propia de **Fauve Bellenger** (Product Designer / full-stack senior).
Proyecto personal: convertir un netbook viejo en *cyberdeck* y usar el proceso para definir
una identidad replicable a portfolio, redes y al propio entorno. La pieza ES el sistema
(documento vivo / colofón): expone sus reglas.

## Tesis y eje
- **Tesis:** "mostrar las reglas, no esconderlas". La grilla, el error y el algoritmo son el lenguaje, no el adorno.
- **Eje:** humano/diseñado (gris, concreto, cromas sintéticos) ↔ natural (verde y azul, húmedo, selva valdiviana).
- **Color audiovisual:** todo se define en RGB (pantalla); al imprimir se remapea a CMYK.
- Acento de marca: azul eléctrico `#1f3df0`. Rojo señal `#d4380d` = lo sintético/humano, uso mínimo.

## Stack / cómo corre
- **Astro 5 + React 19 (islas) + TypeScript + Tailwind v4**, en `src/`. Salida estática. `npm run dev` (localhost:4321) · `npm run build`.
- CSS: `src/styles/global.css` = `@import "tailwindcss"` + **CSS legacy sin capa** (vence al preflight). Tokens `:root` = única fuente de verdad.
- Islas React: `Specimen` (espécimen 3D), `AxisSlider`, `TokensGrid`, `ClusterPreview`, `SeedValue`. Estado compartido con **nanostores** (`$seed`).
- Libs: **three.js + @react-three/fiber + drei + @react-three/postprocessing** (espécimen 3D), **GSAP + ScrollTrigger + Lenis** (scroll/reveals), **Motion** (microinteracciones). Sin CDN; todo por npm.
- Fuentes (Google Fonts): mono = **IBM Plex Mono**, display = **Syne**, sans/cuerpo = **IBM Plex Sans** (`--font-sans`/`--sans`, para párrafos del portafolio; conf. en sección 05).
- `legacy/index.html` = monolito original conservado como referencia (no se deploya).

## Arquitectura del sitio (páginas)
- **`/`** → **landing**: el espécimen como hero ambiental (`<Specimen ambient>`, sin consola/HUD) + nombre de
  marca + bajada + nav grande a las 4 áreas. Topbar persistente (marca→`/`, nav Sistema·Cyberdeck·Portafolio·Bio).
- **`/sistema`** → el **colofón / design system** (número + label atómico, `section.wrap`): masthead ·
  **Fundamentos** (01 Eje/slider · 02 Vocabulario/clusters · 03 Fuentes/corpus+overgrowth) · **Atoms**
  (04 Color/tokens+escalas · 05 Tipografía · 06 Espacio·líneas·motion) · **Molecules** (07 Componentes + specs
  de interacción) · **Organisms** (08 Aplicación/ventana OS · 09 Firma/espécimen) · **Export** (10 Tokens a Figma).
- **`/cyberdeck`** → 01 Proceso · 02 Ficha · 03 OS · 04 Traspaso · 05 Backlog del sistema.
- **`/portafolio`** → teaser "próximamente" (4 slots) + **`/portafolio/ejemplo`** = plantilla de caso (ficticia,
  body en Plex Sans). Casos reales pendientes.
- **`/bio`** → placeholder, body en Plex Sans (pendientes marcados en magenta señal).

## Sistema de tokens (design system)
**Fuente única:** `src/tokens/tokens.json` (formato **W3C DTCG**). `scripts/build-tokens.mjs`
(hooks `predev`/`prebuild`, o `npm run tokens:export`) genera **`src/styles/tokens.css`** (el `:root`,
importado por `global.css`) y **`public/tokens.json`** (export descargable para Figma / Tokens Studio,
botón en la sección 10). **No editar `tokens.css` a mano.** Vars runtime/alias (`--accent`, `--warmth`,
`--grow`, `--mono`, `--display`) las agrega el script (no se exportan). **Modo oscuro único.**
Familias: color (primitivos + **semánticos** `--color-*`), tipografía (`--font-*`, escala `--fs-*`,
pesos `--fw-*`, interlineado `--lh-*`, tracking `--tr-*`), espaciado base-4 `--sp-*`,
`--space-section-top/bottom`, bordes/radios, motion (`--ease`, `--dur-*`), layout (`--maxw`, `--gut`).
Capa de **color de texto** AA: `--c-blue-text`, `--c-moss-text`, `--c-mineral-text`, `--c-signal-text`.
> Cuidado de especificidad: las secciones son `section.wrap`; `.wrap` define gutter lateral, y el
> padding vertical de sección se setea con `section.wrap{padding-top/bottom}` para vencer a `.wrap`.

## Firma generativa (sección 05)
**Dos tiers** (`src/lib/capability.ts` → `detectTier()`): `full` = 3D (R3F) y `lite` = **motor 2D**
(`Specimen2D.tsx`, port del `drawSpiral` original, corre en mobile/netbook). Se elige por capacidad
(reduced-motion, sin WebGL, mobile/coarse-pointer, hardware ≤2 núcleos/mem → `lite`) con **toggle manual**
persistido (botón `◆ pleno / ◇ ligero`). Además **auto-downgrade por FPS** (`PerfGuard.tsx`): si en `full`
el FPS promedio cae <24 (tras warmup), baja a `lite` — salvo que el tier sea elección manual. El Canvas 3D (`SpecimenCanvas.tsx`, ~245KB gzip con three) se
carga con **`lazy()` sólo en `full`** → mobile/lite nunca baja three. Ambos comparten controles/HUD y
`paramsRef`/`seedRef`. Lo que sigue describe el tier `full`:

Isla `Specimen.tsx` con **R3F/three.js** (`src/components/three/`). Nube de **partículas 3D en GPU**
(`ParticleField`, `THREE.Points` + ShaderMaterial): órbita, ciclo de vida nacen→crecen→se difuminan
(blur por-partícula en el fragment shader), ruido orgánico en **GLSL** (`glsl.ts`), densidad por
`uActive`. Paleta de marca (azul/verde/mineral/blanco + señal). Post-proceso (`Effects.tsx`):
**Bloom** = bioluminiscencia (slider org), **Pixelation** = glitch (slider glitch). **Lupas**: overlay
2D (`<canvas class="mag-overlay">` + rAF en `Specimen.tsx`) que muestrea el canvas WebGL con `drawImage`
y dibuja recortes magnificados (más cuadrados = más zoom). El contenido se ve pixelado sólo si la escena
está glitcheada (`imageSmoothing` atado al glitch); los marcos son trazos del overlay → siempre nítidos,
no dependen del glitch. (No se usa `RenderTexture`: choca con el `EffectComposer` → pantalla negra.)
Semilla determinista (`mulberry32`/`rng(i)` en `lib/specimen.ts`). Sliders tweenean uniforms con GSAP.
PNG vía `gl.domElement.toDataURL` (`preserveDrawingBuffer`). El `<Canvas>` está **memoizado** con props =
refs estables (no se re-renderiza desde afuera; semilla/params se leen por frame) — clave para no romper
el EffectComposer. Consola colapsable (Motion/AnimatePresence); play/seed/png siempre visibles. Respeta
`prefers-reduced-motion` (arranca en pausa). DOF de cámara NO se usa (partículas aditivas no escriben profundidad).

## Accesibilidad
WCAG 2.1 AA: contraste de texto ≥4.5 (capa `--c-*-text`, sobre el modo oscuro único), foco visible
(`:focus-visible`), `aria-pressed` en el play del espécimen, región `aria-live`, skip link, `prefers-reduced-motion`.

## Git / deploy
- Repo: `https://github.com/FauveBV/cyberplant` · rama `main` (upstream configurado).
- **Vercel** publica en `https://cyberplant.vercel.app/` (autodetecta Astro; redeploy automático en cada push a `main`). GitHub Pages **apagado**.
- Flujo: editar en `src/` → `npm run build` (verificar) → `git add -A && git commit -m "..."` → `git push`.

## Preferencias de trabajo
- **Español neutro** en conversación y entregables.
- Pedir info faltante antes de ejecutar; no asumir. No generar código sin problema/criterio claros.
- Orden: Contexto → Discovery → Arquitectura/UX → Sistema de diseño → Construcción → Revisión.
- Código semántico, escalable, replicable. Evitar patrones genéricos (no Inter, no gradientes morados de template).
- Verificar cambios (validar JS, revisar render) antes de cerrar.

## Decisiones abiertas / backlog
- ~~Tipografía display~~: **confirmada Syne** como display del lane modular (cerrada).
- Modelo exacto del netbook → fijar OS (antiX/MX vs Void/Arch+i3).
- Camino del generador (lockscreen fijo vs pieza p5.js documentada).
- Documento `FUNDAMENTACION-TEORICA.md` resume el corpus teórico (Base de datos) y su relación con el sistema.

## Roadmap v5 — migración a build + 2 páginas + animación potente
Decidido: **Astro + islas React + TypeScript + Tailwind** · animación **three.js + @react-three/fiber + drei**,
**GSAP + ScrollTrigger + Lenis**, **Motion/Framer Motion**, simplex-noise · deploy en **Vercel** · por **fases**.

Reglas de la migración: mantener IDÉNTICA la apariencia (no tocar tipografía ni colores), solo elevar
microinteracciones/transiciones/complejidad. Los tokens de `:root` pasan a un CSS global = única fuente
de verdad; Tailwind mapea a esas variables. Todo gateado por `prefers-reduced-motion`.

Páginas:
- `/` → el colofón actual (portar secciones 1:1 en estructura y estilo).
- `/cyberdeck` → "Indicaciones para empezar con un cyberdeck": campos **MODELO** y **ESTADO** como
  placeholders ("por completar"), más pasos del traspaso (OS antiX/MX vs Void/Arch+i3; HDD→SSD; capas
  de UI: WM, terminal+shell, GTK, compositor, barra, login; dotfiles en Git como source of truth).

**Fase 1** (scaffold): Astro+React+TS+Tailwind en el repo (reorganizar a `src/`, salida estática, deploy
Vercel) → migrar tokens a CSS global + Tailwind → componentizar secciones (que `/` se vea idéntica) →
crear `/cyberdeck` con placeholders → routing accesible (skip link, foco a `<main>` al navegar, ARIA,
títulos por página) → portar el espécimen actual (canvas 2D) como isla React tal cual. Verificar build,
consola limpia, teclado, reduced-motion, a11y. Commit por fase. Detener para revisión.

**Fase 2** (potencia): reescribir el espécimen como partículas 3D en GPU (three.js/R3F: ciclo de vida
nacen→crecen→difuminan, órbita 3D, profundidad de campo, glitch=pixelar, cuadrados-lupa, semilla
determinista, paleta de marca, fallback calmado) → Lenis + GSAP ScrollTrigger (reveals orgánicos) →
Motion (microinteracciones + transiciones de página) → pasada final de Nielsen + ARIA + auditoría a11y/perf.
