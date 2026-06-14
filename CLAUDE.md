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
- **`index.html`**: un solo archivo, CSS embebido en `<style>`, JS vanilla en `<script>`. Sin build.
- Librerías por CDN: **GSAP** (ticker + easing) y **simplex-noise 2.4.0** (ruido orgánico), con fallback.
- Fuentes (Google Fonts): mono = **IBM Plex Mono**, display = **Syne**.
- Para verlo: abrir `index.html` en el navegador. No requiere servidor.

## Estructura del documento (secciones)
masthead (hero) · 01 Eje humano↔natural (slider interactivo) · 02 Clusters · 03 Tokens (+escalas)
· 04 Tipografía · 05 Firma (espécimen generativo) · 06 Aplicación/ventana OS · 07 Proceso
· 08 Variables de entrada (incl. Corpus teórico) · 09 Backlog · footer.

## Sistema de tokens (design system)
Todo vive en `:root` (y overrides en `:root[data-theme="light"]`), organizado por familias:
color, tipografía (familias + escala `--fs-*` + display), pesos `--fw-*`, interlineado `--lh-*`,
tracking `--tr-*`, espaciado base-4 `--sp-*`, `--space-section-top/bottom`, bordes/radios, motion
(`--ease`, `--dur-*`), layout (`--maxw:1180px`, `--gut`). Capa de **color de texto** AA:
`--c-blue-text`, `--c-moss-text`, `--c-mineral-text`, `--c-signal-text`.
> Cuidado de especificidad: las secciones son `section.wrap`; `.wrap` define gutter lateral, y el
> padding vertical de sección se setea con `section.wrap{padding-top/bottom}` para vencer a `.wrap`.

## Firma generativa (sección 05)
Canvas `#spiral` (id histórico). Espécimen de **nube de partículas** que orbita en 3D: gránulos con
ciclo de vida (nacen nítidos → crecen → se vuelven borrosos), paleta de marca (azul/verde/mineral/
blanco + señal). **Glitch** = pixela toda la escena (bajo-muestreo con `drawImage` sin smoothing).
**Cuadrados-lupa** (`anchors`) magnifican regiones (más cuadrados = más zoom). Semilla determinista
(`mulberry32`, `rng(i)` por elemento → estable por semilla). Controles flotan en consola colapsable;
play/seed/png viven fuera de la consola (siempre visibles). Respeta `prefers-reduced-motion`.

## Accesibilidad
WCAG 2.1 AA: contraste de texto ≥4.5 en ambos modos (capa `--c-*-text`), foco visible
(`:focus-visible`), `aria-pressed` en toggles, región `aria-live`, skip link, `prefers-reduced-motion`.

## Git / deploy
- Repo: `https://github.com/FauveBV/cyberplant` · rama `main` (upstream configurado).
- **GitHub Pages** publica en `https://fauvebv.github.io/cyberplant/` (rebuild ~1-2 min tras push).
- Flujo: editar `index.html` → `git add -A && git commit -m "..."` → `git push`.
- Nota: el `raw`/Pages tienen caché CDN (~5 min); usar recarga forzada para verificar.

## Preferencias de trabajo
- **Español neutro** en conversación y entregables.
- Pedir info faltante antes de ejecutar; no asumir. No generar código sin problema/criterio claros.
- Orden: Contexto → Discovery → Arquitectura/UX → Sistema de diseño → Construcción → Revisión.
- Código semántico, escalable, replicable. Evitar patrones genéricos (no Inter, no gradientes morados de template).
- Verificar cambios (validar JS, revisar render) antes de cerrar.

## Decisiones abiertas / backlog
- Tipografía display: confirmar tipo definitivo del lane modular (Syne es candidata).
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
