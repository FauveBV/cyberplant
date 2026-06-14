# cyberplant

Sistema de identidad visual propia — documento vivo y pieza de portfolio.
Proyecto personal: convertir un netbook viejo en cyberdeck y usar el proceso
para definir una identidad replicable a portfolio, redes y al propio entorno.

**Tesis:** mostrar las reglas, no esconderlas. La grilla, el error y el
algoritmo se ven y construyen el lenguaje, en vez de decorarlo.

**Eje:** humano/diseñado ↔ natural. Lo humano es la piedra, el concreto, el
gris y los cromas sintéticos que no existen en la naturaleza; lo natural es el
verde y el azul, lo húmedo, la selva valdiviana.

## Qué es esto

`index.html` es un brand-book autónomo que *es* el sistema: expone su grilla,
su ruido y su algoritmo. Un solo archivo, sin dependencias de build.

- Eje interactivo humano ↔ natural (el sistema migra de un polo al otro).
- Seis clusters de vocabulario visual.
- Dos escalas de color documentadas: humano (gris/concreto) y natural (verde→azul, selva valdiviana).
- Firma generativa: espiral que muta de geometría rígida (humano) a crecimiento orgánico ramificado (natural), animada, con semilla determinista.
- Tipografía: mono base (IBM Plex Mono) + display modular (candidata: Syne).
- Modo light / dark como expresión del mismo sistema.

## Color: RGB → CMYK

Todo se define en **RGB** porque la pieza vive en pantalla, guiado por teoría de
color audiovisual (chroma). Al pasar a impresión, la paleta se remapea a **CMYK**.

## Accesibilidad

Cumple WCAG 2.1 AA: capa de color de texto con contraste ≥ 4.5:1 en ambos modos,
foco visible por teclado, nombres accesibles en controles, `aria-live` para
feedback, y respeto de `prefers-reduced-motion`.

## Tokens (base)

| token   | hex     | rol                        |
|---------|---------|----------------------------|
| bg      | #0a0a0a | fondo                      |
| surface | #161616 | superficie                 |
| overlay | #222220 | bordes                     |
| line    | #ededed | texto                      |
| paper   | #e6e1d4 | papel cálido / fondo light |
| muted   | #8a857c | secundario (AA)            |
| blue    | #1f3df0 | acento / azul natural      |
| signal  | #d4380d | rojo señal · uso mínimo    |
| moss    | #5a6b4d | verde natural              |
| mineral | #b8a888 | transición                 |

## Uso

Abrir `index.html` en cualquier navegador. Sin build.

## Estado

Cerrando Discovery. Orden de trabajo:
Contexto → Discovery → Arquitectura/UX → Sistema de diseño → Construcción → Revisión.

Documento vivo: se nutre de más información de forma progresiva.
