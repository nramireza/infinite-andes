# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y versionado [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [1.6.0] - 2026-10-10

### Changed
- **Altura relativa de la flora por especie** ([D-049](docs/12-decisiones.md)): cada entrada de
  `FLORA` define un `height` (multiplicador del `size` de la capa) y una `heightM` (altura real
  típica). Los árboles (araucaria/alerce ×1.9, coihue ×1.7, roble ×1.5) destacan sobre los arbustos
  (michay ×0.7, chaura ×0.6) y el pasto (×0.5) sin romper la perspectiva por parallax. Solo cambia
  el `size`: posición, tipo y determinismo quedan igual; los dorados `flora.*` se regeneran
  (intencional). Fichas y tabla de 05–06 con la altura real (`npm run species`).

## [1.5.0] - 2026-10-10

### Changed
- **Silueta y hábito de la flora** ([D-048](docs/12-decisiones.md)): los `DRAWERS` de `src/flora.js`
  se redibujan con el porte real de cada planta (copa de paraguas de la araucaria, frondas radiales
  de la palma, candelabro del copao, roseta dentada de la nalca, nudos del colihue, copas irregulares
  de los Nothofagus). Solo cambia el dibujo: `size` por capa, spawn y dorados `flora.*` quedan
  **intactos**.

## [1.4.0] - 2026-10-10

### Changed
- **Silueta y proporción de la fauna** ([D-047](docs/12-decisiones.md)): las 21 matrices de `SPECIES`
  se redibujan a **escala relativa por especie** y con anatomía más fiel (cuello y patas largos en
  camélidos y ñandú; cola poblada en zorros; perfil y cola del puma; cola de los loros; cuello en S
  del flamenco; astas del huemul; cuerpos alargados de las nutrias). Solo cambian `frames`/`palette`
  (con `k` añadido donde aporta); el spawn y los dorados `fauna.*` quedan **intactos**. La flora
  queda para una tanda posterior.

## [1.3.0] - 2026-10-10

### Changed
- **Registro único de especies** ([D-045](docs/12-decisiones.md)): `FLORA` (`src/flora.js`) y
  `SPECIES` (`src/fauna.js`) reúnen identidad, metadata, **zonas** (pools) y definición de dibujo.
  `biomes.js` deriva los pools de las `zones` con tablas precomputadas (sin listas paralelas en
  `LAYERS`/`BIOMES`, que ahora solo guardan lo espacial) y `RIVER_SPECIES`/`BLOOM_FAUNA` salen de
  flags (`placement`/`bloom`). Los dorados `flora.*`/`biome.*`/`fauna.*` se regeneran por el nuevo
  orden de pools (intencional).
- **Docs generadas** ([D-045](docs/12-decisiones.md)): `npm run species` (`scripts/species.mjs`)
  regenera las fichas de `docs/especies/` y las tablas de 05/06 desde los registros.
- **Sprites de flora procedurales** sin caché, evaluado ([D-046](docs/12-decisiones.md)).

### Added
- `test/species.test.js`: valida el registro (tipos, zonas válidas, pools y `FLORA` = `DRAWERS`).
- `common` en los tipos genéricos de flora y campos `zones`/`placement`/`bloom` por especie.

### Fixed
- La fauna marina (chungungo, pingüino) vuelve a estar disponible en el mar de **todos** los
  biomas, no solo centro/austral.

## [1.2.0] - 2026-10-10

### Added
- **Export de tira larga** ([D-040](docs/12-decisiones.md)): `Scene.exportStrip(tiles)` y botón
  **Tira** descargan un PNG de 8 pantallas seguidas (máx. 40) renderizado de una sola vez, sin
  costuras en el cielo ni el parallax.
- **Momentos de fauna** ([D-041](docs/12-decisiones.md)): **vuelo de cóndor** con escolta,
  **bandada** en V y **manada** de guanacos, seleccionables con `?moment=` y en el panel.
- **Bioma austral/fiordos** ([D-042](docs/12-decisiones.md)): sexto bioma con canales de agua
  densos tallados en valle y Costa (config `fjords` + `setFjordStrength`), islas boscosas y fauna de
  borde de agua. Sin ese bioma, el terreno es idéntico al anterior.
- **Flora de sotobosque austral** ([D-043](docs/12-decisiones.md)): **canelo**, **arrayán** y
  **notro** (flores rojas).
- **Fichas de especies** ([D-044](docs/12-decisiones.md)): `npm run specimens` genera una ficha por
  especie (flora y fauna) en `docs/especies/`.

### Changed
- **Sprites de fauna restantes** refinados (zorros, camélidos, chingue, monito, chinchilla, loros,
  etc.) con ojos, vientre y cola ([D-044](docs/12-decisiones.md)).
- Documentación al día (fichas, momentos, biomas, tira) y **tags** `v1.0.1`/`v1.1.0` publicados.

## [1.1.0] - 2026-10-09

### Added
- **Biomas altiplano y Patagonia** ([D-038](docs/12-decisiones.md)): `BIOME_IDS` pasa a **cinco**
  (`altiplano → norte → centro → sur → patagonia`) y `biomeWeights` se generaliza (meseta con
  mezcla al vecino). El **altiplano** eleva el relieve y añade puna sin árboles (vicuña, guanaco,
  chinchilla, flamenco); la **Patagonia** baja la línea de nieve y trae estepa fría (guanaco,
  choique, puma, huemul). Selector **Región**, `?biome=` y las vistas aceptan los cinco.
- **Flora de sotobosque** ([D-037](docs/12-decisiones.md)): **quillay** (*Quillaja saponaria*,
  esclerófilo endémico con flores blancas en primavera/verano) en centro y sur, y **mañío**
  (*Podocarpus* spp., conífera austral oscura) en sur y Patagonia.
- **Ríos: meandro sutil y pendiente real** ([D-039](docs/12-decisiones.md)): `channelOffset`
  desplaza el canal dentro de la holgura de la muesca (≤0.55·`width`, rampa al nacimiento) y el
  nacimiento/`u` se derivan de `ridgeHeight` en el centro. El agua sigue recortada al tallado.

### Changed
- **Documentación al día**: enlaces reales del CHANGELOG a GitHub (y versiones 0.10–1.0), fauna sin
  la fila y nota obsoletas, estado de `Scene` y tabla de controles completos, roadmap con la
  Fase 4 y el backlog podado.
- Dorados regenerados (`flora.*`, `biome.*`); `channelOffset` exportado para test.

## [1.0.1] - 2026-10-09

### Fixed
- **El bioma norte no se oscurecía de noche** ([D-036](docs/12-decisiones.md)): el tinte de bioma
  (y el rubor de la floración) ahora se atenúa con la noche igual que el de estación
  (`1 − 0.85·nightAmt`), en vez de aplicarse a fuerza completa.
- **Corolas del desierto florido encendidas de noche**: `drawFlower` mezcla los colores de flor
  hacia el cielo nocturno según la noche (`0.85·nightAmt`), así el desierto florido se apaga con
  el día.

## [1.0.0] - 2026-10-09

### Added
- **Cierre de v1.0** ([D-035](docs/12-decisiones.md)): todos los documentos pasan a *estable*; se
  documentan la **altitud aproximada por capa** y la **frecuencia/longitud de onda** del relieve
  ([02 · Mundo](docs/02-mundo.md)). El backlog queda consolidado en
  [11 · Roadmap](docs/11-roadmap.md) (post-1.0: export de tira larga, más momentos raros, más
  biomas, meandro/pendiente real de los ríos, sprites restantes, más flora).

### Changed
- Roadmap: Fase 3 cerrada ✅ y nueva sección **Post-1.0** con el backlog.

## [0.16.0] - 2026-10-09

### Added
- **Variantes estacionales de flora** ([D-031](docs/12-decisiones.md)): además del tinte, la lenga
  y el roble pierden hojas en otoño (huecos deterministas), quedan desnudos en invierno y muestran
  brotes en primavera; el copihue y el michay solo florecen en primavera/verano. El spawn no
  cambia (dorados de flora intactos).
- **Chaura** (*Gaultheria mucronata*): arbusto del sotobosque con bayas blanco-rosadas, en la costa
  y en el bioma sur.
- **Nacimiento orgánico de los ríos** ([D-032](docs/12-decisiones.md)): el canal nace como un punto
  (conicidad potencia 0.8) unas filas más abajo de la muesca, con un pequeño salto brillante.
- **Sprites icónicos refinados** ([D-033](docs/12-decisiones.md)): cóndor, huemul, pudú, güiña,
  puma, flamenco, pingüino y chungungo con más detalle y dithering manual (damero en la matriz).

### Fixed
- **Pantalla en negro tras redimensionar** ([D-034](docs/12-decisiones.md)): `setAspect` repinta
  de inmediato después de cambiar el tamaño del canvas, que lo limpia; antes podía quedar negro si
  el loop estaba pausado (sin foco o pestaña oculta, p. ej. capturas headless).

## [0.15.0] - 2026-10-09

### Added
- **Fases de la luna** ([D-030](docs/12-decisiones.md)): la luna ya no es siempre llena — con el
  reloj real sigue la **fecha del equipo** (ciclo sinódico de 29.53 días, `moonPhaseForDate` en
  `src/clock.js`) y con `clock=fast` los días simulados (`Scene.dayNum`). Creciente y menguante
  se dibujan con **terminador por fila** y cráteres solo sobre la cara iluminada; la luna llena
  **apaga las estrellas más débiles**.
- **Resplandor según estación** ([D-030](docs/12-decisiones.md)): `seasonGlowTint` tiñe el
  resplandor del astro — cálido en otoño/primavera, frío en invierno — sin tocar la clave
  compartida `sunGlow` (flora cálida y reflejo del mar intactos).

### Changed
- `sky.celestial` acepta la fase lunar y devuelve `phase`/`illum`; `sky.draw` suma parámetros
  opcionales (`glowTint`, `moonDim`), con el dibujo anterior intacto sin ellos.
- El resplandor lunar se atenúa con la fase.

## [0.14.0] - 2026-10-09

### Added
- **Crossfade real de clima** ([D-029](docs/12-decisiones.md)): el clima saliente se desvanece
  **en paralelo** al entrante (misma tasa, suma ≈ 1, ≈ 2 s). La paleta se mezcla clima a clima
  (`lerpPalettes`) y las partículas de ambos estados se dibujan a la vez.
- **Tormenta eléctrica** (`storm`): lluvia densa y rápida, cielo muy oscuro y **relámpagos**
  deterministas (temporizador sembrado 1.5–6.5 s) dibujados entre el cielo y el terreno, con un
  flash que ilumina la escena. Expuesta en URL (`?weather=storm`), panel y vistas; sesgo por
  estación (invierno máximo).

### Changed
- **Viento que inclina la precipitación**: la lluvia (y la tormenta) se dibuja como trazo
  escalonado cuyo sesgo crece con el viento.
- **El mar responde al viento**: `drawSea` recibe `wind` (`Weather.effectiveWind()`, cuenta el
  crossfade) que sube el oleaje, acelera las crestas y añade salpicadura. Sin viento el dibujo es
  idéntico al anterior.
- `main.js` considera también el clima saliente para el FPS adaptativo.

## [0.13.1] - 2026-10-08

### Added
- **Servidor de desarrollo sin caché** (`scripts/serve.mjs`, `npm start`): sirve con
  `Cache-Control: no-store`, evitando el problema de **pantalla en negro** por módulos ES
  desincronizados (nuevos + cacheados). `npm run start:python` queda como alternativa.
- Si el loop falla, el error se **muestra en pantalla** en vez de quedar en negro silencioso.

### Fixed
- El **primer fotograma se pinta siempre**, aunque la ventana no tenga foco al cargar
  (`canRender` en `src/loop.js`); antes podía quedar el canvas vacío hasta recuperar el foco.

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

[Unreleased]: https://github.com/nramireza/infinite-andes/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/nramireza/infinite-andes/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/nramireza/infinite-andes/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/nramireza/infinite-andes/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/nramireza/infinite-andes/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nramireza/infinite-andes/compare/v0.16.0...v1.0.0
[0.16.0]: https://github.com/nramireza/infinite-andes/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/nramireza/infinite-andes/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/nramireza/infinite-andes/compare/v0.13.1...v0.14.0
[0.13.1]: https://github.com/nramireza/infinite-andes/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/nramireza/infinite-andes/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/nramireza/infinite-andes/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/nramireza/infinite-andes/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/nramireza/infinite-andes/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/nramireza/infinite-andes/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/nramireza/infinite-andes/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/nramireza/infinite-andes/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/nramireza/infinite-andes/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/nramireza/infinite-andes/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/nramireza/infinite-andes/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/nramireza/infinite-andes/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/nramireza/infinite-andes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/nramireza/infinite-andes/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nramireza/infinite-andes/releases/tag/v0.1.0
