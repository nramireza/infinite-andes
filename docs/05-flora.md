# 05 · Flora

> Estado: estable · Actualizado: 2026-10-10

Implementado en `src/flora.js` (registro, dibujo y colocación) usando las paletas de `src/palette.js`.
La flora se dibuja por capa con `placeFlora(ctx, layer, ...)`; cada capa define en `LAYERS` su
`flora: { chunkW, minSize, maxSize, minChance, maxPer }` (lo espacial) y el registro `FLORA` define
las especies y sus `zones` (los pools por bioma y capa).

## Especies representadas (actualmente)

<!-- BEGIN:flora-tabla (generado con `npm run species`) -->
| Nombre común | Nombre científico | Endémica | Tipo en código | Zona/capa | Notas |
|--------------|-------------------|----------|----------------|-----------|-------|
| Araucaria / Pehuén | *Araucaria araucana* | Sí (Chile/Argentina) | `araucaria` | Centro, Sur (precordillera, valle, costa) | Árbol emblema; silueta de paraguas; la copa se bambolea. |
| Lenga / Ñire | *Nothofagus pumilio / N. antarctica* | No (Patagonia) | `lenga` | Centro, Sur, Patagonia, Austral (costa, precordillera, valle) | Caducifolio: pierde hojas en otoño, queda desnudo en invierno y brota en primavera. |
| Copihue | *Lapageria rosea* | Sí (Chile) | `copihue` | Centro, Sur (costa, valle) | Enredadera y flor nacional; campanas rojas en primavera/verano. |
| Copao / Cactus columnar | *Eulychnia spp.* | No | `cactus` | Altiplano, Norte (precordillera, valle, costa) | Columna con brazos y espinas. |
| Alerce / Lahual | *Fitzroya cupressoides* | Sí (Chile/Argentina) | `alerce` | Sur, Austral (precordillera, costa) | Conífera alta y estrecha; en peligro. |
| Nalca / Pangue | *Gunnera tinctoria* | Sí (Chile/Argentina) | `nalca` | Sur, Austral (valle, costa) | Hojas gigantes junto al agua. |
| Colihue / Quila | *Chusquea spp.* | No | `colihue` | Sur, Patagonia, Austral (valle, costa) | Cañaverales (bambú nativo). |
| Palma chilena | *Jubaea chilensis* | Sí (Chile) | `palma` | Centro (valle, costa) | Tronco esbelto y frondas; en peligro. |
| Coihue | *Nothofagus dombeyi* | No (Patagonia) | `coihue` | Centro, Sur, Patagonia, Austral (valle, costa, precordillera) | Copa ancha y redondeada; tronco recto. |
| Roble | *Nothofagus obliqua* | Sí (Chile/Argentina) | `roble` | Centro, Sur (valle, costa) | Caducifolio; copa estrecha y erguida; pierde hojas en otoño. |
| Michay | *Berberis darwinii* | No (Patagonia) | `michay` | Centro, Sur, Patagonia (valle, costa, precordillera) | Arbusto espinoso; flores naranjas en primavera/verano. |
| Chaura | *Gaultheria mucronata* | No (Patagonia) | `chaura` | Centro, Sur, Patagonia, Austral (costa, valle) | Arbusto achaparrado con bayas blanco-rosadas; perenne. |
| Quillay | *Quillaja saponaria* | Sí (Chile) | `quillay` | Centro, Sur (precordillera, valle, costa) | Esclerófilo; flores blancas en primavera/verano. |
| Mañío | *Podocarpus spp.* | No (Patagonia) | `manio` | Sur, Patagonia, Austral (valle, costa, precordillera) | Conífera austral oscura y estrecha; perenne. |
| Canelo | *Drimys winteri* | No (Chile/Argentina) | `canelo` | Sur, Patagonia, Austral (valle, costa, precordillera) | Siempreverde de copa densa; flor blanca; árbol sagrado mapuche. |
| Arrayán | *Luma apiculata* | No (Chile/Argentina) | `arrayan` | Sur, Patagonia, Austral (valle, costa) | Tronco canela rojizo y copa menuda; flor blanca. |
| Notro / Ciruelillo | *Embothrium coccineum* | No (Chile/Argentina) | `notro` | Sur, Patagonia, Austral (valle, costa) | Ramilletes de flores rojas. |
| Arbusto genérico | — | — | `bush` | Altiplano, Norte, Centro, Sur, Patagonia, Austral (precordillera, valle, costa) | Bulto verde redondeado. |
| Cultivos / campos | — | — | `crop` | Norte, Centro (valle) | Hileras de cultivo; refuerza el valle agrícola. |
| Pasto / duna | — | — | `grass` | Altiplano, Norte, Centro, Sur, Patagonia, Austral (precordillera, valle, costa, playa) | Matas pequeñas de pasto. |
| Rocas | — | — | `rock` | Altiplano, Norte, Centro, Sur, Patagonia, Austral (precordillera, valle, costa, playa) | Pedreros sueltos. |
| Flor del desierto | — | — | `flower` | — | Parche del desierto florido; entra solo con la floración. |
<!-- END:flora-tabla -->

> La vegetación no crece dentro del cauce: `placeFlora` omite las columnas con `riverInfluence > 0.25`
> y usa `bankHeight` para sentarse en el banco.

## Estaciones

Además del tinte de `applySeason`, las especies caducifolias tienen **variantes estructurales por
estación** ([D-031](12-decisiones.md), [15 · Estaciones](15-estaciones.md)); `placeFlora` recibe el
índice de estación y solo cambia el **dibujo** (el spawn es idéntico, los dorados quedan intactos):

- **Lenga y roble** (caducifolios): en **otoño** pierden hojas (huecos deterministas en la copa,
  `hash1` por planta); en **invierno** quedan **desnudos** (solo ramas, `drawBareBranches`); en
  **primavera** muestran **brotes** claros en la punta.
- **Copihue y michay**: las campanas/flores aparecen en **primavera y verano**; en otoño e invierno
  solo se ve el follaje/enredadera.
- **Quillay**: las motas blancas de flor aparecen en **primavera y verano**.
- La **chaura** es perenne y conserva sus bayas todo el año.

## Biomas

El bioma (`src/biomes.js`) **pondera** los `types` de cada capa; el pool efectivo se construye con
`biomeFloraPool` (ver [D-016](12-decisiones.md)). El **norte árido no tiene araucaria** (matorral,
copao y roca); el **sur** suma alerce, nalca, colihue, coihue, roble, copihue y michay
([D-022](12-decisiones.md)); el **centro** aporta el quillay esclerófilo y el **sur/Patagonia** el
mañío; el **austral** (fiordos) suma canelo, arrayán y notro
([D-037](12-decisiones.md), [D-043](12-decisiones.md)). El tipo `flower` solo aparece con la floración
del norte (`bloomAt`, [D-017](12-decisiones.md) y [D-024](12-decisiones.md)); se dibuja como manto
amplio de tallos con corola de 3 px (`drawFlower`, ~10x el racimo original) que se **reparte hacia
dentro de la banda visible** de la capa, cubriendo el valle y no solo su contorno.

## Especificación de sprites

Tamaños actuales en px (se reemplazarán por sprites definitivos más adelante):

| Tipo | Tamaño | Frames | Animación |
|------|--------|--------|-----------|
| Araucaria | 5–24 | 1 | Bamboleo por seno (sway) |
| Lenga | 8–22 | 1 | — |
| Arbusto | 4–? | 1 | — |
| Cultivo | 5–12 | 1 | — |
| Pasto | 4–9 | 1 | — |
| Roca | 4–? | 1 | — |
| Cactus | 6–? | 1 | — |
| Alerce | 8–? | 1 | — |
| Nalca | 8–? | 1 | — |
| Colihue | 4–? | 1 | — |
| Palma | 8–? | 1 | — |
| Coihue | 6–? | 1 | — |
| Roble | 6–? | 1 | — |
| Copihue | 5–? | 1 | — |
| Michay | 3–? | 1 | Flores por estación (primavera/verano) |
| Chaura | 3–? | 1 | — |
| Quillay | 5–? | 1 | Flores por estación (primavera/verano) |
| Mañío | 7–? | 1 | — |
| Canelo | 6–? | 1 | Flores por estación (primavera/verano) |
| Arrayán | 5–? | 1 | Flores por estación (primavera/verano) |
| Notro | 5–? | 1 | Flores por estación (primavera/verano) |
| Flor | 4–? | 1 | Bamboleo por seno (sway) |

## Fichas de especies

Cada especie tiene su ficha en [`especies/`](especies/README.md), generada con `npm run species`
(nombre científico, endemismo, zona y notas).

## Especies por añadir (propuestas)

- Otros arbustos del sotobosque y especies locales (post-1.0).

## Cómo añadir una especie

1. Añade la especie al registro `FLORA` en `src/flora.js` (`kind`, `common`, `sci`, `endemism`,
   `notes` y `zones`, donde `zones[bioma][capa]` es su peso en el pool).
2. Añade su caso a `DRAWERS` (misma clave que el tipo) y, si aplica, el color a `palette.js`.
3. Ejecuta `npm run species` para regenerar esta tabla, la de [06 · Fauna](06-fauna.md) y su ficha
   en [`especies/`](especies/README.md).
4. Documenta en [`12-decisiones.md`](12-decisiones.md) si cambia el diseño. `npm test` valida que
   `FLORA` y `DRAWERS` coincidan y que las zonas referencien biomas/capas válidos.
