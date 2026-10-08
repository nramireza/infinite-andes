# 05 · Flora

> Estado: estable · Actualizado: 2026-10-08

Implementado en `src/flora.js` (dibujo y colocación) usando las paletas de `src/palette.js`.
La flora se dibuja por capa con `placeFlora(ctx, layer, ...)`; cada capa define en `LAYERS`
su `flora: { chunkW, minSize, maxSize, minChance, maxPer, types }`.

## Especies representadas (actualmente)

| Nombre común | Nombre científico | Endémica | Tipo en código | Zona/capa | Notas |
|--------------|-------------------|----------|----------------|-----------|-------|
| Araucaria / Pehuén | *Araucaria araucana* | Sí (Chile/Argentina) | `araucaria` | Precordillera, Valle, Costa | Silueta de paraguas; árbol emblema |
| Lenga / Ñire | *Nothofagus pumilio* / *N. antarctica* | No (Patagonia) | `lenga` | Costa, Valle | Copa redonda; variante cálida (otoño) |
| Copihue | *Lapageria rosea* | Sí (Chile) | detalle | Primer plano | Flor nacional; puntos de color ocasionales |
| Arbusto genérico | — | — | `bush` | Varias | Bulto verde redondeado |
| Cultivos / campos | — | — | `crop` | Valle | Hileras; refuerza el valle como zona agrícola |
| Pasto / duna | — | — | `grass` | Playa, Valle, Costa | Matas pequeñas |
| Rocas | — | — | `rock` | Andes, Playa, Costa | Pedreros sueltos |
| Flor del desierto | — | — | `flower` | Valle, Costa, Playa (norte) | Parches de flores del **desierto florido** |

> La vegetación no crece dentro del cauce: `placeFlora` omite las columnas con `riverInfluence > 0.25`
> y usa `bankHeight` para sentarse en el banco.

## Biomas

El bioma (`src/biomes.js`) **pondera** los `types` de cada capa; el pool efectivo se construye con
`biomeFloraPool` (ver [D-016](12-decisiones.md)). El **norte árido no tiene araucaria** (matorral y
roca); el **sur** densifica lenga y araucaria. El tipo `flower` solo aparece con la floración del
norte (`bloomAt`, [D-017](12-decisiones.md)); se dibuja como parche de tallos con corola de 3 px.

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

## Especies por añadir (propuestas)

- TODO: Nalca / Pangue (*Gunnera tinctoria*, endémica) — hojas gigantes junto a cursos de agua.
- TODO: Copihue como enredadera en bosque de la Costa (no solo flor suelta).
- TODO: Coihue (*Nothofagus dombeyi*) y Roble (*N. obliqua*) para el bosque de la Costa.
- TODO: Copao (*Eulychnia* spp.) y cactus columnares para zonas áridas.
- TODO: Colihue / Quila (*Chusquea* spp.) — cañaverales.
- TODO: Palma chilena (*Jubaea chilensis*, endémica y en peligro).
- TODO: Alerce / Lahual (*Fitzroya cupressoides*).
- TODO: Michay, Chaura y otros arbustos del sotobosque.

## Cómo añadir una especie

1. Copia [`templates/especimen.md`](templates/especimen.md).
2. Añade el tipo de dibujo en `src/flora.js` (`drawPlant`) y, si aplica, el color a `palette.js`.
3. Reparte la especie por capas en `LAYERS[*].flora.types` (bioma **centro**) y/o en
   `BIOMES[*].flora` de `src/biomes.js` (norte/sur).
4. Documenta aquí y en [`12-decisiones.md`](12-decisiones.md) si cambia el diseño.
