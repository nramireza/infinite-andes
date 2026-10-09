# 05 · Flora

> Estado: estable · Actualizado: 2026-10-09

Implementado en `src/flora.js` (dibujo y colocación) usando las paletas de `src/palette.js`.
La flora se dibuja por capa con `placeFlora(ctx, layer, ...)`; cada capa define en `LAYERS`
su `flora: { chunkW, minSize, maxSize, minChance, maxPer, types }`.

## Especies representadas (actualmente)

| Nombre común | Nombre científico | Endémica | Tipo en código | Zona/capa | Notas |
|--------------|-------------------|----------|----------------|-----------|-------|
| Araucaria / Pehuén | *Araucaria araucana* | Sí (Chile/Argentina) | `araucaria` | Precordillera, Valle, Costa | Silueta de paraguas; árbol emblema |
| Lenga / Ñire | *Nothofagus pumilio* / *N. antarctica* | No (Patagonia) | `lenga` | Costa, Valle | Copa redonda; variante cálida (otoño) |
| Copihue | *Lapageria rosea* | Sí (Chile) | `copihue` | Costa, Valle (sur) | Enredadera con campanas rojas; flor nacional |
| Arbusto genérico | — | — | `bush` | Varias | Bulto verde redondeado |
| Cultivos / campos | — | — | `crop` | Valle | Hileras; refuerza el valle como zona agrícola |
| Pasto / duna | — | — | `grass` | Playa, Valle, Costa | Matas pequeñas |
| Rocas | — | — | `rock` | Andes, Playa, Costa | Pedreros sueltos |
| Flor del desierto | — | — | `flower` | Valle, Costa, Playa (norte) | Parches de flores del **desierto florido**; las corolas se apagan de noche |
| Copao / Cactus columnar | *Eulychnia* spp. | No | `cactus` | Norte (precordillera, valle, costa) | Columna con brazos y espinas |
| Alerce / Lahual | *Fitzroya cupressoides* | Sí (Chile/Arg) | `alerce` | Sur (precordillera, costa) | Conífera alta y estrecha; en peligro |
| Nalca / Pangue | *Gunnera tinctoria* | Sí (Chile/Arg) | `nalca` | Sur (valle, costa) | Hojas gigantes junto al agua |
| Colihue / Quila | *Chusquea* spp. | No | `colihue` | Sur (valle, costa) | Cañaverales |
| Palma chilena | *Jubaea chilensis* | Sí (Chile) | `palma` | Centro (valle, costa) | Tronco esbelto y frondas; en peligro |
| Coihue | *Nothofagus dombeyi* | No (Patagonia) | `coihue` | Costa, Valle (sur) | Copa ancha y redondeada; tronco recto |
| Roble | *Nothofagus obliqua* | Sí (Chile/Arg) | `roble` | Costa, Valle (sur) | Copa estrecha y erguida |
| Michay | *Berberis darwinii* | No (Patagonia) | `michay` | Precordillera, Valle, Costa (sur) | Arbusto espinoso con flores naranjas |
| Chaura | *Gaultheria mucronata* | No (Patagonia) | `chaura` | Costa (sur) | Arbusto achaparrado con bayas blanco-rosadas |

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
- La **chaura** es perenne y conserva sus bayas todo el año.

## Biomas

El bioma (`src/biomes.js`) **pondera** los `types` de cada capa; el pool efectivo se construye con
`biomeFloraPool` (ver [D-016](12-decisiones.md)). El **norte árido no tiene araucaria** (matorral,
copao y roca); el **sur** suma alerce, nalca, colihue, coihue, roble, copihue y michay
([D-022](12-decisiones.md)). El tipo `flower` solo aparece con la floración
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
| Michay | 3–? | 1 | — |
| Chaura | 3–? | 1 | — |
| Flor | 4–? | 1 | Bamboleo por seno (sway) |

## Especies por añadir (propuestas)

- Quillay (*Quillaja saponaria*), mañío (*Podocarpus*) y otros arbustos del sotobosque (post-1.0).

## Cómo añadir una especie

1. Copia [`templates/especimen.md`](templates/especimen.md).
2. Añade el tipo de dibujo en `src/flora.js` (`drawPlant`) y, si aplica, el color a `palette.js`.
3. Reparte la especie por capas en `LAYERS[*].flora.types` (bioma **centro**) y/o en
   `BIOMES[*].flora` de `src/biomes.js` (norte/sur).
4. Documenta aquí y en [`12-decisiones.md`](12-decisiones.md) si cambia el diseño.
