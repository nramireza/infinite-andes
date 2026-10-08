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
- [ ] Export de tira larga y/o secuencia.
- [ ] Más flora (coihue/roble, copihue, michay) y fauna (choique, chucao, huillín).
- [ ] Detalles: estrellas fugaces, huellas, reflejos en el agua.
- [ ] Más "momentos" raros (vuelo de cóndor, bandada, manada).
- [x] Rana de Darwin ([D-018](12-decisiones.md), v0.7.0) y refinar sprites de fauna.
- [ ] guardar/cargar "vistas" favoritas (semilla + x + hora + clima + aspecto).

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

1. **Export de tira larga**: rango de `x` en PNG y/o secuencia.
2. **Vistas favoritas + `?x=`**: deep-link de posición (semilla + x + hora + clima + aspecto + estación + bioma).
3. **Detalles**: estrellas fugaces y reflejos en el agua.
4. **Accesibilidad/teclado** (flechas para desplazar, espacio para auto-scroll) y **chequeo de rendimiento**.
5. **Cierre de docs** (estados a *estable*, glosario, paleta) y README → **tag v1.0.0**.
   - *Post-1.0*: más flora/fauna (coihue/roble, copihue; choique, chucao, huillín), audio y más
     biomas (altiplano/patagonia/austral/fiordos).

## Backlog / ideas

- [x] Modo kiosco / screensaver (`?ui=0`). Variantes extra pendientes (cursor oculto, sin HUD).
- TODO: audio ambiente (sin decidir).

