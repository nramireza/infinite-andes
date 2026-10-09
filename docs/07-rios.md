# 07 · Ríos

> Estado: en progreso (enfoque estable) · Actualizado: 2026-10-09

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
  1 desembocadura): **nace como un punto** (potencia 0.8, piso de 0.4 px) y se ensancha al bajar,
  con una ondulación leve (`wfreq`). El máximo (1.52·width) queda dentro de la muesca (2.2·width).
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

## Estado

Resuelto el problema principal (el agua ya no "flota" como cinta): al fijar el centro del canal a
la muesca, la silueta tallada y el agua coinciden. El ancho/profundidad se revisó con varias
semillas y capas ([D-032](12-decisiones.md)): el nacimiento ahora es punzante y con salto, sin
desalinear de la muesca. Pendiente menor:

- Valorar un meandro sutil dentro de la holgura (≈2.5 px por lado) y un cauce que siga la pendiente
  real derivando `u` de `ridgeHeight` en el centro; ambos quedan post-1.0 (riesgo de romper el
  "agua dentro del tallado" que costó fijar).

## Opciones evaluadas

| Opción | Descripción | Estado |
|--------|-------------|--------|
| Tallado por capa, quebrada vertical (actual) | Muesca + canal centrado en la capa, hereda parallax | En uso |
| Meandro en profundidad | El canal se desplaza en x según la profundidad | Descartado: el agua se salía de la muesca |
| Río por tramos | Un tramo por capa con parallax propio, unión oculta | Descartado por costuras |
| Río único | Una sola velocidad para todo el río | Descartado: se despega de todas las capas |

## Próximos pasos

- Post-1.0: meandro sutil y pendiente real (ver Estado); el resto queda cerrado.
- Ver [`12-decisiones.md`](12-decisiones.md) para el registro de decisiones.
