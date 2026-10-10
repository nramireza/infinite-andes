# 06 · Fauna

> Estado: estable · Actualizado: 2026-10-10

**Set implementado** (Fase 2) en [`src/fauna.js`](../src/fauna.js): el grueso de la tabla objetivo,
con sprites de **matrices de píxeles en código**, spawn determinista por *chunk* y actividad según
la hora.

## Implementado (Fase 2)

<!-- BEGIN:fauna-implementado (generado con `npm run species`) -->
| Tipo en código | Nombre común | Capa(s) | Movimiento | Actividad |
|----------------|--------------|---------|------------|-----------|
| `condor` | Cóndor | Andes | `fly` | día |
| `huemul` | Huemul | Precordillera, Valle | `walk` | día |
| `pudu` | Pudú | Valle, Costa, Precordillera | `walk` | crepúsculo |
| `guina` | Güiña / Kodkod | Valle, Costa | `hop` | noche |
| `puma` | Puma | Precordillera, Valle | `walk` | crepúsculo |
| `culpeo` | Zorro culpeo | Precordillera, Valle, Costa | `walk` | día |
| `chilla` | Zorro chilla | Costa, Playa, Valle | `walk` | crepúsculo |
| `guanaco` | Guanaco | Precordillera, Valle | `walk` | día |
| `vicuna` | Vicuña | Precordillera, Valle | `walk` | día |
| `chingue` | Chingue | Valle, Costa | `walk` | noche |
| `monito` | Monito del monte | Costa | `hop` | noche |
| `chinchilla` | Chinchilla de cola larga | Andes, Precordillera | `hop` | noche |
| `choroy` | Choroy | Costa | `flock` | día |
| `cachana` | Cachaña | Costa | `flock` | día |
| `flamenco` | Flamenco chileno | Playa | `walk` | día |
| `chungungo` | Chungungo | Mar | `swim` | día |
| `pinguino` | Pingüino de Humboldt | Mar | `swim` | día |
| `rana` | Rana de Darwin | Costa, Valle (borde del cauce) | `sit` | día |
| `choique` | Choique / Ñandú petizo | Precordillera, Valle | `walk` | día |
| `chucao` | Chucao | Costa | `hop` | día |
| `huillin` | Huillín | Valle, Costa (borde del cauce) | `swim` | día |
<!-- END:fauna-implementado -->

### Especificación de sprites

Anchura y frames por tipo; el mapa de paleta mezcla claves de `getPalette` con algún **hex
literal** (flamenco, pingüino) para tonos que la paleta no cubre. La guía general está en
[08 · Arte pixel](08-arte-pixel.md).

| Tipo | Tamaño (px) | Frames | Anclaje | Silueta / color |
|------|-------------|--------|---------|-----------------|
| `condor` | 20 × 6 | 2 | centro | alas anchas con primarias "digitadas", collar `snow`, cabeza chica |
| `huemul` | 9 × 9 | 2 | pies | cuerpo robusto, cuello corto, astas bifurcadas (`trunk`/`sandD`) |
| `pudu` | 7 × 7 | 2 | pies | ciervo diminuto, hocico corto |
| `guina` | 8 × 4 | 2 | pies | felino pequeño y redondo, vientre `sandD` |
| `puma` | 12 × 5 | 2 | pies | perfil largo, cola tendida, vientre `sand` |
| `culpeo` | 9 × 5 | 2 | pies | zorro de cola poblada `#c96a3a` |
| `chilla` | 8 × 5 | 2 | pies | zorro gris, cola más corta |
| `guanaco` | 8 × 14 | 2 | pies | cuello y patas largos (`sandD`/`sand`) |
| `vicuna` | 7 × 12 | 2 | pies | camélido esbelto y erguido |
| `chingue` | 9 × 4 | 2 | pies | rayas `snow`, cola blanca |
| `monito` | 7 × 6 | 2 | pies | marsupial diminuto |
| `chinchilla` | 7 × 6 | 2 | pies | roedor redondo, orejas grandes, cola `snowD` |
| `choroy` / `cachana` | 10 × 5 | 2 | centro | loros con cola larga, verde/rojizo |
| `flamenco` | 7 × 15 | 2 | pies | cuello en S, patas finas, pico curvo `#f2a0b8` |
| `pinguino` | 7 × 10 | 2 | pies | erguido, aletas, pico naranja |
| `chungungo` | 12 × 4 | 2 | pies | mustélido alargado nadando |
| `huillin` | 12 × 4 | 2 | pies | nutria de río alargada |
| `choique` | 8 × 15 | 2 | pies | ñandú: cuello y patas largos |
| `chucao` | 7 × 7 | 2 | pies | pecho rojizo `#c0502a`, cola corta |
| `rana` | 6 × 4 | 2 | pies | triangular, hocico puntiagudo |

- Los caracteres de la matriz se mapean a **claves de `getPalette(hour, weather)`** (o a un hex
  literal), así que la fauna responde a la hora y al clima sin reescribir colores.
- El dibujo es `fillRect` de 1 px en **coordenadas enteras** (helper `px`), con volteo horizontal
  según la dirección; no usa `document` ni canvas offscreen (testeable en Node).
- Animación discreta a *frame rate* fijo por especie (`fps`), sin `Math.random()`.

### Comportamiento

- **Spawn por chunk**: para cada bloque de `chunkW` px de la capa, un `hashInt` decide si hay
  fauna, de qué especie (ponderada por la lista) y en qué posición. La identidad del candidato
  **no depende de la hora**; la hora solo **filtra** si la especie está activa, de modo que
  volver a la misma posición y hora reproduce los mismos animales (ver [D-010](12-decisiones.md)).
- **Movimiento**: `fly` y `flock` trazan una trayectoria senoidal en el cielo de su capa; las
  bandadas (`flock`) dibujan dos compañeros en formación; `walk`/`hop`/`swim` siguen
  `bankHeight` y evitan el cauce (`riverInfluence > 0.25`). `swim` añade un vaivén sobre la
  superficie del agua; `sit` (rana de Darwin) queda **estática**. Las especies ligadas al cauce
  (`RIVER_SPECIES`: rana y huillín) se colocan aparte, en el **borde del río** de valle y Costa,
  con `chance`, `offset` y `seed` propios.
- **Despawn**: al salir de pantalla se descarta; el hash lo regenera idéntico al volver.
- **Densidad y rareza**: cada especie declara una clase (`rarity`) y el sorteo por chunk es
  **ponderado** (`pickWeighted`), de modo que lo abundante aparece más seguido. Ver la tabla de
  abajo y [D-015](12-decisiones.md).
- **Mar y playa**: la fauna marina (`swim`) se dibuja **sobre el mar**; la de playa (chilla,
  flamenco), sobre la arena.

### Densidad según rareza real

`chance` por capa fija cuánta fauna hay en el ambiente; la `rarity` de cada especie fija **cuál**
(y con qué frecuencia relativa). Pesos en `RARITY_WEIGHT` (`fauna.js`).

| Especie | UICN global | Chile | Clase | Peso |
|---------|-------------|-------|-------|------|
<!-- BEGIN:fauna-densidad (generado con `npm run species`) -->
| Chingue | LC | común | abundante | 6 |
| Zorro chilla | LC | común | abundante | 6 |
| Zorro culpeo | LC | común | abundante | 6 |
| Cachaña | LC | común | común | 3 |
| Choroy | LC | endémica, estable | común | 3 |
| Chucao | LC | común, sotobosque | común | 3 |
| Cóndor | NT | amplia | común | 3 |
| Güiña / Kodkod | LC | común, esquiva | común | 3 |
| Choique / Ñandú petizo | NT | decreciente | poco-común | 1.2 |
| Flamenco chileno | NT | localizado | poco-común | 1.2 |
| Guanaco | LC | VU centro/norte | poco-común | 1.2 |
| Monito del monte | NT | localizado | poco-común | 1.2 |
| Pudú | NT | decreciente | poco-común | 1.2 |
| Puma | LC (NT nacional) | NT nacional | poco-común | 1.2 |
| Vicuña | LC | localizada | poco-común | 1.2 |
| Huillín | EN | ríos del sur | rara | 0.5 |
| Pingüino de Humboldt | VU | colonias | rara | 0.5 |
| Chinchilla de cola larga | EN | casi extinta | muy-rara | 0.12 |
| Chungungo | EN | costero | muy-rara | 0.12 |
| Huemul | EN | ~1.000 ind. | muy-rara | 0.12 |
| Rana de Darwin | EN | endémica, en declive | muy-rara | 0.12 |
<!-- END:fauna-densidad -->

- **Chance por capa**: andes 0.25, precordillera 0.3, valle 0.5, costa 0.55, playa 0.3, mar 0.35.
- Fuentes: listados de la UICN (versiones 2016–2025), clasificación nacional del MMA y
  BirdLife/GBIF. Es una **aproximación artística**: el paisaje es un compendio nacional y las
  especies del sur (huemul, chinchilla, choroy) viven en su banda aunque no coincidan en latitud.

### Biomas y floración

El bioma (`src/biomes.js`) **pondera** las `species` de cada capa con `biomeFaunaPool` (ver
[D-016](12-decisiones.md), [D-038](12-decisiones.md)): el altiplano trae vicuña, guanaco, chinchilla
y flamenco; el norte, guanaco, vicuña, culpeo y flamenco; el sur, pudú, monito, choroy, huemul,
choique, chucao, **huillín** y la **rana de Darwin** (junto al cauce); la Patagonia, guanaco,
choique, puma y huemul. Durante el **desierto florido** (`bloomAt`,
[D-017](12-decisiones.md)) sube la densidad (`chance × (1 + 0.6·bloom)`) y se refuerzan aves y zorros
(`condor`, `culpeo`, `chilla`, `flamenco`).

## Especies objetivo (endémicas / nativas de Chile)

<!-- BEGIN:fauna-objetivo (generado con `npm run species`) -->
| Nombre común | Nombre científico | Endémica | Capa/zona | Actividad | Comportamiento |
|--------------|-------------------|----------|-----------|-----------|----------------|
| Cóndor | *Vultur gryphus* | No (Andes) | Altiplano, Norte, Centro, Sur, Patagonia, Austral (andes) | día | Ave símbolo de los Andes; planea lento con aleteo ocasional. |
| Huemul | *Hippocamelus bisulcus* | Sí (Chile/Argentina) | Centro, Sur, Patagonia, Austral (precordillera, valle) | día | Ciervo andino en peligro; pastorea y deja huellas. |
| Pudú | *Pudu puda* | Sí (Chile/Argentina) | Centro, Sur, Patagonia, Austral (valle, costa, precordillera) | crepúsculo | Uno de los ciervos más pequeños; camina entre arbustos. |
| Güiña / Kodkod | *Leopardus guigna* | Sí (Chile/Argentina) | Centro, Sur, Patagonia, Austral (valle, costa) | noche | Felino esquivo; se desplaza a saltos de noche. |
| Puma | *Puma concolor* | No | Sur, Patagonia, Austral (precordillera, valle) | crepúsculo | Depredador tope; raro y solitario; deja huellas. |
| Zorro culpeo | *Lycalopex culpaeus* | No (Sudamérica) | Altiplano, Norte, Centro, Sur, Patagonia (precordillera, valle, costa) | día | Zorro andino de cola rojiza; trota de día. |
| Zorro chilla | *Lycalopex griseus* | No | Altiplano, Norte, Centro, Sur, Patagonia, Austral (costa, playa, valle) | crepúsculo | Zorro gris, más pequeño; activo al crepúsculo. |
| Guanaco | *Lama guanicoe* | No | Altiplano, Norte, Centro, Patagonia, Austral (precordillera, valle) | día | Camélido silvestre; tropillas en la estepa; deja huellas. |
| Vicuña | *Vicugna vicugna* | No | Altiplano, Norte, Centro (precordillera, valle) | día | Camélido del altiplano; grupos muy ágiles. |
| Chingue | *Conepatus chinga* | No | Altiplano, Norte, Centro, Sur (valle, costa) | noche | Mofeta de hocico al suelo; lento, de noche. |
| Monito del monte | *Dromiciops gliroides* | Sí (Chile/Argentina) | Centro, Sur (costa) | noche | Marsupial, fósil viviente; diminuto, en el colihue. |
| Chinchilla de cola larga | *Chinchilla lanigera* | Sí (Chile) | Altiplano, Norte, Centro, Sur, Patagonia, Austral (andes, precordillera) | noche | Roedor ágil de roqueríos andinos; casi extinto. |
| Choroy | *Enicognathus leptorhynchus* | Sí (Chile) | Centro, Sur (costa) | día | Loro endémico; bandada ruidosa del bosque de la Costa. |
| Cachaña | *Enicognathus ferrugineus* | No (Patagonia) | Centro, Sur (costa) | día | Loro austral; vuela en bandadas. |
| Flamenco chileno | *Phoenicopterus chilensis* | No | Altiplano, Norte, Centro, Sur, Patagonia, Austral (playa) | día | Filtra en lagunas y marismas costeras. |
| Chungungo | *Lontra felina* | Sí (Chile/Perú) | Altiplano, Norte, Centro, Sur, Patagonia, Austral (mar) | día | Nutria marina; nada y se asoma entre roqueríos. |
| Pingüino de Humboldt | *Spheniscus humboldti* | No | Altiplano, Norte, Centro, Sur, Patagonia, Austral (mar) | día | Pingüino del Pacífico sur; nada y emerge. |
| Rana de Darwin | *Rhinoderma darwinii* | Sí (Chile/Argentina) | Centro, Sur, Patagonia, Austral (costa, valle) | día | Anfibio endémico estático en el borde del cauce. |
| Choique / Ñandú petizo | *Rhea pennata* | No | Sur, Patagonia (precordillera, valle) | día | Ñandú de la estepa; camina y deja huellas. |
| Chucao | *Scelorchilus rubecula* | No (Chile/Argentina) | Sur, Patagonia, Austral (costa) | día | Ave de sotobosque; pecho rojizo. |
| Huillín | *Lontra provocax* | No (Chile/Argentina) | Centro, Sur, Patagonia, Austral (valle, costa) | día | Nutria de río del sur; nada en el borde del cauce. |
<!-- END:fauna-objetivo -->

> Los nombres científicos y la condición de endemismo son una aproximación: varias especies son
> "nativas" más que endémicas de Chile. El estado de conservación (UICN/MMA) se detalla en la
> tabla de densidad de arriba.

## Modelo de datos de una especie

Cada entrada de `SPECIES` (`fauna.js`) es un **registro** con los campos de comportamiento
(`movement`, `active`, `speed`/`range`, `fps`, `anchor`, `rarity`), el sprite (`palette` y
`frames`), la metadata (`common`, `sci`, `endemism`, `iucn`, `chile`, `notes`), las **zonas**
(`zones[bioma][capa]`, fuente única de los pools) y la colocación (`placement.river`, `bloom`).
La flora sigue el mismo esquema en `FLORA` (`flora.js`). Ver [09 · Arquitectura](09-arquitectura.md).

## Pendiente

- [x] Priorizar un primer set (cóndor, pudú, güiña, huemul) para la Fase 2.
- [x] Especies extra: puma, zorros, guanaco, vicuña, chingue, monito del monte, chinchilla,
      choroy, cachaña, flamenco, chungungo, pingüino de Humboldt.
- [x] Ajustar densidad y rareza por especie según estado UICN/nacional (ver [D-015](12-decisiones.md)).
- [x] Rana de Darwin (*Rhinoderma darwinii*): borde del cauce, estática (`sit`).
- [x] Choique (*Rhea pennata*), chucao (*Scelorchilus rubecula*) y huillín (*Lontra provocax*)
      ([D-022](12-decisiones.md)); huellas tras la fauna que camina ([D-021](12-decisiones.md)).
- [x] Refinar los sprites icónicos (cóndor, huemul, pudú, güiña, puma, flamenco, pingüino,
      chungungo) con dithering manual ([D-033](12-decisiones.md), v0.16.0).
- [x] Post-1.0: el cóndor es un **momento** destacado (vuelo largo ocasional), junto a la **bandada**
      y la **manada** ([D-041](12-decisiones.md), v1.2.0).
- [x] Post-1.0: refinar los sprites restantes (zorros, camélidos, mustélidos, loros, etc.) y generar
      las fichas por especie ([D-044](12-decisiones.md), [`especies/`](especies/README.md), v1.2.0).
- [x] Post-1.0: **silueta y proporción** de toda la fauna revisadas a **escala relativa por especie**
      (camélidos y aves grandes más altos, especies pequeñas más compactas) y sprites redibujados a
      partir de la anatomía real ([D-047](12-decisiones.md), v1.4.0).

## Momentos de fauna

Además del cóndor, que existe como especie en el cielo, hay tres **momentos raros** de fauna
(`src/moments.js`, [D-041](12-decisiones.md)): el **vuelo de cóndor** con escolta, la **bandada** en
formación en V y la **manada** de guanacos trotando. Se disparan como el resto de momentos
(`?moment=condor|bandada|manada`) y son deterministas.

## Fichas de especies

Cada especie tiene su ficha en [`especies/`](especies/README.md), generada con `npm run species`
(nombre científico, endemismo, UICN, movimiento, actividad y rareza).
