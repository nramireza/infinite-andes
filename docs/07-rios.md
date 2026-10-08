# 07 · Ríos

> Estado: en progreso (enfoque estable) · Actualizado: 2026-10-08

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
- **Canal centrado en la muesca**: `drawChannel` dibuja el agua **centrada en `ev.xc`** (el mismo
  punto que talla la muesca), **sin meandro en profundidad**. Así el agua no se sale del tallado.
- **Conicidad**: `channelHalf(layer, seed, u)` define el ancho por profundidad `u` (0 nacimiento,
  1 desembocadura): angosto arriba y más ancho abajo, con una ondulación leve (`wfreq`).
- **Integración**: el agua se recorta a `ridgeHeight` (no flota sobre el valle/cielo), lleva
  **bancos** oscuros a los lados y un brillo de borde. Color derivado de la paleta
  (`lerp(sea, seaHi, 0.3)`).
- **Oclusión natural**: la capa siguiente (más al frente) tapa la desembocadura, así que no hacen
  falta costuras entre capas.
- **Flora**: `floraSpawns` usa `bankHeight` y omite las columnas con `riverInfluence > 0.25`.

## Estado

Resuelto el problema principal (el agua ya no "flota" como cinta): al fijar el centro del canal a
la muesca, la silueta tallada y el agua coinciden. Pendientes menores:

- TODO: revisar el ancho/profundidad final con más semillas y capas.
- TODO: valorar un nacimiento más orgánico (pequeño salto/desnivel) sin desalinear de la muesca.

## Opciones evaluadas

| Opción | Descripción | Estado |
|--------|-------------|--------|
| Tallado por capa, quebrada vertical (actual) | Muesca + canal centrado en la capa, hereda parallax | En uso |
| Meandro en profundidad | El canal se desplaza en x según la profundidad | Descartado: el agua se salía de la muesca |
| Río por tramos | Un tramo por capa con parallax propio, unión oculta | Descartado por costuras |
| Río único | Una sola velocidad para todo el río | Descartado: se despega de todas las capas |

## Próximos pasos

- TODO: prototipar variantes de conicidad y profundidad y comparar visualmente.
- TODO: considerar que el cauce siga la pendiente real (bajar hacia el mar) dentro de la capa.
- Ver [`12-decisiones.md`](12-decisiones.md) para el registro de decisiones.
