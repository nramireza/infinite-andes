# 12 · Decisiones

> Estado: estable · Actualizado: 2026-10-10

Registro de decisiones de diseño y técnica. Para añadir una, copia
[`templates/decision.md`](templates/decision.md) y agrega una entrada con el siguiente número.

## D-001 · Inspiración y stack

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** Basar el proyecto en la idea de {Shan, Shui}\* (paisaje procedural infinito),
  con temática de los Andes chilenos, y usar **HTML5 Canvas + JS puro** (sin dependencias).
- **Motivo:** portabilidad, simplicidad, foco en el arte generativo.

## D-002 · Pixel art y resolución

- **Fecha:** 2026-10-08
- **Estado:** aceptada (enmendada por [D-013](#d-013--relación-de-aspecto-configurable))
- **Decisión:** Renderizar a **480×270** y escalar con `image-rendering: pixelated`.
- **Motivo:** estética pixel art nítida y coste bajo.
- **Enmienda:** la altura queda fija en 270 y el ancho pasa a ser configurable por relación de
  aspecto, con **32:9 (960×270) por defecto**. Ver [D-013](#d-013--relación-de-aspecto-configurable).

## D-003 · Sin gameplay

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** Es una pieza explorable; **no** hay puntaje, niveles ni personaje jugable.
- **Motivo:** foco contemplativo, fiel a la inspiración.

## D-004 · Seis capas geográficas

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** Seis capas con parallax (mar → playa → Costa → valle → precordillera → Andes).
- **Alternativas:** 7 capas con un "banco frontal" extra (descartado por excesivo).

## D-005 · Andes, mar y valle

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** Andes siempre nevados y escarpados (con volcanes con penacho y roca sutil);
  **mar reducido a la mitad**; el espacio ganado se da al **valle central**, que será
  protagonista de las siguientes fases.

## D-006 · Astros de fondo a frente

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** Sol y luna nacen tras los Andes, salen de pantalla a mediodía/medianoche y en el
  **ocaso quedan tras la cámara** (no se dibujan). Amaneceres más naranjos.
- **Consecuencia:** el atardecer se representa solo con color, sin disco.
- **Enmienda (ver D-009):** el astro se dibuja **siempre al fondo**, antes de las nubes. El avance
  hacia el frente queda sin efecto visual (el disco solo es visible con profundidad baja) y el
  resplandor es quien da la sensación de profundidad.

## D-007 · Clima dinámico

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** Cambios aleatorios cada **30–60 s** con transición suave (out→in) y sin repetir.

## D-008 · Ríos tallados como quebrada vertical

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** Tallar los ríos **dentro** de la generación de la capa (valle y Costa), como una
  **quebrada vertical centrada en la muesca**, sin meandro en profundidad y con ancho en conicidad
  (angosto arriba, ancho abajo). Sin ríos en playa ni mar. La oclusión por la capa siguiente oculta
  la desembocadura.
- **Motivo:** al centrar el agua en la misma muesca que talla la silueta, el cauce queda integrado
  (hereda el parallax) y deja de leerse como una cinta superpuesta.
- **Alternativas:** meandro en profundidad (descartado: el agua se salía de la muesca), río por
  tramos (descartado por costuras), río único (descartado por deslizamiento).

## D-009 · Orden del cielo: nubes por delante de los astros

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** El cielo se compone, de atrás hacia adelante: gradiente → estrellas → aurora →
  resplandor → **sol/luna → nubes** → capas de terreno → clima. Las nubes **tapan** al astro y a
  las estrellas, y el terreno tapa a las nubes.
- **Motivo:** las estrellas y el astro viven al fondo del cielo; una nube debe poder ocultarlos.
  Antes el astro se insertaba entre las capas de terreno y quedaba por delante de las nubes.
- **Consecuencia:** se retira la inserción del astro por profundidad `k` en `scene.render`
  (enmienda de [D-006](#d-006--astros-de-fondo-a-frente)).

## D-010 · Fauna determinista con actividad horaria

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** La fauna se genera por *chunks* (`hashInt` de la semilla de usuario + capa) y
  hereda el parallax de su capa. La **identidad** del animal (especie, posición, fase,
  dirección) **no depende de la hora**; la hora solo **filtra actividad** (día / crepúsculo /
  noche). Los sprites son **matrices de píxeles** dibujadas con `fillRect` (helper `px`), sin
  `bakeSprite`/canvas offscreen, para no depender de `document` y ser testeables en Node.
- **Motivo:** volver a la misma posición y hora debe reproducir los mismos animales; y el arnés
  de tests sin canvas debe poder cubrir el render.
- **Alternativas:** hornear sprites con `bakeSprite` (descartado por el `document` en Node y la
  caché por paleta); actividad fusionada con el spawn (descartado: rompía la identidad estable).
- **Consecuencia:** el cóndor es **planeo continuo**, no un "momento" raro (queda en backlog).

## D-011 · Siembra entera del PRNG por chunk

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** añadir `hashInt(n, seed)` (→ entero de 32 bits) en `rng.js` y sembrar los PRNG
  por chunk de flora y fauna con él. `hash1` pasa a ser `hashInt / 2³²` (mismos valores).
- **Motivo:** `mulberry32(hash1(...))` sembraba con una **fracción** (<1) y `mulberry32` hace
  `seed >>> 0`, que la truncaba a **0**: todos los chunks compartían la misma secuencia. Por eso
  la flora solo producía el primer tipo (`valle` = solo `bush`, `costa` = solo `lenga`).
- **Consecuencia:** la flora ahora **mezcla de verdad** sus tipos; cambia el dorado `flora.*`
  (se regeneró) y las capturas. El terreno, los ríos y `hash1` no cambian de valor.

## D-012 · Movimientos de fauna `swim` y `flock`

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** añadir dos movimientos a `fauna.js`: `swim` (posición sobre la superficie del
  mar, con vaivén) y `flock` (vuelo en bandada con dos compañeros en formación determinista).
  La fauna marina se dibuja sobre la capa `mar` (se llama a `placeFauna` también para el mar).
- **Motivo:** cubrir especies acuáticas (chungungo, pingüino) y gregarias (choroy, cachaña) sin
  inventar un sistema nuevo; reutiliza `bankHeight` y la trayectoria de vuelo existentes.
- **Alternativas:** hornear grupos en el sprite (descartado: rigidez), capa aparte para mar
  (descartado: complejidad innecesaria).

## D-013 · Relación de aspecto configurable

- **Fecha:** 2026-10-08
- **Estado:** aceptada (enmienda de [D-002](#d-002--pixel-art-y-resolución))
- **Decisión:** la **altura interna es fija (270 px)** y el ancho se deriva de la relación de
  aspecto: `W = round(270 · ratio)`. Presets 16:9 (480), 21:9 (630) y **32:9 (960, por defecto)**,
  más un modo personalizado. Se elige en el panel (**Relación**) o con `?aspect=`; el canvas se
  redimensiona en caliente (`Scene.resize`, `Weather.resize`). El script de capturas acepta
  `ASPECT=`.
- **Motivo:** el 32:9 documentado en [08](08-arte-pixel.md) pasa a ser real y el formato es
  ajustable sin tocar el detalle vertical ni el determinismo.
- **Consecuencia:** cambiar el ancho **ensancha la vista** (más mundo), no la resolución de píxel;
  con relaciones muy anchas el escalado entero puede quedar en 1×.

## D-014 · Momentos raros (framework y easter eggs)

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** crear `src/moments.js`, un framework determinista por `(semilla, x)` de **momentos
  raros** (bloques de `SPACING` px con una probabilidad baja). Incluye el ambiente **patrio del
  18-sep** (tinte tricolor + papelitos) y los personajes **Leo Rey** (cumbia: lentes de sol, pelo
  ondulado, traje dorado, notas) y **Kung Leo** (alter ego de Mortal Kombat: sombrero de Kung Lao
  y destello "MORTAL KUMBIA"). Se disparan solos (raros) o forzados con `?moment=` y desde el panel.
- **Motivo:** dar cabida a los "momentos" del roadmap y a los homenajes pedidos sin contaminar la
  fauna ni la flora; son solo visuales (más tarde se descartó el audio, [D-025](#d-025--sin-audio-el-objetivo-es-un-fondo-de-pantalla-vivo)).
- **Nota:** los personajes son **parodia estilizada en pixel**, no un deepfake fotorrealista; se
  usan matrices de píxeles y una fuente 3×5 propia.

## D-015 · Densidad de fauna según rareza real

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** cada especie de `fauna.js` declara una clase `rarity`
  (`abundante`/`comun`/`poco-comun`/`rara`/`muy-rara`) con un peso en `RARITY_WEIGHT`; el sorteo
  por chunk pasa de uniforme a **ponderado** (`pickWeighted`). Las clases se basan en el estado de
  conservación global (UICN) y nacional (MMA) de cada especie. El `chance` por capa queda como
  densidad del ambiente.
- **Motivo:** que lo raro (p. ej. huemul, chinchilla, chungungo) se vea poco y lo común (zorros,
  chingue) domine, acercando la experiencia a la realidad chilena. Ver la tabla en
  [06 · Fauna](06-fauna.md).
- **Consecuencia:** cambia la identidad/densidad de la fauna; se regeneran dorados y capturas.
  Se retiran los nombres repetidos en `LAYERS[*].fauna.species` (el peso los reemplaza).

## D-016 · Biomas procedurales y seleccionables

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** crear `src/biomes.js` con presets **norte** (árido), **centro** y **sur** (boscoso).
  Los biomas se combinan de dos formas: **procedural** (`biomeWeights(worldX, seed)`, ruido de baja
  frecuencia determinista, de modo que el paisaje cambia al recorrer) y **seleccionable** (forzar una
  región con `?biome=norte|centro|sur` y un selector en el panel). En esta primera iteración el bioma
  afecta **paleta** (tinte árido/lush) y **composición de flora y fauna** (pools por bioma); **no**
  toca la geometría del ruido.
- **Motivo:** variar el paisaje por región y a lo largo del recorrido sin romper el determinismo ni la
  continuidad del campo de ruido; es el foco de la Fase 3 del roadmap.
- **Alternativas:** perfiles fijos por región como único modo (descartado: pierde el recorrido);
  modular `freq`/`amp` por columna (descartado en esta iteración: introduce discontinuidades en el
  ruido; la amplitud/nieve se evaluarán después).
- **Consecuencia:** se añade `applyBiome` en `palette.js` y pools de bioma en `flora.js`/`fauna.js`;
  tests `biomes.test.js` y dorados; docs en [02 · Mundo](02-mundo.md). La modulación de geometría y la
  flora nueva (cactus, alerce, nalca, palma, colihue) quedan para iteraciones siguientes.

## D-017 · Desierto florido como estado de bioma

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** el **desierto florido** es un estado del bioma **norte**, no un momento raro global.
  `bloomAt(worldX, seed, weights)` devuelve 0..1 en **bloques raros** (~6000 px, p≈0.18) con envolvente
  suave y **solo con presencia de norte**. Añade el tipo de flora `flower` (parches, no alfombra), un
  rubor de tinte en `sand`/`valleyL`/`floraL` (`applyBiome`) y sube la densidad de fauna
  (`chance × (1 + 0.6·bloom)`) reforzando aves y zorros (`BLOOM_FAUNA`). Se controla con
  `?bloom=auto|on|off` y el selector **Floración**.
- **Motivo:** es un fenómeno geográfico del norte árido; atarlo al bioma evita que el sorteo de
  "momentos" lo dispare fuera de lugar y permite teñir el suelo y componer flora/fauna a la vez.
- **Alternativas:** como momento raro en `moments.js` (descartado: puede salir fuera del norte y no
  compone pools); alfombra continua (descartado: menos creíble que los parches).
- **Consecuencia:** nuevo tipo `flower` en `flora.js` y pool de fauna de floración en `biomes.js`;
  tests `biomes.test.js` y dorados `biome.*`.

## D-018 · Completar los biomas: geometría y especies

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** completar los tres biomas con (a) **geometría** y (b) **especies nuevas**.
  - **Geometría**: cada bioma declara `geometry: { ampMul, snowShift }`; `biomeGeometry` los mezcla
    por pesos y `setBiomeGeometry(sampler)` los aplica en `bankHeight`/`drawLayer`/`drawChannel`. La
    geometría es **función de `worldX`** (no de la cámara) para no "respirar" al hacer scroll; el
    `snowShift` solo actúa en capas que ya tienen nieve. Sin sampler (tests y dorados) el factor es 1.
  - **Flora**: `cactus` (norte), `alerce`/`nalca`/`colihue` (sur) y `palma` chilena (centro, en
    `LAYERS`). **Fauna**: `rana` de Darwin (`Rhinoderma darwinii`) con movimiento `sit`, colocada en
    el **borde del cauce** de valle y Costa (no por chunk), gated por el pool del bioma.
- **Motivo:** el bioma debe leerse también en el relieve y la nieve, y en especies emblemáticas de
  cada zona; era lo pendiente del roadmap tras [D-016](12-decisiones.md).
- **Alternativas:** geometría uniforme por frame (descartado: la altura dependería de la cámara);
  modular `freq` (descartado: discontinuidades del ruido); rana por chunk (descartado: no garantiza
  cercanía al agua).
- **Consecuencia:** el **centro** deja de ser pixel-idéntico (se le añaden palma y rana); se regeneran
  dorados `flora.*`, `fauna.rana` y `biome.*` y las capturas. El sampler es estado de módulo en
  `terrain.js`; los tests lo restauran a `null`.

## D-019 · Estaciones del año

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** añadir un **ciclo estacional** (`src/seasons.js`) con cuatro estaciones
  (verano/otoño/invierno/primavera) que tiñe la paleta, desplaza la **línea de nieve** y sesga el
  **clima**. El modo automático es un **ciclo temporal lento** (`SEASON_DURATION = 120 s` por
  estación, año ≈ 8 min) con **meseta + crossfade**; también se puede fijar con `?season=`. El tinte
  se compone tras el clima y antes del bioma, y se **atenúa de noche**. El `snowShift` estacional se
  suma al del bioma en el sampler de geometría (sin tocar `terrain.js`).
- **Motivo:** un eje de variación nuevo y coherente sobre el paisaje infinito, reutilizando la paleta
  por hora y el `snowShift` del bioma; cierra el punto pendiente de la Fase 3.
- **Alternativas:** estación fija por semilla (descartado: menos vivo); estación espacial por `x`
  (descartado: las estaciones son temporales, no geográficas); duración muy larga (descartado: no se
  percibe).
- **Consecuencia:** nuevo `?season=` y selector **Estación**; `pickSeasonWeather` reemplaza el sorteo
  uniforme del clima automático; dorados `palette.season.*` y capturas. El verano no tiñe (base).

## D-020 · Vistas favoritas y deep-link de posición

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** serializar el estado de la escena en un módulo puro (`src/views.js`) con
  `encodeView`/`decodeView` y un campo nuevo `x` en la URL. Al cargar un enlace **con `x`** se
  **desactiva el auto-scroll** para reproducir la vista exacta. El panel añade un selector de
  **Vistas** con guardar/eliminar, persistido en `localStorage` (`infinite-andes:views`) como
  `{name, query}`. La carga inicial y los favoritos comparten `applyView`.
- **Motivo:** poder compartir un punto concreto del paisaje y volver a él; sin backend ni formato
  propio de archivo.
- **Alternativas:** solo URL sin favoritos (descartado: perder las vistas propias); guardar en
  `IndexedDB` (descartado: sobra para pocas entradas).
- **Consecuencia:** `updateURL` omite `x` mientras hay auto-scroll (el enlace "fluye"); al pausar o
  cargar un favorito, la posición queda anclada. Tests `views.test.js`.

## D-021 · Detalles visuales: fugaces, reflejos y huellas

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** añadir tres detalles sutiles y deterministas: **estrellas fugaces** (`meteorAt`
  puro en `sky.js`, bloques temporales raros, solo con `nightAmt > 0.25`), **reflejo del astro**
  sobre el mar (columna de brillo con destellos en `drawSea`, que recibe el estado celeste desde
  `scene.render`) y **huellas** de la fauna que camina (bandera `tracks` en `SPECIES`, píxeles
  desvanecidos tras el animal).
- **Motivo:** dar vida al cielo nocturno y al agua, y dejar rastro de los animales sin introducir
  sistemas nuevos.
- **Alternativas:** fugaces por posición de mundo (descartado: son fenómenos temporales);
  reflejo horneado en la paleta (descartado: no seguiría al astro).
- **Consecuencia:** `drawSea(ctx, pal, camera, W, H, tSec, cel)`; `drawFauna(..., W, ...)`.

## D-022 · Flora austral y fauna nueva

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** completar la biodiversidad con **flora** `coihue` (*Nothofagus dombeyi*), `roble`
  (*N. obliqua*), `copihue` (*Lapageria rosea*, enredadera) y `michay` (*Berberis darwinii*), y
  **fauna** `choique` (*Rhea pennata*), `chucao` (*Scelorchilus rubecula*) y `huillín`
  (*Lontra provocax*). La pasada de río (antes exclusiva de la rana) se generaliza a
  `RIVER_SPECIES`, cada especie con su `chance`, `offset` y `seed`.
- **Motivo:** cerrar los TODOs de [05 · Flora](05-flora.md) y [06 · Fauna](06-fauna.md) y poblar el
  sur boscoso y los ríos.
- **Alternativas:** huillín por chunk (descartado: no garantiza cercanía al agua); copihue como flor
  suelta (descartado: es una enredadera).
- **Consecuencia:** cambian los pools de `LAYERS` y `BIOMES`; se regeneran los dorados `biome.*`,
  `flora.*` y `fauna.*`. La rana conserva su siembra (dorado `fauna.rana` intacto).

## D-023 · Parches de desierto florido más extensos y raros

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** agrandar el desierto florido. `drawFlower` pasa de un racimo de 2–6 tallos a un
  **manto ~10x** (9–14 tallos, más ancho y en dos filas de profundidad). La zona de floración sube a
  `BLOOM_BLOCK` 6000→**20000 px** con **envolvente en meseta** (laderas suaves, centro lleno) y
  `BLOOM_CHANCE` 0.18→**0.20**. La **puerta de norte se evalúa en el centro del bloque** (en
  `biomeAt`) para que el parche no lo recorte el ancho de las regiones norte del ruido (~2–6k px).
  Refina [D-017](#d-017--desierto-florido-como-estado-de-bioma).
- **Motivo:** los parches se veían pequeños y frecuentes; se busca un evento más extenso y menos
  numeroso, conservando una cobertura florida parecida (~5% del terreno) para que el paisaje siga
  vivo al recorrer.
- **Alternativas:** bajar `BIOME_FREQ` 10x (descartado: biomas de horas a 30 px/s); solo racimos más
  grandes sin tocar la zona (descartado: no da parches extensos); `BLOOM_BLOCK` 60000 (descartado:
  cruzaba demasiado el bioma y quedaba casi invisible por semilla).
- **Consecuencia:** `bloomAt` usa envolvente de meseta y `biomeAt` consulta los pesos del centro del
  bloque (memo de un bloque). No cambian los dorados (`flora.*` no usa bioma; `biome.*` usa
  `bloom=0`); se añade un test de ancho de parche.

## D-024 · Floración que cubre el valle, no solo las crestas

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** llevar el desierto florido a su forma final en dos frentes.
  **(1) Parche más grande:** `BLOOM_BLOCK` 20000→**60000 px** (~22x el original), `BLOOM_CHANCE`
  0.20→**0.28** (~10% de cobertura) y `BLOOM_FLORA_WEIGHT` 2.0→**2.5**. **(2) Cubrir el valle:** en
  `floraSpawns` el tipo `flower` recibe un `depth` determinista (hash de `wx`, **sin consumir el RNG
  compartido**) y `placeFlora` lo dibuja en `gy + depth`, repartiendo las flores hacia el interior de
  la banda visible de la capa; las capas de adelante ocultan lo que sobra. `applyBiome` refuerza y
  amplía el rubor de floración a `costaL/costaD/valleyD/sandD/floraD`.
- **Motivo:** el reparto por contorno (`bankHeight`) dejaba las flores solo en la cresta de cada
  capa, porque la capa siguiente tapaba el resto; se quería un manto que cubriera también el valle.
- **Alternativas:** solo engrosar el contorno (descartado: no cubre el cuerpo); solo teñir el suelo
  (descartado: las flores seguían en la cresta); `depth` vía `rng()` (descartado: altera los dorados
  `flora.*`).
- **Consecuencia:** `floraSpawns` añade el campo `depth` (0 sin floración, dorados intactos);
  `placeFlora` desplaza la base de las flores. Test nuevo de reparto vertical. Refina
  [D-023](#d-023--parches-de-desierto-florido-más-extensos-y-raros).

## D-025 · Sin audio; el objetivo es un fondo de pantalla vivo

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** **no habrá audio** (ni generado ni muestreado). El resultado buscado es un **fondo de
  pantalla vivo** en el navegador: solo imagen, pensada para quedar encendida como *wallpaper*.
- **Motivo:** el uso previsto es dejar el paisaje corriendo en pantalla; el audio no aporta y trae
  complicaciones (autoplay, permisos, dependencias). El foco pasa a la experiencia visual continua.
- **Alternativas:** audio ambiente generado o muestreado (descartados).
- **Consecuencia:** se elimina el audio del roadmap y de las preguntas abiertas; se priorizan el modo
  kiosco y el rendimiento ([D-026](#d-026--modo-fondo-de-pantalla-y-rendimiento)).

## D-026 · Modo fondo de pantalla y rendimiento

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** habilitar el uso continuo como *wallpaper*:
  - **Kiosco** (`?ui=0`): sin panel, botón, HUD, cursor ni marco del lienzo; clic en el paisaje entra
    en **pantalla completa** (también con la tecla `F`).
  - **Ajuste** (`?fit=cover|contain`, defecto **cover**): `cover` llena la pantalla y `contain` encaja
    entero con barras.
  - **Teclado** (accesibilidad): `Espacio` auto-scroll, `←`/`→` desplazar, `H`/`P` panel, `F` pantalla
    completa.
  - **Rendimiento**: límite de FPS (`?fps=`, defecto **30**; `0` = sin límite), pausa real al ocultar
    la pestaña (`visibilitychange`, con reinicio de `dt`) y arranque pausado con
    `prefers-reduced-motion`.
- **Motivo:** el paisaje debe verse bien y consumir poco durante horas encendido.
- **Alternativas:** 60 fps por defecto (descartado: más consumo); auto-fullscreen al cargar
  (descartado: requiere gesto del usuario); `contain` por defecto (descartado: deja barras negras).
- **Consecuencia:** nuevos `src/loop.js` (helpers puros) y `test/loop.test.js`; `main.js` controla el
  loop y el ajuste; `ui.js` los atajos; `style.css` limpia el kiosco.

## D-027 · Sincronización con la hora, estación y sol reales de Chile

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** por defecto el paisaje sigue el **reloj real** del equipo (`clock=real`): la hora
  local y la **estación del hemisferio sur** salen de la fecha (`src/clock.js`), y el
  **amanecer/atardecer reales** de Chile central (lat −33.45, `src/sun.js`) reasignan la hora a la
  curva de paleta/cielo (`solarClock`), de modo que las 20:00 de verano se ven de día y en invierno
  oscuras. El clima automático conserva su sorteo procedural pero con el **sesgo de la estación
  real**. `?clock=fast` recupera el ciclo rápido (día ≈3 min, año ≈8 min); `?lat=` ajusta la
  latitud. `hour=`/`season=` siguen fijando manualmente (fijar la hora pasa a reloj rápido).
- **Motivo:** que la pantalla sea coherente con el lugar donde está el equipo (Chile).
- **Alternativas:** ciclo rápido por defecto (descartado: no refleja la realidad); fijar
  `America/Santiago` o pedir geolocalización (descartadas: el equipo está en Chile); clima real
  online (descartado: sin red ni dependencias, [D-025](#d-025--sin-audio-el-objetivo-es-un-fondo-de-pantalla-vivo)).
- **Consecuencia:** nuevos `src/clock.js` y `src/sun.js` (+ tests); `scene.js` incorpora
  `clock`/`lat` y `paletteHour()`; `sky.celestial` acepta `rise`/`set`. El paisaje (terreno, flora,
  fauna) sigue **determinista por semilla**: solo varía el tiempo.

## D-028 · Optimización de recursos (caché y FPS adaptativo)

- **Fecha:** 2026-10-08
- **Estado:** aceptada
- **Decisión:** recortar el costo por fotograma sin cambiar el dibujo:
  - **Caché de columna** de terreno por capa (`columnAt`, `src/terrain.js`), memoizado por píxel de
    mundo (tolerancia ≤1 px, imperceptible). Guarda lo caro e independiente de la estación
    (`ridgeHeight`, jitter de nieve, vetas de roca); la nieve por estación se compone aparte.
    `clearColumnCaches()` al cambiar semilla o bioma.
  - **Máscara de campos por fila** (antes se recalculaba por columna y por fila).
  - **Geometría de bioma una vez por columna** (antes dos: amplitud y nieve).
  - **Memo acotado** de `modeWeights`/`biomeAt` y de la **paleta compuesta** (cambia lento).
  - **FPS adaptativo** (`effectiveFps`, `src/loop.js`): baja a **8 fps** en reposo (sin scroll ni
    clima); pausa al ocultar la pestaña y al perder el foco de la ventana.
  - **Instrumentación**: `scripts/bench.mjs` (`npm run bench`) y overlay `?perf=1`.
- **Motivo:** el uso previsto es un **fondo de pantalla** encendido por horas; el `render()` era el
  grueso del gasto (≈7.6 ms/frame medidos).
- **Alternativas:** bajar la resolución interna (descartado: rompe el pixel art nítido); redibujado
  por regiones *dirty-rect* (descartado: reescritura grande para poco más); 60 fps por defecto
  (descartado, [D-026](#d-026--modo-fondo-de-pantalla-y-rendimiento)).
- **Consecuencia:** `render()` ≈ **7.6 → 3.4 ms/frame** (−56%) en `npm run bench`, con **dibujo
  idéntico** a cámara fija (verificado píxel a píxel). Tests de memo, caché de columna y
  `effectiveFps`. Complementa [D-026](#d-026--modo-fondo-de-pantalla-y-rendimiento).

## D-029 · Clima: crossfade, viento que inclina y tormenta eléctrica

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** cerrar los tres pendientes de [04 · Clima](04-clima.md):
  - **Crossfade real**: `Weather` guarda el clima saliente (`prevType`/`prevStrength`/`prevParticles`)
    y lo desvanece **en paralelo** al entrante, a la misma tasa (la suma de intensidades se mantiene
    ≈ 1 durante ≈ 2 s). La paleta se mezcla clima a clima con `lerpPalettes` (`palette.js`) y las
    partículas de ambos estados se dibujan a la vez. El `palKey` del memo incluye ambos climas.
  - **Viento que inclina la precipitación**: la lluvia se dibuja como trazo escalonado cuyo sesgo
    crece con `windLevel` (también en la tormenta); la deriva horizontal ya existente se mantiene.
    El mar recibe un parámetro `wind` en `drawSea` (`effectiveWind()` de `Weather`, cuenta el
    crossfade) que sube la amplitud del oleaje, acelera las crestas y añade salpicadura con viento
    fuerte. Sin viento el dibujo es **idéntico** al anterior (los tests de `drawSea` no cambian).
  - **Tormenta eléctrica**: nuevo clima `storm` (lluvia densa y rápida, tinte propio en
    `WEATHER_TARGETS`, sesgo en las cuatro estaciones con invierno máximo) con **relámpagos**
    deterministas: temporizador sembrado (1.5–6.5 s) + rayo dibujado entre el cielo y el terreno
    (`drawLightning`, llamado desde `scene.render`) y un flash breve que ilumina la escena.
    Expuesto en URL (`?weather=storm`), panel y vistas.
- **Motivo:** el clima encadenado (out→in) dejaba un "bache" de paleta a mitad de transición; el
  viento no se sentía en la precipitación ni en el mar; y faltaba un evento puntual con tensión.
- **Alternativas:** crossfade solo de paleta sin partículas dobles (descartado: la lluvia vieja
  desaparecía de golpe); viento como clima nuevo "tormenta" sin relámpagos (descartado: el rayo es
  el carácter del evento); relámpagos por `Math.random()` (descartado: rompe el determinismo).
- **Consecuencia:** `src/weather.js` reescrito (máquina de crossfade, `stepParticles` por tipo,
  `updateLightning`); `palette.js` suma `WEATHER_TARGETS.storm` y `lerpPalettes`; `scene.js` mezcla
  paletas y dibuja el rayo; `terrain.js drawSea` acepta `wind` (def. 0). Nuevo `test/weather.test.js`.
  `main.js` considera el clima saliente para el FPS. Sin cambios en los dorados (`clear` intacto).

## D-030 · Fases lunares y resplandor estacional

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** cerrar los pendientes de [03 · Cielo y astros](03-cielo-astros.md):
  - **Fase lunar**: funciones puras en `clock.js` (`MOON_CYCLE = 29.53` días,
    `moonPhaseForDate(year, doy)` y `moonPhaseFromDays(days)`, época de luna nueva 2000-01-06).
    Con el reloj real la fase sale de la **fecha del equipo**; con `clock=fast`, de los **días
    simulados** (`Scene.dayNum`, avanza al envolver la hora en `update`). La luna se dibuja con
    **terminador por fila** (`drawBody`): creciente ilumina la derecha, menguante la izquierda,
    con cráteres solo sobre la cara iluminada; sin fase (cel fabricado) se dibuja llena como antes.
    La luna llena **apaga las estrellas más débiles** (`drawStars` recibe `moonDim`).
  - **Resplandor según estación**: `seasonGlowTint(state)` (`seasons.js`) da un tinte del
    resplandor del astro (cálido en otoño/primavera, frío en invierno; verano = base) que `drawGlow`
    aplica **solo al resplandor**, sin tocar la clave `sunGlow` de la paleta global (la usa la flora
    cálida y el reflejo del mar).
- **Motivo:** la luna era siempre llena e ignoraba la realidad (que el proyecto ya sincroniza con la
  hora/estación, [D-027](#d-027--sincronización-con-la-hora-estación-y-sol-reales-de-chile)); y el
  resplandor no acompañaba la estación.
- **Alternativas:** fase por semilla (descartado: se desincroniza de la fecha real); tinte estacional
  vía `applySeason` (descartado: la atenuación nocturna y la clave compartida `sunGlow` arrastrarían
  otros dibujos); recorte con `globalCompositeOperation` (descartado: no testeable con el contexto
  falso).
- **Consecuencia:** `sky.celestial` acepta `moonPhase` y devuelve `phase`/`illum`; `sky.draw` suma
  `glowTint`/`moonDim` (opcionales); `scene.render` calcula la fase y el tinte. Tests nuevos en
  `clock.test.js`, `sky.test.js` (creciente/menguante, estrellas) y `seasons.test.js`
  (`seasonGlowTint`). Sin cambios en dorados.

## D-031 · Variantes estacionales de flora y chaura

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** cerrar los pendientes de [05 · Flora](05-flora.md) y [15 · Estaciones](15-estaciones.md):
  - **Variantes estructurales por estación** además del tinte: `placeFlora`/`drawPlant` reciben el
    índice de estación (opcional, 0 = comportamiento actual). Lenga y roble (caducifolios) pierden
    hojas en otoño (huecos deterministas con `hash1`), quedan desnudos en invierno
    (`drawBareBranches`) y muestran brotes en primavera; copihue y michay solo florecen en
    primavera/verano. El **spawn no cambia**: solo varía el dibujo, así los dorados `flora.*`
    quedan intactos.
  - **Chaura** (*Gaultheria mucronata*): arbusto nuevo (`drawChaura`) con bayas blanco-rosadas,
    en `LAYERS[*].flora.types` de costa y en el pool sur.
- **Motivo:** el ciclo estacional solo teñía; las hojas caídas, los brotes y las flores dan la
  sensación de estación real.
- **Alternativas:** variantes por spawn (descartado: cambiaba los dorados y el determinismo del
  chunk); colores por estación en la paleta global (ya existía el tinte; no alcanzaba).
- **Consecuencia:** regenerados los dorados `flora.costa`, `biome.centro` y `biome.sur` (la chaura
  cambia el sorteo de tipos en costa). Tests de variantes estacionales en `render.test.js`.

## D-032 · Ríos: nacimiento punzante con salto

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** cerrar los pendientes de [07 · Ríos](07-rios.md) con cambios **solo de dibujo**
  (dentro de `drawChannel`/`channelHalf`, sin tocar la muesca ni los spawns):
  - **Conicidad** con potencia 0.8: el canal nace como un punto (piso 0.4 px) y mantiene el máximo
    anterior (1.52·width), dentro de la holgura de la muesca (2.2·width).
  - **Nacimiento orgánico**: el agua brota unas filas más abajo de la punta de la muesca (desfase
    determinista por evento) con un **salto** de 1–2 px en `pal.seaHi` en la primera fila.
  - El **meandro sutil** y el cauce que siga la pendiente real (`u` derivado de `ridgeHeight`)
    quedan **post-1.0**: reabrir el "agua dentro del tallado" no compensa el riesgo.
- **Motivo:** el río nacía con un grosor mínimo uniforme y sin desnivel; parecía cortado, no brotado.
- **Alternativas:** meandro en profundidad (descartado de nuevo: el agua se sale de la muesca);
  salto con partículas (descartado: rompe el estilo fillRect estático).
- **Consecuencia:** `drawChannel` suma `headU`/`headY` y el brillo del salto; el test de agua del
  canal sigue pasando (el color base no cambió). Dorados de terreno/ríos intactos.

## D-033 · Sprites de fauna refinados y dithering manual

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** cerrar los pendientes de [08 · Arte pixel](08-arte-pixel.md) y [06 · Fauna](06-fauna.md):
  - **Dithering ordenado manual: sí.** Se admite alternar caracteres en damero dentro de la matriz
    (degradados sutiles, p. ej. plumas del cóndor con un hex oscuro adicional). `radixDither`
    automático en sprites queda **descartado** (rompería la lectura carácter a carácter y la
    prueba de caracteres mapeados).
  - **Refinar los sprites icónicos**: cóndor (plumas con dithering), huemul y pudú (ojos/vientre
    claro), güiña (manchas y vientre), puma (cola y cuerpo completo), flamenco (pico), pingüino
    (pico) y chungungo (cuerpo alargado). Solo cambian `frames`/`palette` de `SPECIES`: los dorados
    `fauna.*` (que digieren solo el spawn) quedan intactos.
- **Motivo:** los sprites eran funcionales; con la guía de estilo ya fijada era el momento de darles
  el acabado.
- **Alternativas:** migrar a `bakeSprite`/`drawSprite` (descartado, [D-010](#d-010--fauna-determinista-con-actividad-horaria):
  dependen de `document`); sprites PNG externos (descartado: rompe la edición en código).
- **Consecuencia:** 8 especies refinadas; el resto queda post-1.0. Los tests de matriz (ancho de
  filas, caracteres mapeados, paleta válida) siguen pasando.

## D-034 · Repintado inmediato tras redimensionar el lienzo

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** en `setAspect` (`main.js`), tras cambiar `canvas.width/height` (que **limpia** el
  lienzo) y rehacer la escena, se llama `scene.render()` de inmediato. Así el lienzo nunca queda en
  negro aunque el loop esté pausado (sin foco o pestaña oculta; p. ej. capturas headless).
- **Motivo:** el primer fotograma podía pintarse antes del redimensionado del URL `aspect`, el
  resize borraba el canvas y, sin foco, ningún fotograma lo repintaba (pantalla en negro).
- **Consecuencia:** render síncrono extra solo al cambiar la relación de aspecto (un evento, no por
  fotograma). Sin impacto en rendimiento.

## D-035 · Cierre v1.0: alcance y post-1.0

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** declarar **v1.0.0** con el alcance actual y fijar lo que queda para después:
  - **Entra en 1.0**: todo lo de las Fases 1–3 (ver [11 · Roadmap](11-roadmap.md)), incluidos los
    cierres recientes: clima completo ([D-029](#d-029--clima-crossfade-viento-que-inclina-y-tormenta-eléctrica)),
    fases lunares y resplandor estacional ([D-030](#d-030--fases-lunares-y-resplandor-estacional)),
    flora estacional y chaura ([D-031](#d-031--variantes-estacionales-de-flora-y-chaura)), ríos
    ([D-032](#d-032--ríos-nacimiento-punzante-con-salto)), sprites icónicos
    ([D-033](#d-033--sprites-de-fauna-refinados-y-dithering-manual)) y el repintado tras redimensionar
    ([D-034](#d-034--repintado-inmediato-tras-redimensionar-el-lienzo)). Todos los documentos pasan
    a **estable**; la altitud y la frecuencia por capa quedan documentadas en [02 · Mundo](02-mundo.md).
  - **Queda post-1.0** (consolidado en el roadmap): export de tira larga, más momentos raros, más
    biomas (altiplano/Patagonia/austral/fiordos), meandro y pendiente real de los ríos, refinar los
    sprites restantes y completar las plantillas de especies, y más flora de sotobosque.
- **Motivo:** el proyecto cumple su visión (fondo de pantalla vivo, determinista, sincronizado con
  Chile) y conviene un punto estable etiquetado antes de seguir creciendo.
- **Consecuencia:** versión 1.0.0, changelog [1.0.0], `git tag v1.0.0` y capturas finales
  versionadas. El roadmap deja de enumerar TODOs sueltos y concentra el backlog en una sección.

## D-036 · Tintes de bioma y floración atenuados de noche

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** corregir que el bioma norte no se oscurecía de noche:
  - **Tinte de bioma**: en `scene.render`, `applyBiome` recibe `amount` y `bloom` multiplicados por
    `1 − 0.85·nightAmt` (el mismo factor que ya usa la estación). De noche queda un 15% del tinte
    (un matiz oliva oscuro sobre la base nocturna) en vez del color de día completo.
  - **Corolas del desierto florido**: `drawFlower` recibe `night` (0..1) y mezcla cada color de
    `FLOWER_COLORS` hacia `pal.skyTop` nocturno con `0.85·night`; de día (0) el dibujo es idéntico.
    `placeFlora`/`drawPlant` ganan el parámetro opcional `night` (def. 0).
- **Motivo:** el tinte del bioma se aplicaba a fuerza completa de noche: el valle del norte quedaba
  en arena clara (`#a8a05a`/`#7a7440`) sobre un paisaje nocturno, y las corolas rosadas/amarillas
  seguían encendidas.
- **Alternativas:** oscurecer los targets del norte en la paleta (descartado: rompe el día y la
  mezcla procedural); claves nuevas de paleta para flores (descartado: cambia los dorados de
  paleta); atenuar solo `amount` y no `bloom` (descartado: las flores brillarían igual de noche).
- **Consecuencia:** composición de paleta en `scene.js` con `nightBiome`; `nightAmt` llega a
  `placeFlora`. Tests nuevos en `render.test.js` (valle norte y corolas, día vs noche). Sin cambios
  de dorados (día intacto). Versión 1.0.1.

## D-037 · Flora de sotobosque: quillay y mañío

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** cerrar el pendiente de flora austral con dos especies:
  - **Quillay** (*Quillaja saponaria*, esclerófilo **endémico de Chile**): copa redondeada y motas
    blancas de flor en **primavera/verano**; entra en los pools de **centro** (precordillera, valle
    y costa, vía `LAYERS`) y del **sur/Patagonia** (valle y costa).
  - **Mañío** (*Podocarpus* spp.): conífera austral oscura y estrecha, perenne; entra en los pools
    del **sur** y la **Patagonia** (valle y costa).
- **Motivo:** era el pendiente de [05 · Flora](05-flora.md) y del backlog post-1.0
  ([11 · Roadmap](11-roadmap.md)).
- **Alternativas:** sprites PNG externos (descartado: el proyecto mantiene matrices/código sin
  assets); solo mañío (descartado: el quillay da identidad esclerófila al centro).
- **Consecuencia:** cambia el *spawn* de centro y sur → dorados `flora.*` y `biome.*` regenerados;
  tests de pools (`biomes.test.js`) y smoke de tipos nuevos (`render.test.js`). Versión 1.1.0.

## D-038 · Biomas altiplano y Patagonia

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** ampliar los biomas de tres a **cinco**, en el orden del recorrido:
  **altiplano → norte → centro → sur → patagonia**. `biomeWeights` se generaliza (cada bioma domina
  en su centro, meseta de 0.5, y se mezcla con el vecino en 0.5).
  - **Altiplano** (puna): eleva el relieve (`ampMul` 1.12), enfría el tinte árido y trae pastizal y
    matorral bajo **sin árboles**; vicuña, guanaco, chinchilla y flamenco.
  - **Patagonia** (estepa fría): baja la línea de nieve (`snowShift` −0.45), lenga baja, coirón y
    matorral; guanaco, choique, puma y huemul.
  - Selector **Región**, `?biome=` y las **vistas** aceptan los cinco; la floración sigue **solo** en
    el norte. Los **fiordos/austral** quedan fuera: exigen geometría de agua/canales, no solo pools.
- **Motivo:** avanzar el "más biomas" del backlog sin abrir un frente de terreno nuevo.
- **Alternativas:** incluir fiordos ya (descartado por alcance); eje 2D latitud×altitud (descartado:
    complejidad sin ganancia visible en el perfil); solo tintes sin pools (descartado: pálido).
- **Consecuencia:** dorados nuevos `biome.altiplano` y `biome.patagonia`; el centro conserva su
  lógica (sin tinte ni geometría propios); tests de suma, dominancia, tinte terrestre y pools.

## D-039 · Ríos: meandro sutil y pendiente real

- **Fecha:** 2026-10-09
- **Estado:** aceptada
- **Decisión:** cerrar los pendientes de [07 · Ríos](07-rios.md) **solo en el dibujo** de
  `drawChannel`:
  - **Meandro sutil** (`channelOffset`): el centro del canal se desplaza hasta 0.55·`width` por lado
    (menos que la holgura libre de 0.68·`width` de la muesca), con rampa al nacimiento y seno
    determinista por evento.
  - **Pendiente real**: el nacimiento (`headY`) y el recorrido de `u` se derivan de
    `ridgeHeight(layer, ev.xc)` (altura real en el centro), de modo que el cauce se ensancha según
    el desnivel hasta el pie de la capa.
- **Motivo:** último pendiente post-1.0 de ríos, sin reabrir el "agua dentro del tallado" que costó
  fijar ([D-032](12-decisiones.md)).
- **Alternativas:** ensanchar la muesca para un meandro mayor (descartado: tocaría el terreno y los
  dorados de altura); meandro en la función de tallado (descartado: la muesca es función de columna,
  no de profundidad).
- **Consecuencia:** `riverEvents`, `terrain.*` y `rivers.*` intactos; `channelOffset` se exporta para
  test; tests nuevos de agua bajo `ridgeHeight` y de meandro acotado.

## D-040 · Export de tira larga en PNG

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Decisión:** añadir `Scene.exportStrip(tiles = 8)` y el botón **Tira**: renderiza una sola vez en
  un lienzo ancho (`W·tiles`, máx. 40 pantallas) desde la cámara y descarga el PNG. El clima se
  presta cubriendo la tira con niebla; las partículas quedan donde estaban.
- **Motivo:** cerrar el pendiente de [00 · Visión](00-vision.md) y [10 · UI](10-ui-y-export.md).
- **Alternativas:** renderizar por pantallas y unir (descartado: las capas lentas saltarían por el
  parallax); GIF/secuencia sin dependencias (descartado por ahora: coste).
- **Consecuencia:** PNG largo disponible; el GIF/secuencia queda opcional en el backlog.

## D-041 · Momentos de fauna: cóndor, bandada y manada

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Decisión:** sumar tres momentos deterministas a `moments.js`: **vuelo de cóndor** amplio con
  escolta (cielo), **bandada** en formación en V (cielo) y **manada** de guanacos (suelo). Se
  fuerzan con `?moment=` y en el selector.
- **Motivo:** cerrar el pendiente de [06 · Fauna](06-fauna.md) ("más momentos raros").
- **Alternativas:** integrarlos como fauna normal (descartado: los momentos son raros/ancla);
  sprites desde `fauna.js` (descartado: la escala y el movimiento difieren).
- **Consecuencia:** `MOMENT_IDS` pasa a 6; `VIEW_MOMENTS` y el selector amplían; tests de dibujo y
  determinismo.

## D-042 · Bioma austral/fiordos

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Decisión:** añadir el bioma **austral** (fiordos) al final del orden procedural (sexto).
  Reutiliza el tallado de ríos mediante un config `fjords` en `LAYERS` (valle y Costa) y un sampler
  `setFjordStrength`: los canales solo se tallan/dibujan donde el bioma austral domina. Paleta
  húmeda, más nieve y pools de islas boscosas (mañío, canelo, coihue; huillín, chungungo).
- **Motivo:** completar los biomas sin abrir un sistema de geometría nuevo.
- **Alternativas:** capa de fiordos aparte (descartado: rompe el perfil de 6 capas); fiordos
  permanentes (descartado: contaminaría el resto de biomas).
- **Consecuencia:** `BIOME_IDS` pasa a 6; `biomeGeometry` suma `fjord`; golden `biome.austral`
  nuevo. Sin `setFjordStrength` (tests/dorados) el terreno es idéntico al de siempre.

## D-043 · Flora de sotobosque: canelo, arrayán y notro

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Decisión:** añadir **canelo** (*Drimys winteri*), **arrayán** (*Luma apiculata*) y **notro**
  (*Embothrium coccineum*), con flores en primavera/verano (notro siempre rojo). Van a los pools del
  **sur**, **Patagonia** y **austral**.
- **Motivo:** ampliar el sotobosque austral que pedía el backlog de [05 · Flora](05-flora.md).
- **Alternativas:** reutilizar coihue/mañío (descartado: poca variedad); sprites PNG (descartado).
- **Consecuencia:** dorados `biome.sur`, `biome.patagonia` y `biome.austral` regenerados.

## D-044 · Sprites de fauna restantes y fichas de especies

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Decisión:** refinar los sprites de fauna que faltaban (zorros, guanaco, vicuña, chingue, monito,
  chinchilla, choroy, cachaña, etc.) con ojos, vientre y cola, y generar una **ficha por especie**
  (flora y fauna) en `docs/especies/` con `npm run species`.
- **Motivo:** cerrar el pendiente de [06 · Fauna](06-fauna.md) y [08 · Arte pixel](08-arte-pixel.md).
- **Alternativas:** mantenter las matrices simples (descartado: poca legibilidad); fichas a mano
  (descartado: se desincronizan). El script lee `SPECIES` del código + una tabla de metadatos.
- **Consecuencia:** los dorados de fauna no cambian (solo guardan posición/tipo); 38 fichas y un
  `scripts/specimens.mjs` reutilizable.

## D-045 · Registro único de especies (`FLORA`/`SPECIES`)

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Decisión:** unificar flora y fauna en **registros** que son la fuente única de identidad,
  metadata, **zonas** (pools) y definición de dibujo:
  - `FLORA` (`flora.js`): una entrada por tipo dibujable con `kind`, `common/sci/endemism/notes`,
    `zones[bioma][capa]` y, para efectos, `bloomOnly`.
  - `SPECIES` (`fauna.js`): añade `common/sci/endemism/iucn/chile/notes`, `zones`,
    `placement` (chunk/río) y `bloom` a los campos de comportamiento y sprite.
  - `biomeFloraPool`/`biomeFaunaPool` (`biomes.js`) derivan los pools de las zonas (tablas
    precomputadas), **sin** listas paralelas en `LAYERS`/`BIOMES`; `LAYERS` solo conserva lo
    espacial. `RIVER_SPECIES`/`BLOOM_FAUNA` se derivan de los flags.
  - `scripts/species.mjs` (`npm run species`) genera las fichas de `docs/especies/` y **inyecta**
    las tablas de [05](05-flora.md)/[06](06-fauna.md) entre marcadores; `test/species.test.js`
    valida el registro.
- **Motivo:** la metadata estaba duplicada (docs, script) y los pools repartidos con un caso
  especial para `centro`; añadir una especie tocaba varios archivos.
- **Alternativas:** un catálogo único `src/species.js` (descartado: acopla dominios); mantener las
  listas en `LAYERS`/`BIOMES` (descartado: doble fuente de verdad).
- **Consecuencia:** cambia el orden de los pools → dorados `flora.*`/`biome.*`/`fauna.*` nuevos
  (intencional); añadir una especie es **un objeto** más `npm run species`.

## D-046 · Sprites de flora procedurales (sin caché)

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Decisión:** la flora sigue dibujándose de forma **procedural** por funciones (`DRAWERS`), sin
  pasar a matrices con `bakeSprite`/`drawSprite` cacheadas. Se evaluó la Fase 5 del plan.
- **Motivo:** `placeFlora` cuesta ~0.4 ms/frame (medido con `npm run bench`) y las formas (copas,
  campos, pasto) se benefician del procedural; las matrices no aportan aquí.
- **Alternativas:** matrices cacheadas (descartado: coste por cambio de paleta hora/clima y sin
  ganancia visible); atlas offscreen (descartado por ahora).
- **Consecuencia:** sin cambios en el render; la fauna mantiene sus matrices.

## Decisiones abiertas

- ¿Se exportará una tira larga además del PNG de la vista? (opcional, ver [D-025](#d-025--sin-audio-el-objetivo-es-un-fondo-de-pantalla-vivo))
- ¿Los sprites serán matrices de píxeles definitivas o se admitirán PNG externos?
