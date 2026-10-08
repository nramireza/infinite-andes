# 09 · Arquitectura

> Estado: estable · Actualizado: 2026-10-08

## Principios técnicos

- **JS puro + módulos ES**, sin dependencias ni build step.
- **Determinismo por semilla**: nada de aleatoriedad no reproducible para generar paisaje.
- **Baja resolución + escalado pixelado**: altura fija 270 px y ancho por relación de aspecto
  (32:9 → 960×270 por defecto). Ver [08 · Arte pixel](08-arte-pixel.md).
- **Todo derivado de funciones**: el mundo no se almacena; la altura es una función de `x`.

## Módulos (`src/`)

| Módulo | Responsabilidad |
|--------|-----------------|
| `rng.js` | `mulberry32` (PRNG), `hashString`, `hash1` (hash determinista por entero), `seedToInt` |
| `noise.js` | `valueNoise1`, `fbm1` (ruido fractal), `ridged1` (crestas) |
| `pixel.js` | Utilidades pixel-art: `bakeSprite`, `drawSprite`, `disc`, `rect`, `px`, `radixDither` |
| `viewport.js` | Altura fija (`BASE_H`), presets de relación de aspecto y `widthForRatio` |
| `palette.js` | Claves de color por hora + clima, `getPalette`, `lerpColor`, `shade`, `nightAmount` |
| `sky.js` | Cielo: gradiente, Vía Láctea, estrellas, aurora, astros (`celestial`, `drawBody`), nubes |
| `weather.js` | Partículas (nieve/lluvia/viento), niebla, transiciones de clima |
| `terrain.js` | 6 capas (`LAYERS`), ruido de altura, nieve, volcanes, rocas, playa, mar, ríos (`riverEvents`, `drawChannel`) |
| `flora.js` | Colocación determinista (`floraSpawns`) y dibujo (`placeFlora`) de plantas por capa |
| `fauna.js` | Especies (sprites y actividad), colocación determinista (`faunaSpawns`) y dibujo (`placeFauna`) |
| `moments.js` | Momentos raros (`momentEvents`, `momentSky`, `momentGround`): 18-sep, Leo Rey, Kung Leo |
| `scene.js` | Orquestador: estado, cámara, día/noche, clima, orden de render, export |
| `ui.js` | Controles del panel enlazados a la escena y URL |
| `main.js` | Dimensionado del canvas, creación de la escena, loop de `requestAnimationFrame` |

## Pipeline de render (`scene.render`)

1. Calcular `pal = getPalette(hour, weather.type, weather.strength)` y `cel = sky.celestial(...)`.
2. `sky.draw(...)`: gradiente + Vía Láctea + estrellas + aurora + resplandor.
3. `sky.drawBody(...)`: el astro **al fondo** (lo tapan nubes y terreno).
4. `sky.drawClouds(...)`: nubes por delante del astro y por detrás del terreno.
5. `momentSky(...)`: ambiente de momento sobre el cielo (p. ej. 18-sep).
6. **Capas de atrás hacia adelante** (`LAYERS`):
   - Si la capa es `mar`: `drawSea`.
   - Si no: `drawLayer` (incluye canales de río) + `placeFlora`.
   - `placeFauna` en todas (incluido el mar, para aves y mamíferos marinos).
7. `momentGround(...)`: personajes de momento (Leo Rey / Kung Leo) en primer plano.
8. `weather.draw(...)`: partículas y niebla.

## Determinismo y semilla

- `seedToInt` convierte la semilla de la URL (texto o número) a entero de 32 bits.
- `seedLayers(seed)` (`terrain.js`) mezcla la semilla en cada capa (`layer._seed`); **debe
  llamarse antes de dibujar** (lo hace `Scene` al construir y en `regenerate`).
- La flora y la fauna combinan la semilla del usuario con la de la capa y siembran su PRNG con
  `hashInt(c, seed)` (**entero** de 32 bits) por chunk. Ver [D-011](12-decisiones.md).
- Los **momentos** (`moments.js`) también son deterministas: un `hashInt` por bloque de
  `SPACING` px decide si hay momento y cuál. Ver [D-014](12-decisiones.md).
- Los ríos usan la semilla de la capa.

## Parallax

Cada capa tiene `parallax` (0 = fondo, 1 = frente). Para una columna de pantalla `sx`:
`worldX = camera.x * parallax + sx`. La altura se evalúa en `worldX`. Las capas delanteras se
dibujan después y ocultan a las traseras.

## Formato de una capa (`LAYERS`)

| Campo | Significado |
|-------|-------------|
| `name` | Identificador (`andes`, `precordillera`, `valle`, `costa`, `playa`, `mar`) |
| `parallax` | Velocidad relativa de la cámara |
| `baseY`, `amp` | Centro y amplitud vertical de la silueta |
| `freq` | Frecuencia del ruido de altura |
| `seed` | Semilla base de la capa (se mezcla con la del usuario) |
| `rugged` | Peso del ruido ridged (0..1) |
| `snowFrac` | Umbral de nieve (≥1.4 = sin nieve) |
| `lightKey`, `darkKey` | Claves de paleta para el borde y el cuerpo |
| `alpha` | Opacidad (perspectiva atmosférica) |
| `volcano` | `{ spacing, height }` (solo Andes) |
| `rocky` | Vetas de roca (Andes) |
| `fields` | Textura de campos (Valle) |
| `beach` | Línea de marea (Playa) |
| `rivers` | `{ spacing, chance, width, depth, wfreq }` (Valle, Costa) |
| `flora` | `{ chunkW, minSize, maxSize, minChance, maxPer, types }` |
| `fauna` | `{ chunkW, chance, species }` (especies de `fauna.js`) |

## Cómo extender

- **Nueva capa**: agregar un objeto a `LAYERS` en el orden de atrás hacia adelante.
- **Nueva especie vegetal**: `drawPlant` en `flora.js` + entrar en `LAYERS[*].flora.types`.
- **Nuevo clima**: agregar estado en `weather.js` (`COUNTS`, `spawn`, `draw`) y tintes en `palette.js`.
- **Nueva fauna**: añadir la especie a `SPECIES` en `fauna.js` (sprites, movimiento
  `fly`/`walk`/`hop`/`swim`/`flock`, actividad) y listarla en `LAYERS[*].fauna.species`.
- **Nuevo momento**: añadir el tipo en `moments.js` (`MOMENT_IDS` + dibujo) y, si aplica,
  una opción en el selector `momentSel`.

## Tests

Sin dependencias: `npm test` (usa `node --test` + `node:assert`). Cubre lógica pura
(`rng`, `noise`, `terrain`, `palette`), *smoke* de render con un contexto 2D falso
(`test/helpers/fakeCtx.js`) y **snapshots dorados** en `test/golden.json` (terreno, ríos, flora,
fauna, paleta) que se regeneran con `UPDATE_GOLDEN=1 npm test`. Ver [`../test/README.md`](../test/README.md).

## Limitaciones conocidas

- Un elemento que cruce varias capas con distinto parallax no puede quedar perfectamente pegado
  a todas; en los ríos se resuelve manteniendo el cauce dentro de una sola capa (ver
  [07 · Ríos](07-rios.md)).
- El coste de `drawChannel` evalúa ruido por píxel de cauce; aceptable con pocos ríos por pantalla.
