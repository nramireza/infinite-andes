# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y versionado [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [0.13.0] - 2026-10-08

### Changed
- **Optimización de recursos** ([D-028](docs/12-decisiones.md)): caché de columnas de terreno por
  píxel de mundo (tolerancia ≤1 px), geometría de bioma una vez por columna, máscara de campos por
  fila, memo acotado de `modeWeights`/`biomeAt` y de la paleta compuesta. `render()` ≈ **7.6 → 3.4
  ms/frame** (−56%) con **dibujo idéntico** a cámara fija.
- **FPS adaptativo**: baja a 8 fps en reposo (sin scroll ni clima) y pausa al ocultar la pestaña o
  perder el foco de la ventana (`effectiveFps` en `src/loop.js`).

### Added
- Instrumentación: `scripts/bench.mjs` (`npm run bench`) y overlay `?perf=1` (ms/frame y fps).
- Tests de memo, caché de columnas y `effectiveFps`.

## [0.12.0] - 2026-10-08

### Added
- **Sincronía con la realidad de Chile** ([D-027](docs/12-decisiones.md)): por defecto el paisaje
  sigue el **reloj real** (`?clock=real`): hora local y **estación del hemisferio sur** desde la
  fecha (`src/clock.js`) y **amanecer/atardecer reales** de Chile central (`src/sun.js`, lat −33.45,
  `?lat=`) que reasignan la luz y el astro. `?clock=fast` recupera el ciclo rápido. El clima
  automático usa el sesgo de la estación real. Selector **Reloj** en el panel y `clock` en vistas/URL.
  Tests `clock.test.js` y `sun.test.js`.

### Changed
- `sky.celestial` acepta `rise`/`set`; `scene.js` suma `clock`/`lat` y `paletteHour()`.

## [0.11.1] - 2026-10-08

### Added
- **Modo fondo de pantalla y rendimiento** ([D-026](docs/12-decisiones.md)): kiosco sin HUD/cursor ni
  marco, ajuste `?fit=cover|contain` (def. `cover`), pantalla completa con `F` o clic en kiosco y
  atajos de teclado (`Espacio`, `←/→`, `H/P`, `F`). El loop limita FPS (`?fps=`, def. 30), se pausa al
  ocultar la pestaña y arranca quieto con `prefers-reduced-motion`. Nuevo `src/loop.js` (puro) con
  `test/loop.test.js`.

### Changed
- **Alcance: sin audio** ([D-025](docs/12-decisiones.md)): el proyecto es una pieza solo visual
  pensada como fondo de pantalla vivo. Se retira el audio del roadmap y de las preguntas abiertas.

## [0.11.0] - 2026-10-08

### Changed
- **El desierto florido cubre el valle** ([D-024](docs/12-decisiones.md)): parche ~22x
  (`BLOOM_BLOCK` 20000→60000, `BLOOM_CHANCE` 0.20→0.28, `BLOOM_FLORA_WEIGHT` 2.5) y reparto vertical
  de las flores hacia el interior de la banda visible de cada capa (`depth` determinista en
  `floraSpawns`, aplicado en `placeFlora`), en vez de solo en el contorno. `applyBiome` refuerza y
  amplía el rubor de floración al suelo del valle. Test nuevo de reparto vertical.

## [0.10.0] - 2026-10-08

### Changed
- **Desierto florido más extenso y menos frecuente** ([D-023](docs/12-decisiones.md)): los parches de
  flores del norte ahora miden ~7x (bloque 6000→20000 px, con envolvente en meseta) y aparecen más
  raros (`BLOOM_CHANCE` 0.18→0.20). La puerta de norte se evalúa en el **centro del bloque**, así el
  parche no queda recortado por el ancho de las regiones norte del ruido. El racimo `drawFlower`
  crece ~10x (más tallos y más ancho). Test nuevo de ancho de parche.

## [0.9.0] - 2026-10-08

### Added
- **Vistas favoritas y deep-link de posición** ([D-020](docs/12-decisiones.md)): nuevo
  `src/views.js` (serialización pura del estado) y `?x=` en la URL. Al abrir un enlace con `x` se
  **desactiva el auto-scroll** para caer exacto. El panel suma un selector de **Vistas** con
  guardar/eliminar (persistencia en `localStorage`). Tests `views.test.js`.
- **Detalles visuales** ([D-021](docs/12-decisiones.md)): **estrellas fugaces** deterministas
  (`meteorAt` en `sky.js`, solo de noche), **reflejo del astro** sobre el mar (`drawSea` recibe el
  estado celeste) y **huellas** desvanecidas tras la fauna que camina (puma, huemul, guanaco,
  culpeo, chilla). Tests de meteoro, reflejo y sprites.
- **Flora austral y de sotobosque** ([D-022](docs/12-decisiones.md)): `coihue`, `roble`, `copihue`
  (enredadera) y `michay`, repartidos por el **sur** y la Costa.
- **Fauna nueva** ([D-022](docs/12-decisiones.md)): `choique` (ñandú petizo), `chucao` (ave de
  sotobosque) y `huillín` (lontra de río, en el borde del cauce). La pasada de río se generaliza a
  `RIVER_SPECIES` (la rana conserva su siembra y su dorado).

### Changed
- `ui.js`: `updateURL` incluye `x` (solo si el auto-scroll está pausado) y unifica la aplicación de
  estado con `applyView`/`decodeView`; la carga inicial y los favoritos comparten el mismo camino.
- `terrain.js`: `drawSea` acepta `cel` para el reflejo; `scene.js` le pasa el estado del astro.
- `fauna.js`: `drawFauna` recibe `W` y dibuja huellas; nuevos movimientos/campos en `SPECIES`.
- Regenerados los dorados `biome.*`, `flora.*` y `fauna.*`.

## [0.8.0] - 2026-10-08

### Added
- **Estaciones del año** ([D-019](docs/12-decisiones.md)): nuevo `src/seasons.js` con
  verano/otoño/invierno/primavera. Tinte de paleta (`applySeason`), desplazamiento de la **línea de
  nieve** (`snowShift`, sumado al del bioma) y **sesgo de clima** (`pickSeasonWeather`). Ciclo
  automático lento (≈2 min por estación, año ≈8 min) con meseta + crossfade, o fijo con `?season=` y
  el selector **Estación**. El verano no tiñe; el tinte se atenúa de noche.
- Tests `seasons.test.js` (ciclo, nieve, sesgo de clima, sin mutación) y dorado `palette.season.*`.
- Documento [15 · Estaciones](docs/15-estaciones.md).

### Changed
- `scene.js`: composición de paleta **hora → clima → estación → bioma**; el sampler de geometría suma
  el `snowShift` de la estación; el clima automático pasa de sorteo uniforme a ponderado por estación.
- `04-clima.md` y `02-mundo.md` actualizados; UI con selector de estación y HUD.

## [0.7.0] - 2026-10-08

### Added
- **Geometría por bioma** ([D-018](docs/12-decisiones.md)): cada bioma declara `ampMul` y `snowShift`
  y `biomeGeometry` los mezcla por pesos; `setBiomeGeometry` los aplica en `bankHeight`, `drawLayer`
  y `drawChannel`. La geometría es función de `worldX` (no de la cámara), el `snowShift` solo afecta
  capas con nieve y sin sampler (tests/dorados) el factor es 1. El norte baja el relieve y sube la
  nieve; el sur lo eleva y la baja.
- **Flora nueva**: `cactus` (norte), `alerce`, `nalca` y `colihue` (sur) y `palma` chilena (centro).
  Nuevas funciones de dibujo en `flora.js` y pools de bioma/`LAYERS` actualizados.
- **Rana de Darwin** (`Rhinoderma darwinii`): nueva especie con movimiento `sit`, colocada en el
  **borde del cauce** de valle y Costa (no por chunk), activa de día y de rareza `muy-rara`.

### Changed
- El bioma **centro** deja de ser pixel-idéntico: se le añaden palma (flora) y rana (fauna). Se
  regeneran los dorados `flora.*`, `fauna.rana` y `biome.*`.
- `faunaSpawns` filtra la rana del sorteo por chunk y la coloca en una pasada dedicada junto al agua.
- Docs `02`, `05` y `06` y `test/README.md` actualizados; capturas regeneradas.

## [0.6.0] - 2026-10-08

### Added
- **Biomas y regiones** (`src/biomes.js`): presets **norte** (árido), **centro** y **sur** (boscoso).
  El bioma se combina de forma **procedural** (`biomeWeights`, ruido de baja frecuencia: el paisaje
  cambia al recorrer) o **fija** con `?biome=norte|centro|sur` y el selector **Región**. Tiñe la
  paleta de terreno/flora/suelo (`applyBiome`, nunca cielo ni astros) y pondera los pools de flora y
  fauna por capa. El **norte árido no tiene araucaria**. Ver [D-016](docs/12-decisiones.md).
- **Desierto florido** (`bloomAt`): estado del bioma norte con **parches** raros de flores (tipo
  `flower`), rubor de tinte en el suelo y más actividad de aves y zorros. Se controla con
  `?bloom=auto|on|off` y el selector **Floración**. Ver [D-017](docs/12-decisiones.md).
- Tests `biomes.test.js` (determinismo, mesetas de pesos, floración acotada al norte, pools, tinte) y
  smoke de render con biomas; dorados `biome.*`.

### Changed
- `flora.js`/`fauna.js`: `floraSpawns` y `faunaSpawns` aceptan un pool ponderado opcional
  (`poolAt`/`chanceAt`); el sorteo sigue consumiendo **un único `rng()`**, así el **centro** queda
  pixel-idéntico (dorados `flora.*` y `fauna.*` sin cambios).
- `scene.js`: `setBiome`/`setBloom` y aplicación del tinte y los pools por posición de mundo.
- UI: selectores **Región** y **Floración**; parámetros `?biome=` y `?bloom=` en la URL.

## [0.5.0] - 2026-10-08

### Changed
- **Densidad de fauna según rareza real**: cada especie declara `rarity` (abundante…muy-rara) y el
  sorteo por chunk es **ponderado** (`pickWeighted`), basado en el estado UICN y la clasificación
  nacional (MMA). Lo común (zorros, chingue) domina y lo raro (huemul, chinchilla, chungungo) se ve
  poco. Se retiran los nombres duplicados en `LAYERS[*].fauna.species` y se ajusta el `chance` por
  capa. Nuevos tests de rareza y sorteo; dorado `fauna.*` regenerado. Ver [D-015](docs/12-decisiones.md).
- **Documentación sincronizada** con el estado real: roadmap (publicación y modo kiosco marcados
  como hechos; biomas como próximo foco), movimientos `swim`/`flock` documentados en
  [06 · Fauna](docs/06-fauna.md) y estados de docs consolidados a *estable*.

## [0.4.0] - 2026-10-08

### Added
- **Relación de aspecto configurable** (`src/viewport.js`): altura fija de 270 px y ancho derivado
  del ratio; presets 16:9 (480), 21:9 (630) y **32:9 (960, por defecto)**, más modo personalizado.
  Selector en el panel, parámetro `?aspect=` y `ASPECT=` en `scripts/capture.sh`. El canvas se
  redimensiona en caliente (`Scene.resize`, `Weather.resize`). Ver [D-013](docs/12-decisiones.md).
- **Fauna completa de la Fase 2**: puma, zorro culpeo, zorro chilla, guanaco, vicuña, chingue,
  monito del monte, chinchilla, choroy, cachaña, flamenco, chungungo y pingüino de Humboldt
  (además de cóndor, huemul, pudú y güiña). Nuevos movimientos `swim` y `flock`; la fauna marina
  se dibuja sobre el mar. Ver [D-012](docs/12-decisiones.md).
- **Vía Láctea** en `sky.js`: banda de polvo estelar inclinada y determinista, tras las estrellas.
- **Momentos raros** (`src/moments.js`): 18 de septiembre (tinte patrio + papelitos), **Leo Rey**
  (cumbia) y **Kung Leo** (alter ego de Mortal Kombat, con destello "MORTAL KUMBIA"). Disparo
  automático raro, forzable con `?moment=` y desde el panel. Ver [D-014](docs/12-decisiones.md).
- **Publicación**: workflow de GitHub Pages, botón "copiar enlace" y modo kiosco `?ui=0`.
- Documentación: [14 · Paleta maestra](docs/14-paleta-maestra.md) generada con `npm run palette`,
  guía de estilo de sprites y unificación de la resolución en todos los docs.

### Changed
- `index.html`: canvas interno a **960×270** (32:9) por defecto.
- `scene.js`: `placeFauna` se llama para todas las capas, incluido el mar.
- Tests: `W/H` desde `viewport.js`; nuevos tests de viewport, cielo (Vía Láctea) y momentos.

## [0.3.0] - 2026-10-08

### Added
- **Fauna endémica animada** (Fase 2): nuevo `src/fauna.js` con **cóndor, huemul, pudú y güiña**.
  Sprites como matrices de píxeles mapeadas a `getPalette` (responden a hora y clima), 2 frames
  cada una y vaivén senoidal determinista.
- Spawn de fauna por *chunk* con `hashInt` y actividad por hora (día/crepúsculo/noche); los
  terrestres siguen `bankHeight` y evitan el cauce; los voladores trazan trayectoria en el cielo
  de su capa. Config `fauna` en `LAYERS` (andes, precordillera, valle, costa).
- `rng.js`: helper `hashInt` (hash entero de 32 bits) para sembrar PRNGs. `hash1` pasa a ser
  `hashInt / 2³²` (mismos valores).
- Tests de fauna (`test/fauna.test.js`) y dorado `fauna.*`; test de `hashInt` en `rng.test.js`.

### Fixed
- **Cuelgue del render por `dt` negativo**: en el primer cuadro `now - last` podía ser negativo,
  dejando `tSec` < 0 y el índice de frame de fauna en negativo (`frames[-1]`), lo que lanzaba
  `TypeError` y detenía el loop (pantalla congelada/negra). Se acota `dt` a `[0, 0.05]`, el
  índice de frame envuelve con signo seguro y el loop lleva `try/catch` de red de seguridad.
- **Siembra del PRNG por chunk**: `mulberry32(hash1(...))` sembraba con una fracción que
  `mulberry32` truncaba a 0, así que todos los chunks compartían la misma secuencia. La flora
  solo producía el primer tipo (`valle` = solo `bush`, `costa` = solo `lenga`); ahora mezcla
  todos sus tipos. Ver [D-011](docs/12-decisiones.md).

### Changed
- `scene.js`: `placeFauna` se dibuja por capa tras `placeFlora`.
- Dorado `flora.*` regenerado por el arreglo de siembra.

## [0.2.0] - 2026-10-08

### Added
- Scaffolding de documentación (carpeta `docs/`, plantillas, `AGENTS.md`).
- Tests automatizados sin dependencias (`npm test` con `node --test`): lógica pura
  (rng, noise, terrain, palette), smoke de render con contexto 2D falso y snapshots dorados
  (`test/golden.json`, regenerables con `UPDATE_GOLDEN=1 npm test`).
- Tests de *spawn* por capa con parallax: ríos (`riverEvents`) y flora (`floraSpawns`),
  determinismo, ventana de pantalla y exclusión del cauce.
- Test de orden de render del cielo (astro antes que nubes, nubes antes que terreno).
- Capturas versionadas (`npm run shots`): carpeta `screenshots/v<versión>-<hash|fecha>/` con la
  matriz de semillas/horas/climas, `manifest.json` y `contact-sheet.png`.

### Changed
- Cielo: las **nubes tapan al sol/luna y a las estrellas**. El astro se dibuja al fondo
  (`sky.drawBody`) antes de las nubes y el terreno; se retira la inserción por profundidad `k`.
  Ver [D-009](docs/12-decisiones.md).
- Ríos: rediseñados como **quebrada vertical** (Modelo A) tallada dentro de la capa (valle y
  Costa); el canal se centra en la muesca (sin meandro en profundidad) y se ensancha en conicidad.
  La capa siguiente ocluye la desembocadura. *(Integración estable.)*
- `flora.js`: se separa el cálculo de posiciones (`floraSpawns`, puro y testeable) del dibujo
  (`placeFlora`).
- `terrain.js`: se exporta `riverEvents`; se retira el meandro en profundidad y sus campos
  `amp`/`freq` en `LAYERS[*].rivers`.

## [0.1.0] - 2026-10-08

Primera versión funcional (Fase 1: paisaje, cielo y clima).

### Added
- Canvas pixel-art 480×270 escalado con `image-rendering: pixelated`.
- 6 capas geográficas con parallax: Andes, Precordillera, Valle, Costa, Playa y Mar.
- Andes siempre nevados, escarpados, con volcanes cónicos y penacho, y vetas de roca.
- Valle central protagonista con textura de campos.
- Parallax infinito y determinista por semilla (PRNG + ruido fBm/ridged).
- Cielo con gradiente día/noche, sol y luna (trayectoria fondo→frente), estrellas,
  nubes y aurora austral.
- Clima dinámico: despejado, nieve, lluvia, niebla y viento, con transición suave.
- Flora: araucaria/pehuén, lenga/coihue, cultivos, arbustos, rocas y pasto.
- Ríos tallados en el valle y la Costa con curso meándrico sinusoidal.
- Panel de control (semilla, scroll, hora, clima), export PNG y parámetros de URL.

[Unreleased]: https://example.com/infinite-andes/compare/v0.9.0...HEAD
[0.9.0]: https://example.com/infinite-andes/compare/v0.8.0...v0.9.0
[0.8.0]: https://example.com/infinite-andes/compare/v0.7.0...v0.8.0
[0.7.0]: https://example.com/infinite-andes/compare/v0.6.0...v0.7.0
[0.6.0]: https://example.com/infinite-andes/compare/v0.5.0...v0.6.0
[0.5.0]: https://example.com/infinite-andes/compare/v0.4.0...v0.5.0
[0.4.0]: https://example.com/infinite-andes/compare/v0.3.0...v0.4.0
[0.3.0]: https://example.com/infinite-andes/compare/v0.2.0...v0.3.0
[0.2.0]: https://example.com/infinite-andes/compare/v0.1.0...v0.2.0
[0.1.0]: https://example.com/infinite-andes/releases/tag/v0.1.0
