# 11 · Roadmap

> Estado: en progreso · Actualizado: 2026-10-08

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

## Fase 3 — Pulido (opcional) 🔄 (en progreso)

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
- [ ] Export de tira larga y/o secuencia (opcional, no prioritario para wallpaper).
- [x] Más flora (coihue/roble, copihue, michay) y fauna (choique, chucao, huillín)
      ([D-022](12-decisiones.md), v0.9.0).
- [x] Detalles: estrellas fugaces, huellas y reflejos en el agua ([D-021](12-decisiones.md), v0.9.0).
- [ ] Más "momentos" raros (vuelo de cóndor, bandada, manada).
- [x] Rana de Darwin ([D-018](12-decisiones.md), v0.7.0) y refinar sprites de fauna.
- [x] guardar/cargar "vistas" favoritas (semilla + x + hora + clima + aspecto)
      ([D-020](12-decisiones.md), v0.9.0).
- [x] **Modo fondo de pantalla**: kiosco sin HUD/cursor/marco, `fit=cover`, pantalla completa,
      atajos de teclado y rendimiento (FPS, pausa) ([D-026](12-decisiones.md), v0.11.1).

## Pendientes transversales

- [x] **Ríos**: integrados como quebrada vertical centrada en la muesca (ver [07 · Ríos](07-rios.md)).
- [x] **Tests**: suite sin dependencias (`npm test`): lógica, smoke de render y snapshots dorados;
      incluye spawn por capa (ríos/flora) y fauna. Ver [`../test/README.md`](../test/README.md).
- [x] Documentar la paleta maestra por hora en tabla ([14 · Paleta maestra](14-paleta-maestra.md),
      generada con `npm run palette`).
- [x] Guía de estilo de sprites (contorno, sombra, luz) en [08 · Arte pixel](08-arte-pixel.md).
- [x] Publicación: workflow de GitHub Pages (`.github/workflows/pages.yml`), botón "copiar enlace" y
      demo en vivo ([README](../README.md)).

## Próximos pasos (hacia v1.0)

1. **Export de tira larga** (opcional): rango de `x` en PNG y/o secuencia.
2. **Cierre de docs** (estados a *estable*, glosario, paleta) y README → **tag v1.0.0**.
   - *Post-1.0*: más momentos raros (vuelo de cóndor, bandada) y más biomas
     (altiplano/patagonia/austral/fiordos).
   - *Hecho en v0.11.1*: modo fondo de pantalla y rendimiento ([D-025](12-decisiones.md),
     [D-026](12-decisiones.md)); sin audio.
   - *Hecho en v0.9.0*: vistas favoritas + `?x=` ([D-020](12-decisiones.md)); estrellas fugaces,
     reflejos y huellas ([D-021](12-decisiones.md)); flora y fauna austral ([D-022](12-decisiones.md)).

## Backlog / ideas

- [x] Modo kiosco / screensaver (`?ui=0`): panel, botón, HUD y cursor ocultos; variantes de fondo
      (fullscreen, `fit=cover`, FPS, pausa) en [D-026](12-decisiones.md), v0.11.1.
- [x] **Sin audio**: el proyecto es una pieza solo visual para fondo de pantalla ([D-025](12-decisiones.md)).

