# 11 · Roadmap

> Estado: estable · Actualizado: 2026-10-10

## Fase 1 — Terreno, cielo y clima ✅ (hecha, v0.1.0)

- [x] Scaffold: canvas pixelado, loop, cámara y auto-scroll.
- [x] `rng`, `noise`, `pixel`, `palette`.
- [x] 6 capas con parallax: Andes (nieve + volcanes + roca), Precordillera, Valle,
      Costa, Playa, Mar.
- [x] Cielo día/noche: gradiente, sol/luna (fondo→frente), estrellas, aurora, nubes.
- [x] Clima dinámico con transición suave (despejado/nieve/lluvia/niebla/viento).
- [x] Flora por capa y ríos tallados (valle + Costa).
- [x] UI, export PNG y parámetros de URL.
- [x] Documentación base.

## Fase 2 — Fauna endémica animada ✅ (hecha, v0.4.0)

- [x] `fauna.js`: sprites (matrices de píxeles) + frames + animación.
- [x] Cóndor, pudú, güiña, huemul.
- [x] Spawn determinista por chunk y actividad según hora.
- [x] Especies extra: puma, zorros, guanaco, vicuña, chingue, monito del monte, chinchilla,
      choroy, cachaña, flamenco, chungungo, pingüino de Humboldt.
- [x] Movimientos `swim` (marinas) y `flock` (bandadas).
- [x] Cielo nocturno con estrellas y **Vía Láctea**.
- [x] Tests de fauna (determinismo, actividad, cauce, ventana) y dorado.

## Fase 3 — Pulido ✅ (hecha, v1.0.0)

- [x] Relación de aspecto configurable (16:9/21:9/32:9/custom) en GUI y URL ([D-013](12-decisiones.md)).
- [x] Momentos raros: **18 de septiembre**, **Leo Rey** y **Kung Leo** ([D-014](12-decisiones.md)).
- [x] Densidad de fauna según rareza real (UICN/MMA) ([D-015](12-decisiones.md), v0.5.0).
- [x] **Biomas/regiones** ([D-016](12-decisiones.md), v0.6.0).
    - [x] Norte árido, Centro, Sur boscoso seleccionables (`?biome=`).
    - [x] Transición procedural entre biomas según la posición recorrida (`biomeWeights`).
    - [x] **Desierto florido** en el norte (`?bloom=`, [D-017](12-decisiones.md)).
    - [x] Geometría por bioma: amplitud y línea de nieve ([D-018](12-decisiones.md), v0.7.0).
    - [x] Flora nueva por bioma: cactus, alerce, nalca, colihue y palma chilena.
- [x] Estaciones del año (tinte, línea de nieve y clima) ([D-019](12-decisiones.md), v0.8.0).
- [x] **Sincronía con Chile**: hora y estación reales y amanecer/atardecer solar
      ([D-027](12-decisiones.md), v0.12.0).
- [x] Más flora (coihue/roble, copihue, michay) y fauna (choique, chucao, huillín)
      ([D-022](12-decisiones.md), v0.9.0).
- [x] Detalles: estrellas fugaces, huellas y reflejos en el agua ([D-021](12-decisiones.md), v0.9.0).
- [x] Rana de Darwin ([D-018](12-decisiones.md), v0.7.0) y refinar sprites de fauna.
- [x] guardar/cargar "vistas" favoritas (semilla + x + hora + clima + aspecto)
      ([D-020](12-decisiones.md), v0.9.0).
- [x] **Modo fondo de pantalla**: kiosco sin HUD/cursor/marco, `fit=cover`, pantalla completa,
      atajos de teclado y rendimiento (FPS, pausa) ([D-026](12-decisiones.md), v0.11.1).
- [x] **Optimización de recursos**: caché de columnas/bioma/paleta, FPS adaptativo y medición
      (`?perf=1`, `npm run bench`) ([D-028](12-decisiones.md), v0.13.0).
- [x] **Clima completo** ([D-029](12-decisiones.md), v0.14.0): crossfade entre climas, viento que
      inclina la precipitación y agita el mar, y **tormenta eléctrica** con relámpagos.
- [x] **Fases de la luna** y resplandor según estación ([D-030](12-decisiones.md), v0.15.0).
- [x] **Flora estacional** (hojas, brotes, flores), **chaura**, **ríos con nacimiento orgánico** y
      **sprites icónicos refinados** ([D-031](12-decisiones.md), [D-032](12-decisiones.md),
      [D-033](12-decisiones.md), v0.16.0).
- [x] **Cierre de docs** ([D-035](12-decisiones.md)): todos los documentos en *estable*, altitud y
      frecuencia por capa documentadas, backlog post-1.0 consolidado aquí.

## Pendientes transversales

- [x] **Ríos**: integrados como quebrada vertical centrada en la muesca (ver [07 · Ríos](07-rios.md)).
- [x] **Tests**: suite sin dependencias (`npm test`): lógica, smoke de render y snapshots dorados;
      incluye spawn por capa (ríos/flora), fauna, clima, cielo y estaciones. Ver
      [`../test/README.md`](../test/README.md).
- [x] Documentar la paleta maestra por hora en tabla ([14 · Paleta maestra](14-paleta-maestra.md),
      generada con `npm run palette`).
- [x] Guía de estilo de sprites (contorno, sombra, luz, dithering manual) en
      [08 · Arte pixel](08-arte-pixel.md).
- [x] Publicación: workflow de GitHub Pages (`.github/workflows/pages.yml`), botón "copiar enlace" y
      demo en vivo ([README](../README.md)).

## Fase 4 — Ampliación ✅ (hecha, v1.1.0)

- [x] **Flora de sotobosque**: quillay (centro y sur) y mañío (sur y Patagonia)
      ([D-037](12-decisiones.md), [05 · Flora](05-flora.md)).
- [x] **Biomas altiplano y Patagonia** ([D-038](12-decisiones.md), [02 · Mundo](02-mundo.md)).
- [x] **Ríos**: meandro sutil dentro de la holgura y cauce con pendiente real
      ([D-039](12-decisiones.md), [07 · Ríos](07-rios.md)).

## Fase 5 — Detalles ✅ (hecha, v1.2.0)

- [x] **Export de tira larga** en PNG (8 pantallas, `Scene.exportStrip`)
      ([D-040](12-decisiones.md), [10 · UI y exportación](10-ui-y-export.md)).
- [x] **Momentos raros de fauna**: vuelo de cóndor, bandada y manada
      ([D-041](12-decisiones.md), [06 · Fauna](06-fauna.md)).
- [x] **Bioma austral/fiordos** con canales de agua tallados ([D-042](12-decisiones.md), [02 · Mundo](02-mundo.md)).
- [x] **Flora de sotobosque**: canelo, arrayán y notro ([D-043](12-decisiones.md), [05 · Flora](05-flora.md)).
- [x] **Sprites de fauna restantes** refinados ([D-044](12-decisiones.md), [08 · Arte pixel](08-arte-pixel.md)).
- [x] **Fichas de especies** generadas con `npm run specimens` ([especies/](especies/README.md)).
- [x] **Tags** de release `v1.0.1` y `v1.1.0` publicados.

## Post-1.0 (backlog)

- **Tira animada**: GIF/secuencia además del PNG ([10 · UI y exportación](10-ui-y-export.md)).
- **Más momentos raros** y más biomas (paisajes insulares, etc.).
- **Fauna/flora**: nuevas especies y refinar más sprites ([06 · Fauna](06-fauna.md), [05 · Flora](05-flora.md)).

## Backlog / ideas

- [x] Modo kiosco / screensaver (`?ui=0`): panel, botón, HUD y cursor ocultos; variantes de fondo
      (fullscreen, `fit=cover`, FPS, pausa) en [D-026](12-decisiones.md), v0.11.1.
- [x] **Sin audio**: el proyecto es una pieza solo visual para fondo de pantalla ([D-025](12-decisiones.md)).
