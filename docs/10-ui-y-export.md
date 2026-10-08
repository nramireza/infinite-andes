# 10 · UI y exportación

> Estado: estable · Actualizado: 2026-10-08

Implementado en `index.html`, `style.css` y `src/ui.js`.

## Panel de control

Panel flotante arriba a la izquierda; se oculta/muestra con el botón `∞` (clase `.open`).
Estilo retro (monoespaciado, mayúsculas, acento cian).

| Elemento | ID | Acción |
|----------|----|--------|
| Semilla | `seedInput` | Escribir/cambiar semilla (`change` regenera) |
| Nueva semilla | `btnGenerate` | Semilla aleatoria de 6 dígitos |
| `◀` / `▶` | `btnPrev` / `btnNext` | Desplazar la cámara ±90 px |
| auto | `chkAuto` | Activar/desactivar auto-scroll |
| velocidad | `speed` | 0–120 (px/s) |
| Hora | `timeRange` | 0–1439 min (deslizador); desactiva el paso del tiempo |
| paso del tiempo | `chkTimeAuto` | Avance automático de la hora |
| Clima | `weatherSel` | `auto` o uno fijo |
| Relación | `aspectSel` / `aspectCustom` | 16:9 · 21:9 · 32:9 · personalizada (`W = round(270·ratio)`) |
| Momento | `momentSel` | `auto` (raro), `none`, `18sep`, `leorey`, `kungleo` |
| Exportar PNG | `btnExport` | Descarga la vista actual |
| Copiar enlace | `btnCopy` | Copia la URL con la vista actual |
| HUD | `hud` | Semilla, `x`, hora y clima |

## Estado de la escena (`Scene`)

- `camera.x` — posición horizontal del mundo.
- `autoScroll`, `scrollSpeed` — recorrido automático.
- `hour` (0–24), `timeAuto`, `timeSpeed` (0.125 h/s) — ciclo solar.
- `weatherAuto`, `weatherTimer` — cambio de clima.
- `moment` — modo de momento raro (`auto`/`none`/tipo).
- `seed` — semilla activa.

## Exportación PNG

`Scene.exportPNG()` usa `canvas.toBlob` y descarga un archivo
`infinite-andes_<seed>_<HHMM>.png` con la vista actual (al tamaño interno vigente, p. ej.
960×270 a 32:9).
Pendiente: exportar una **tira larga** seleccionable.

## URLs y compartición

`src/ui.js` lee y escribe parámetros en la URL con `history.replaceState`:

| Parámetro | Efecto | Se escribe al cambiar |
|-----------|--------|------------------------|
| `seed` | Semilla | Sí (semilla) |
| `hour` | Hora fija (desactiva auto) | Sí (hora / paso del tiempo) |
| `weather` | Clima fijo | Sí (selector de clima) |
| `aspect` | Relación de aspecto (`32:9`, `2.4`, …) | Sí (selector / campo de relación) |
| `moment` | Momento raro | Sí (selector de momento) |
| `ui` | `0` oculta el panel (modo kiosco) | No |

Al cargar, se leen `seed` (por defecto `andes`), `hour`, `weather`, `aspect` y `moment`.

## Pendiente

- TODO: exportar tira larga (rango de `x`) y/o GIF/secuencia.
- TODO: modos de kiosco adicionales (cursor oculto, sin HUD).
- TODO: accesibilidad y atajos de teclado (flechas para desplazar, espacio para auto-scroll).
