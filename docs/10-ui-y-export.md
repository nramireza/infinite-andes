# 10 · UI y exportación

> Estado: estable · Actualizado: 2026-10-10

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
| Región | `biomeSel` | `auto` (procedural), `altiplano`, `norte`, `centro`, `sur`, `patagonia` |
| Floración | `bloomSel` | `auto`, `on`, `off` |
| Vistas | `viewSel` / `viewName` / `btnSaveView` / `btnDelView` | Guardar/cargar/eliminar vistas favoritas |
| Exportar PNG | `btnExport` | Descarga la vista actual |
| Exportar tira | `btnExportStrip` | Descarga una tira de 8 pantallas desde la cámara |
| Copiar enlace | `btnCopy` | Copia la URL con la vista actual |
| HUD | `hud` | Semilla, `x`, hora, clima, estación y bioma |

## Estado de la escena (`Scene`)

- `camera.x` — posición horizontal del mundo.
- `autoScroll`, `scrollSpeed` — recorrido automático.
- `hour` (0–24), `timeAuto`, `timeSpeed` (0.125 h/s) — ciclo solar.
- `clock` (`real`/`fast`), `lat`/`longitude` — reloj y cálculo solar.
- `weatherAuto`, `weatherTimer`, `weather` — clima y transiciones.
- `season`/`seasonPhase` — estación fija o ciclo.
- `moment`, `biomeMode`, `bloomMode` — momento raro, región y floración.
- `seed` — semilla activa; `tSec`/`dayNum` — tiempo y días simulados.

## Exportación PNG

`Scene.exportPNG()` usa `canvas.toBlob` y descarga un archivo
`infinite-andes_<seed>_<HHMM>.png` con la vista actual (al tamaño interno vigente, p. ej.
960×270 a 32:9).

`Scene.exportStrip(tiles)` exporta una **tira larga** de varias pantallas (8 por defecto, máx. 40)
hacia la derecha desde la cámara. Renderiza una sola vez en un lienzo ancho (`W·tiles`), así el cielo
y el parallax continúan sin costuras; descarga `infinite-andes_<seed>_strip<N>_x<X>.png`.

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
| `clock` | Reloj `real` (def.) o `fast` | Sí (selector de reloj) |
| `lat` | Latitud para el sol (def. −33.45) | No |
| `ui` | `0` oculta el panel (modo kiosco) | No |
| `fit` | `cover` (def., llena) o `contain` (encaja entero) | No |
| `fps` | Límite de fotogramas (def. `30`; `0` = sin límite) | No |
| `perf` | `1` muestra un overlay con ms/frame y fps | No |
| `info` | `1` activa el modo información al clic (propuesto) | No |
| `wall` | `1` fuerza el modo fondo/PWA (propuesto) | No |
| `activity` | URL del puente local de sensores (propuesto, ver [17](17-reactividad-sistema.md)) | No |

Al cargar, se leen `seed` (por defecto `andes`), `x`, `hour`, `weather`, `aspect`, `moment`,
`season`, `biome` y `bloom`. La carga inicial y las **vistas favoritas** comparten
`applyView`/`decodeView` de `src/views.js`.

## Vistas favoritas

El panel permite guardar el estado actual (semilla, `x`, hora, clima, relación, momento, estación,
región y floración) con un nombre y recargarlo luego. Se guardan en `localStorage`
(`infinite-andes:views`) como `{name, query}`; el selector **Vistas** carga y el botón `✕` elimina.
Cargar una vista ancla la posición y **desactiva el auto-scroll**. Ver [D-020](12-decisiones.md).

## Reloj real y sol

Por defecto (`clock=real`) la escena sigue la **hora local del equipo** y la **estación del
hemisferio sur** de la fecha; el amanecer/atardecer se calculan para Chile central (lat −33.45) y
reasignan la curva de la paleta y la posición del astro, así las 20:00 de verano se ven de día y en
invierno oscuras ([D-027](12-decisiones.md)). El selector **Reloj** alterna con el **ciclo rápido**
(`clock=fast`, día ≈3 min, año ≈8 min). Al arrastrar la hora o fijar `?hour=` se pasa a reloj rápido.

## Modo fondo de pantalla

`?ui=0` activa el **kiosco** (sin panel, botón, HUD, cursor ni marco) y `?fit=cover` llena la pantalla
(recortando), pensado para dejar el paisaje encendido. Clic en el paisaje (o la tecla `F`) entra en
**pantalla completa**. Atajos de teclado: `Espacio` auto-scroll, `←`/`→` desplazan, `H`/`P` muestran
u ocultan el panel, `F` pantalla completa. El loop limita a **30 fps** por defecto (`?fps=`), se
**pausa** al ocultar la pestaña y arranca quieto con `prefers-reduced-motion`. Ver
[D-026](12-decisiones.md) y [D-028](12-decisiones.md). Con `?wall=1` se entra directo en kiosco y se
mantiene la pantalla encendida (**Wake Lock**); además la app es **instalable como PWA**
(`manifest.webmanifest` + `sw.js`, uso offline) ([D-050](12-decisiones.md),
[16 · Modos de visualización](16-modos-de-visualizacion.md)).

## Modo información al clic (propuesto)

`?info=1` (o un interruptor del panel) activa un modo en el que **hacer clic/tap sobre una especie
muestra su ficha**. El *hit-test* reutiliza los spawns deterministas de flora y fauna
(`floraSpawns`/`faunaSpawns`) en coordenadas internas (altura 270 px): al hacer clic se recalcula la
lista del fotograma y se busca la especie cuyo *bounding box* contiene el punto, priorizando las capas
delanteras. La ficha es un panel DOM con la metadata del registro (`common`, `sci`, `endemism`,
`iucn`, `chile`, `notes`) y, si existe, su referencia ([18 · Referencias](18-referencias.md)). El modo
es **opt-in**: sin él, el clic sigue entrando en pantalla completa en kiosco ([D-051](12-decisiones.md)).

## Rendimiento

`render()` es el grueso del gasto, así que se memoiza por píxel de mundo (columnas de terreno, bioma
y paleta) y el **FPS baja a 8 en reposo** (helper `effectiveFps` en `src/loop.js`). Para medir:

- `?perf=1`: overlay con ms/frame y fps objetivo.
- `npm run bench`: benchmark sin dependencias (`scripts/bench.mjs`) de `render()`, `update()` y por
  capa. Ver [D-028](12-decisiones.md).

El **primer fotograma se pinta siempre** (aunque la ventana no tenga foco) y, si el render falla, se
muestra el error en pantalla en lugar de un negro silencioso. Para desarrollo, `npm start` sirve con
`Cache-Control: no-store` (evita mezclar módulos ES viejos y nuevos).

## Pendiente

- GIF/secuencia animada (la tira larga en PNG ya está, v1.2.0): **post-1.0** (ver
  [11 · Roadmap](11-roadmap.md)).
- [ ] Modo información al clic de flora y fauna (`?info=1`) ([D-051](12-decisiones.md)).
- [x] Exportar tira larga (rango de `x`) en PNG ([D-040](12-decisiones.md), v1.2.0).
- [x] Modos de kiosco adicionales: HUD y cursor ocultos en kiosco ([D-026](12-decisiones.md), v0.11.1).
- [x] Accesibilidad y atajos de teclado (flechas, espacio, pantalla completa) ([D-026](12-decisiones.md), v0.11.1).
