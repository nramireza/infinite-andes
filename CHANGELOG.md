# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y versionado [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Changed
- **Densidad de fauna según rareza real**: cada especie declara `rarity` (abundante…muy-rara) y el
  sorteo por chunk es **ponderado** (`pickWeighted`), basado en el estado UICN y la clasificación
  nacional (MMA). Lo común (zorros, chingue) domina y lo raro (huemul, chinchilla, chungungo) se ve
  poco. Se retiran los nombres duplicados en `LAYERS[*].fauna.species` y se ajusta el `chance` por
  capa. Nuevos tests de rareza y sorteo; dorado `fauna.*` regenerado. Ver [D-015](docs/12-decisiones.md).

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

[Unreleased]: https://example.com/infinite-andes/compare/v0.4.0...HEAD
[0.4.0]: https://example.com/infinite-andes/compare/v0.3.0...v0.4.0
[0.3.0]: https://example.com/infinite-andes/compare/v0.2.0...v0.3.0
[0.2.0]: https://example.com/infinite-andes/compare/v0.1.0...v0.2.0
[0.1.0]: https://example.com/infinite-andes/releases/tag/v0.1.0
