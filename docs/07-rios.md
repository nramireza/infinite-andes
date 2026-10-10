# 07 · Ríos

> Estado: estable · Actualizado: 2026-10-10

Implementado en `src/terrain.js` (`riverInfluence`, `riverCarve`, `channelHalf`, `riverEvents`,
`drawChannel`) y verificado con tests de spawn (`test/spawn.test.js`).

## Requisito

Los ríos deben verse **integrados al terreno** en el que aparecen, no como un elemento pegado
encima. Es decir, deben moverse **a la misma velocidad que su capa** (heredar el parallax) y que
el **contorno generado del terreno sea el contorno del río**.

Además: **no debe haber ríos en la playa ni en el mar**. Los ríos van de la cordillera hacia abajo,
por el valle y la Costa.

## Enfoque actual (Modelo A · quebrada vertical)

El río es un **cauce tallado dentro de la generación de la capa**, leído como una quebrada que baja
desde la cordillera hacia el nivel de la capa siguiente:

- **Config por capa** (`LAYERS[*].rivers`): presente en **Valle** (`spacing 1100`, `width 3.2`,
  `depth 7`, `wfreq 4.2`) y **Costa** (`spacing 1500`, `width 2.1`, `depth 5`, `wfreq 4.5`).
- **Muesca de entrada**: `ridgeHeight(layer, wx) = bankHeight(layer, wx) + riverCarve(layer, wx)`.
  En las columnas con río, la silueta se hunde (`riverCarve`), de modo que el borde generado forma
  el cauce. Al ser parte de la función de altura, **hereda el parallax** de la capa.
- **Canal centrado en la muesca**: `drawChannel` dibuja el agua centrada en `ev.xc` (el mismo
  punto que talla la muesca) con un **meandro sutil** en profundidad: `channelOffset` desplaza el
  centro hasta 0.55·`width` por lado dentro de la holgura libre (0.68·`width`), arranca centrado en
  el nacimiento y usa un seno determinista por evento ([D-039](12-decisiones.md)).
- **Conicidad y pendiente real**: `channelHalf(layer, seed, u)` define el ancho por profundidad `u`
  (0 nacimiento, 1 desembocadura): **nace como un punto** (potencia 0.8, piso de 0.4 px) y se
  ensancha al bajar, con una ondulación leve (`wfreq`). El máximo (1.52·width) queda dentro de la
  muesca (2.2·width). El nacimiento y el recorrido de `u` se derivan de la **altura real del
  terreno en el centro** (`ridgeHeight`), así el cauce sigue la pendiente del relieve ([D-039](12-decisiones.md)).
- **Nacimiento orgánico**: el agua brota unas filas **más abajo de la punta de la muesca**
  (desfase determinista por evento, `hash1(ev.seed)`) con un **pequeño salto** brillante
  (`pal.seaHi`) en la primera fila, como una cascada de 1–2 px ([D-032](12-decisiones.md)).
- **Integración**: el agua se recorta a `ridgeHeight` (no flota sobre el valle/cielo), lleva
  **bancos** oscuros a los lados y un brillo de borde. Color derivado de la paleta
  (`lerp(sea, seaHi, 0.3)`).
- **Oclusión natural**: la capa siguiente (más al frente) tapa la desembocadura, así que no hacen
  falta costuras entre capas.
- **Flora**: `floraSpawns` usa `bankHeight` y omite las columnas con `riverInfluence > 0.25`.
- **Fauna del cauce**: la rana de Darwin y el huillín (`RIVER_SPECIES` en `fauna.js`) se colocan
  aparte, en el **borde del cauce** (`ev.xc ± offset`), no por chunk ([D-022](12-decisiones.md)).
- **Fiordos** ([D-042](12-decisiones.md)): el mismo tallado se reutiliza con el config `fjords`
  (valle y Costa) y el sampler `setFjordStrength`, activo solo con el bioma **austral**; así los
  canales densos no afectan al resto del paisaje (ver [02 · Mundo](02-mundo.md)).

## Estado

Resuelto el problema principal (el agua ya no "flota" como cinta): al fijar el centro del canal a
la muesca, la silueta tallada y el agua coinciden. El ancho/profundidad se revisó con varias
semillas y capas ([D-032](12-decisiones.md)): el nacimiento es punzante y con salto. En v1.1.0 se
añadieron el **meandro sutil** (dentro de la holgura) y el **cauce que sigue la pendiente real**
(`u` derivado de `ridgeHeight`), cerrando los pendientes de ríos ([D-039](12-decisiones.md)).

## Opciones evaluadas

| Opción | Descripción | Estado |
|--------|-------------|--------|
| Tallado por capa, quebrada vertical (actual) | Muesca + canal centrado en la capa, hereda parallax | En uso |
| Meandro en profundidad | El canal se desplaza en x según la profundidad | En uso en versión **sutil** (≤0.55·width, dentro de la holgura); el meandro amplio sigue descartado |
| Río por tramos | Un tramo por capa con parallax propio, unión oculta | Descartado por costuras |
| Río único | Una sola velocidad para todo el río | Descartado: se despega de todas las capas |

## Próximos pasos

- Sin pendientes abiertos de ríos; el registro completo está en
  [`12-decisiones.md`](12-decisiones.md) ([D-032](12-decisiones.md), [D-039](12-decisiones.md)).
