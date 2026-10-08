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
- [x] Densidad de fauna según rareza real (UICN/MMA) ([D-015](12-decisiones.md)).
- [ ] Biomas/regiones seleccionables (Norte árido, Centro, Sur boscoso).
    - [ ] dejar que los biomas cambien de manera procedural.
- [ ] Estaciones del año (otoño en la Costa, nieve a menor altura en invierno).
- [ ] Export de tira larga y/o secuencia.
- [ ] Más flora (nalca, palma chilena, alerce, cactus, colihue).
- [ ] Detalles: estrellas fugaces, huellas, reflejos en el agua.
- [ ] Más "momentos" raros (vuelo de cóndor, bandada, manada).
- [ ] Rana de Darwin y refinar sprites de fauna.
- [ ] guardar/cargar "vistas" favoritas (semilla + x + hora + clima + aspecto).

## Pendientes transversales

- [x] **Ríos**: integrados como quebrada vertical centrada en la muesca (ver [07 · Ríos](07-rios.md)).
- [x] **Tests**: suite sin dependencias (`npm test`): lógica, smoke de render y snapshots dorados;
      incluye spawn por capa (ríos/flora) y fauna. Ver [`../test/README.md`](../test/README.md).
- [x] Documentar la paleta maestra por hora en tabla ([14 · Paleta maestra](14-paleta-maestra.md),
      generada con `npm run palette`).
- [x] Guía de estilo de sprites (contorno, sombra, luz) en [08 · Arte pixel](08-arte-pixel.md).
- [ ] Publicación (hosting estático, GitHub Pages u otro).

## Backlog / ideas

- TODO: modo kiosco / screensaver (`?ui=0` y variantes).
- TODO: audio ambiente (sin decidir).

