# 04 · Clima

> Estado: estable · Actualizado: 2026-10-09

Implementado en `src/weather.js` (partículas, niebla y relámpagos) y `src/palette.js` (tintes de
color). La lógica de cambio automático está en `src/scene.js`.

## Estados

| Estado | Clave | Efecto |
|--------|-------|--------|
| Despejado | `clear` | Sin partículas; colores base |
| Nieve | `snow` | Partículas blancas que caen con deriva; cielo y montañas desaturados |
| Lluvia | `rain` | Trazos inclinados por el viento; escena oscurecida y desaturada |
| Niebla | `fog` | Capas horizontales translúcidas + tinte gris; reduce contraste |
| Viento | `wind` | Ráfagas y hojas; colores algo más secos |
| Tormenta | `storm` | Lluvia densa y rápida, cielo muy oscuro y **relámpagos** |

El viento (`windLevel`) afecta además la velocidad de las partículas, la inclinación de la
precipitación y la agitación del mar ([D-029](12-decisiones.md)). La tormenta es un evento puntual:
con `strength` pleno, cada **1.5–6.5 s** cae un rayo (temporizador determinista por semilla fija),
dibujado entre el cielo y el terreno, con un flash que ilumina la escena brevemente.

## Transiciones

Los cambios de clima usan **crossfade**: el clima saliente se desvanece mientras el entrante sube
**en paralelo** (`prevType`/`prevStrength` en `Weather`, [D-029](12-decisiones.md)). Ambos avanzan a
la misma tasa, de modo que la suma de intensidades se mantiene ≈ 1 durante la transición (≈ 2 s) y
la escena nunca queda "a medio clima". La paleta se compone mezclando las dos paletas de clima
(`lerpPalettes` en `scene.render`) y las partículas de ambos estados se dibujan a la vez.

## Automático

Con el clima en **Automático**, cada **30–60 s** se elige un estado distinto del actual. El sorteo es
**ponderado por la estación** (`pickSeasonWeather`, ver [15 · Estaciones](15-estaciones.md)):
invierno favorece nieve/lluvia/tormenta y verano el despejado. Con el reloj real ([D-027](12-decisiones.md))
la estación es la de la fecha actual, así que el clima acompaña la época real de Chile (por ejemplo,
lluvia en invierno austral). El usuario puede **forzar** un clima desde el panel (`weatherSel`), lo
que desactiva el modo automático.

## Interacción con la paleta

`applyWeather(pal, weather, strength)` mezcla los colores hacia los tonos del clima según la
intensidad (`strength`), de modo que la nieve "blanquea" y la lluvia o la tormenta "ensombrecen"
toda la escena (cielo, montañas, valle, costa, arena, mar).

## Parámetros de URL

- `?weather=clear|snow|rain|fog|wind|storm` deja el clima fijo (útil para capturas).

## Pendiente

- Ninguna pendiente: el crossfade, el viento y la tormenta cerraron los TODOs anteriores
  ([D-029](12-decisiones.md)).
