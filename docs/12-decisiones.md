# 12 · Decisiones

> Estado: en progreso · Actualizado: 2026-10-08

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
  fauna ni la flora; son solo visuales (el audio sigue sin decidirse).
- **Nota:** los personajes son **parodia estilizada en pixel**, no un deepfake fotorrealista; se
  usan matrices de píxeles y una fuente 3×5 propia.

## Decisiones abiertas

- ¿Habrá audio? ¿Generado o muestreado?
- ¿El perfil será fijo o por regiones (Norte/Centro/Sur)?
- ¿Se exportará una tira larga además del PNG de la vista?
- ¿Los sprites serán matrices de píxeles definitivas o se admitirán PNG externos?
