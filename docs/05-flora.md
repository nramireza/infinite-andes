# 05 · Flora

> Estado: estable · Actualizado: 2026-10-10

Implementado en `src/flora.js` (registro, dibujo y colocación) usando las paletas de `src/palette.js`.
La flora se dibuja por capa con `placeFlora(ctx, layer, ...)`; cada capa define en `LAYERS` su
`flora: { chunkW, minSize, maxSize, minChance, maxPer }` (lo espacial) y el registro `FLORA` define
las especies y sus `zones` (los pools por bioma y capa).

## Especies representadas (actualmente)

<!-- BEGIN:flora-tabla (generado con `npm run species`) -->
| Nombre común | Nombre científico | Endémica | Tipo en código | Zona/capa | Altura real | Notas |
|--------------|-------------------|----------|----------------|-----------|-------------|-------|
| Araucaria / Pehuén | *Araucaria araucana* | Sí (Chile/Argentina) | `araucaria` | Centro, Sur (precordillera, valle, costa) | 30–40 m | Árbol emblema; silueta de paraguas; la copa se bambolea. |
| Lenga / Ñire | *Nothofagus pumilio / N. antarctica* | No (Patagonia) | `lenga` | Centro, Sur, Patagonia, Austral (costa, precordillera, valle) | 15–25 m | Caducifolio: pierde hojas en otoño, queda desnudo en invierno y brota en primavera. |
| Copihue | *Lapageria rosea* | Sí (Chile) | `copihue` | Centro, Sur (costa, valle) | trepadora (hasta ~10 m) | Enredadera y flor nacional; campanas rojas en primavera/verano. |
| Copao / Cactus columnar | *Eulychnia spp.* | No | `cactus` | Altiplano, Norte (precordillera, valle, costa) | 3–7 m | Columna con brazos y espinas. |
| Alerce / Lahual | *Fitzroya cupressoides* | Sí (Chile/Argentina) | `alerce` | Sur, Austral (precordillera, costa) | 40–45 m | Conífera alta y estrecha; en peligro. |
| Nalca / Pangue | *Gunnera tinctoria* | Sí (Chile/Argentina) | `nalca` | Sur, Austral (valle, costa) | 1,5–3 m (hojas) | Hojas gigantes junto al agua. |
| Colihue / Quila | *Chusquea spp.* | No | `colihue` | Sur, Patagonia, Austral (valle, costa) | 3–6 m | Cañaverales (bambú nativo). |
| Palma chilena | *Jubaea chilensis* | Sí (Chile) | `palma` | Centro (valle, costa) | 15–20 m | Tronco esbelto y frondas; en peligro. |
| Coihue | *Nothofagus dombeyi* | No (Patagonia) | `coihue` | Centro, Sur, Patagonia, Austral (valle, costa, precordillera) | 35–45 m | Copa ancha y redondeada; tronco recto. |
| Roble | *Nothofagus obliqua* | Sí (Chile/Argentina) | `roble` | Centro, Sur (valle, costa) | 25–35 m | Caducifolio; copa estrecha y erguida; pierde hojas en otoño. |
| Michay | *Berberis darwinii* | No (Patagonia) | `michay` | Centro, Sur, Patagonia (valle, costa, precordillera) | 1–3 m | Arbusto espinoso; flores naranjas en primavera/verano. |
| Chaura | *Gaultheria mucronata* | No (Patagonia) | `chaura` | Centro, Sur, Patagonia, Austral (costa, valle) | 0,5–1,5 m | Arbusto achaparrado con bayas blanco-rosadas; perenne. |
| Quillay | *Quillaja saponaria* | Sí (Chile) | `quillay` | Centro, Sur (precordillera, valle, costa) | 10–15 m | Esclerófilo; flores blancas en primavera/verano. |
| Mañío | *Podocarpus spp.* | No (Patagonia) | `manio` | Sur, Patagonia, Austral (valle, costa, precordillera) | 10–20 m | Conífera austral oscura y estrecha; perenne. |
| Canelo | *Drimys winteri* | No (Chile/Argentina) | `canelo` | Sur, Patagonia, Austral (valle, costa, precordillera) | 15–20 m | Siempreverde de copa densa; flor blanca; árbol sagrado mapuche. |
| Arrayán | *Luma apiculata* | No (Chile/Argentina) | `arrayan` | Sur, Patagonia, Austral (valle, costa) | 10–15 m | Tronco canela rojizo y copa menuda; flor blanca. |
| Notro / Ciruelillo | *Embothrium coccineum* | No (Chile/Argentina) | `notro` | Sur, Patagonia, Austral (valle, costa) | 5–10 m | Ramilletes de flores rojas. |
| Arbusto genérico | — | — | `bush` | Altiplano, Norte, Centro, Sur, Patagonia, Austral (precordillera, valle, costa) | — | Bulto verde redondeado. |
| Cultivos / campos | — | — | `crop` | Norte, Centro (valle) | — | Hileras de cultivo; refuerza el valle agrícola. |
| Pasto / duna | — | — | `grass` | Altiplano, Norte, Centro, Sur, Patagonia, Austral (precordillera, valle, costa, playa) | — | Matas pequeñas de pasto. |
| Rocas | — | — | `rock` | Altiplano, Norte, Centro, Sur, Patagonia, Austral (precordillera, valle, costa, playa) | — | Pedreros sueltos. |
| Flor del desierto | — | — | `flower` | — | — | Parche del desierto florido; entra solo con la floración. |
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

## Altura relativa (porte por especie)

El tamaño de cada planta no es fijo por tipo: cada capa define un rango (`flora.minSize`–`maxSize`
en `terrain.js`) y **cada especie lo multiplica por su `height`**, para reflejar su porte real
([D-049](12-decisiones.md)). Así la perspectiva por parallax se conserva (una araucaria de
precordillera sigue siendo menor que una de costa) y, dentro de una capa, los árboles duplican a los
arbustos.

| Tipo | `height` | Altura real | Tipo | `height` | Altura real |
|------|----------|-------------|------|----------|-------------|
| Araucaria | ×1.9 | 30–40 m | Quillay | ×1.0 | 10–15 m |
| Alerce | ×1.9 | 40–45 m | Arrayán | ×1.0 | 10–15 m |
| Coihue | ×1.7 | 35–45 m | Notro | ×0.9 | 5–10 m |
| Roble | ×1.5 | 25–35 m | Nalca | ×0.9 | 1,5–3 m (hojas) |
| Palma | ×1.4 | 15–20 m | Colihue | ×1.1 | 3–6 m |
| Mañío | ×1.4 | 10–20 m | Copihue | ×1.1 | trepadora |
| Lenga | ×1.3 | 15–25 m | Copao | ×1.2 | 3–7 m |
| Canelo | ×1.3 | 15–20 m | Michay | ×0.7 | 1–3 m |
| Chaura | ×0.6 | 0,5–1,5 m | Arbusto genérico | ×0.7 | — |
| Cultivo | ×0.8 | — | Pasto / duna | ×0.5 | — |
| Rocas | ×0.7 | — | Flor del desierto | ×1.0 | — |

En `floraSpawns` el `rng` se consume igual que antes (solo cambia el `size`, no la posición ni el
tipo), de modo que el paisaje sigue siendo reproducible.

## Silueta y hábito

Los `DRAWERS` priorizan el **hábito real** de cada planta sobre el color ([D-048](12-decisiones.md)),
dentro del tamaño de la capa escalado por el porte de la especie:

- **Araucaria**: tronco alto y recto con **copa de paraguas** (ancha al centro, redondeada) y ramas
  punzantes por pisos.
- **Alerce**: tronco recto visible y copa cónica estrecha con ramas colgantes.
- **Palma chilena**: tronco con anillos y **frondas radiales** que escalan con el tamaño.
- **Copao / cactus**: tronco con costilla iluminada, **brazo en candelabro** y espinas.
- **Nalca**: roseta de **hojas grandes de borde dentado** con nervadura marcada sobre pecíolos.
- **Colihue**: cañas con **nudos** visibles y hojas diagonales.
- **Coihue y roble** (Nothofagus): tronco con **ramas que abren hacia la copa** y contorno
  irregular (hash determinista), no una elipse perfecta.

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
