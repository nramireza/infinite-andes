# 04 · Clima

> Estado: estable · Actualizado: 2026-10-08

Implementado en `src/weather.js` (partículas y niebla) y `src/palette.js` (tintes de color).
La lógica de cambio automático está en `src/scene.js`.

## Estados

| Estado | Clave | Efecto |
|--------|-------|--------|
| Despejado | `clear` | Sin partículas; colores base |
| Nieve | `snow` | Partículas blancas que caen con deriva; cielo y montañas desaturados |
| Lluvia | `rain` | Trazos verticales; escena oscurecida y desaturada |
| Niebla | `fog` | Capas horizontales translúcidas + tinte gris; reduce contraste |
| Viento | `wind` | Ráfagas y hojas; colores algo más secos |

El viento (`windLevel`) afecta además la velocidad de las partículas y el bamboleo de la flora.

## Transiciones

Los cambios de clima son **suaves**: el clima actual baja a 0 (`transition = "out"`) y recién
entonces entra el nuevo desde 0 (`transition = "in"`). Evita los cortes bruscos.

## Automático

Con el clima en **Automático**, cada **30–60 s** se elige un estado distinto del actual. El sorteo es
**ponderado por la estación** (`pickSeasonWeather`, ver [15 · Estaciones](15-estaciones.md)):
invierno favorece nieve/lluvia/niebla y verano el despejado. Con el reloj real ([D-027](12-decisiones.md))
la estación es la de la fecha actual, así que el clima acompaña la época real de Chile (por ejemplo,
lluvia en invierno austral). El usuario puede **forzar** un clima desde el panel (`weatherSel`), lo
que desactiva el modo automático.

## Interacción con la paleta

`applyWeather(pal, weather, strength)` mezcla los colores hacia los tonos del clima según la
intensidad (`strength`), de modo que la nieve "blanquea" y la lluvia "ensombrece" toda la escena
(cielo, montañas, valle, costa, arena, mar).

## Parámetros de URL

- `?weather=clear|snow|rain|fog|wind` deja el clima fijo (útil para capturas).

## Pendiente

- TODO: transiciones reales entre dos climas simultáneos (crossfade) en vez de encadenar out→in.
- TODO: viento que incline la precipitación y mueva la superficie del mar.
- TODO: eventos puntuales (tormenta eléctrica con relámpagos).
