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
| Estación | `seasonSel` | `auto` (ciclo) o una fija |
| Momento | `momentSel` | `auto` (raro), `none`, `18sep`, `leorey`, `kungleo` |
| Región | `biomeSel` | `auto` (procedural), `norte`, `centro`, `sur` |
| Floración | `bloomSel` | `auto`, `on`, `off` |
| Vistas | `viewSel` / `viewName` / `btnSaveView` / `btnDelView` | Guardar/cargar/eliminar vistas favoritas |
| Exportar PNG | `btnExport` | Descarga la vista actual |
| Copiar enlace | `btnCopy` | Copia la URL con la vista actual |
| HUD | `hud` | Semilla, `x`, hora, clima, estación y bioma |

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
| `x` | Posición de mundo (desactiva auto-scroll) | Sí, salvo con auto-scroll activo |
| `hour` | Hora fija (desactiva auto) | Sí (hora / paso del tiempo) |
| `weather` | Clima fijo | Sí (selector de clima) |
| `aspect` | Relación de aspecto (`32:9`, `2.4`, …) | Sí (selector / campo de relación) |
| `moment` | Momento raro | Sí (selector de momento) |
| `season` | Estación fija o `auto` | Sí (selector de estación) |
| `biome` | Región fija o `auto` | Sí (selector de región) |
| `bloom` | Floración (`auto`/`on`/`off`) | Sí (selector de floración) |
| `ui` | `0` oculta el panel (modo kiosco) | No |
| `fit` | `cover` (def., llena) o `contain` (encaja entero) | No |
| `fps` | Límite de fotogramas (def. `30`; `0` = sin límite) | No |

Al cargar, se leen `seed` (por defecto `andes`), `x`, `hour`, `weather`, `aspect`, `moment`,
`season`, `biome` y `bloom`. La carga inicial y las **vistas favoritas** comparten
`applyView`/`decodeView` de `src/views.js`.

## Vistas favoritas

El panel permite guardar el estado actual (semilla, `x`, hora, clima, relación, momento, estación,
región y floración) con un nombre y recargarlo luego. Se guardan en `localStorage`
(`infinite-andes:views`) como `{name, query}`; el selector **Vistas** carga y el botón `✕` elimina.
Cargar una vista ancla la posición y **desactiva el auto-scroll**. Ver [D-020](12-decisiones.md).

## Modo fondo de pantalla

`?ui=0` activa el **kiosco** (sin panel, botón, HUD, cursor ni marco) y `?fit=cover` llena la pantalla
(recortando), pensado para dejar el paisaje encendido. Clic en el paisaje (o la tecla `F`) entra en
**pantalla completa**. Atajos de teclado: `Espacio` auto-scroll, `←`/`→` desplazan, `H`/`P` muestran
u ocultan el panel, `F` pantalla completa. El loop limita a **30 fps** por defecto (`?fps=`), se
**pausa** al ocultar la pestaña y arranca quieto con `prefers-reduced-motion`. Ver
[D-026](12-decisiones.md).

## Pendiente

- TODO: exportar tira larga (rango de `x`) y/o GIF/secuencia (opcional).
- [x] Modos de kiosco adicionales: HUD y cursor ocultos en kiosco ([D-026](12-decisiones.md), v0.11.1).
- [x] Accesibilidad y atajos de teclado (flechas, espacio, pantalla completa) ([D-026](12-decisiones.md), v0.11.1).
