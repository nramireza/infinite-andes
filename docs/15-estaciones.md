# 15 · Estaciones del año

> Estado: en progreso · Actualizado: 2026-10-08

El paisaje tiene un **ciclo estacional** que tiñe la paleta, mueve la **línea de nieve** y sesga el
**clima**. Implementado en [`src/seasons.js`](../src/seasons.js) y compuesto en `src/scene.js`
(ver [D-019](12-decisiones.md)).

## Las cuatro estaciones

| Estación | Carácter | `snowShift` | Clima favorecido |
|----------|----------|-------------|------------------|
| **verano** | base actual, cálido y despejado | −0.18 (nieve más alta) | despejado |
| **otoño** | ámbar/rojo en flora y Costa, horizonte cálido | +0.12 | viento, lluvia |
| **invierno** | frío y desaturado | +0.32 (nieve más baja) | nieve, lluvia, niebla, tormenta |
| **primavera** | verdes frescos | −0.05 | despejado |

- `snowShift` se **suma** al desplazamiento del bioma ([02 · Mundo](02-mundo.md)); solo actúa en
  capas que ya tienen nieve. El verano **no tiñe**: es la referencia base.

## Ciclo y mezcla

- **Real (por defecto)**: la fase sale de la **fecha del equipo** (`seasonPhaseForDate`,
  `src/clock.js`), con el **hemisferio sur** como referencia (verano dic–feb, otoño mar–may, invierno
  jun–ago, primavera sep–nov; [D-027](12-decisiones.md)). No avanza por tiempo de ejecución.
- **Ciclo rápido** (`?clock=fast`): ciclo temporal lento, **`SEASON_DURATION = 120 s`** por estación
  (año ≈ 8 min). La fase avanza con `seasonSpeed = 1/SEASON_DURATION` y envuelve cada 4.
- **Fijo**: `?season=verano|otono|invierno|primavera` o el selector **Estación** del panel.
- **Mezcla**: `seasonState(phase)` devuelve estación actual, siguiente y una mezcla `t` con
  **meseta + crossfade** (se sostiene ~60% y transiciona ~40%), de modo que hay estaciones claras y
  transiciones suaves, sin saltos.

## Composición de la paleta

Orden por fotograma en `scene.render`:

```
getPalette(hora, clima)  →  applySeason(estación)  →  applyBiome(bioma)
```

- `applySeason(pal, state, strength)` interpola claves de atmósfera y terreno/flora
  (`floraL/D`, `costaL/D`, `valleyL/D`, `sand/D`, `skyHorizon`). No toca astros ni mar.
- La fuerza del tinte se **atenúa de noche** (`strength · (1 − 0.85·nightAmount)`), para no lavar el
  cielo nocturno.
- El **bioma** se aplica al final: manda en lo regional ([D-016](12-decisiones.md)).

## Clima por estación

`pickSeasonWeather(state, rnd)` sortea el clima automático con los pesos `weatherBias` de la
estación mezclados entre actual y siguiente (invierno favorece nieve/lluvia/tormenta; verano,
despejado). Ver [04 · Clima](04-clima.md).

## Parámetros de URL

| Parámetro | Valores | Descripción |
|-----------|---------|-------------|
| `season`  | `auto` (def.), `verano`, `otono`, `invierno`, `primavera` | Estación fija o según reloj/ciclo |
| `clock`   | `real` (def.), `fast` | Estación y hora reales, o ciclo rápido |

## Pendientes

- [x] duración del día por estación: el sol real mueve amanecer/atardecer ([D-027](12-decisiones.md), v0.12.0).
- TODO: variantes de flora por estación (caída de hojas, brotes) además del tinte.
- [x] estaciones del hemisferio sur como referencia explícita ([D-027](12-decisiones.md), v0.12.0).
