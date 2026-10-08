# 02 · Mundo y geografía

> Estado: estable · Actualizado: 2026-10-08

## Punto de vista

Se mira **desde el mar hacia la cordillera** (oeste → este), reproduciendo el perfil de Chile central.
El mar queda al frente (parallax mayor) y los Andes al fondo (parallax menor).

## Las 6 capas

De atrás hacia adelante (todas definidas en `src/terrain.js`, arreglo `LAYERS`):

| # | Capa | Parallax | `baseY` | `amp` | Rugosidad | Nieve | Rasgos |
|---|------|----------|---------|-------|-----------|-------|--------|
| 1 | Cordillera de los Andes | 0.07 | 128 | 92 | alta (ridged) | **siempre** | cumbres escarpadas, **volcanes** con penacho, vetas de roca |
| 2 | Precordillera | 0.16 | 158 | 50 | alta | poca | rocosa, más baja |
| 3 | Valle central | 0.32 | 200 | 20 | baja | no | verde, campos, **río**; protagonista |
| 4 | Cordillera de la Costa | 0.52 | 226 | 12 | **muy baja** | no | muy verde y redondeada, **portezuelo** |
| 5 | Playa | 0.78 | 232 | 7 | muy baja | no | banda de arena, línea de marea |
| 6 | Mar | 1.0 | `SEA_Y`=242 | 6 | oleaje | no | olas, espuma, horizonte |

- Resolución interna: **altura 270 px** y ancho por relación de aspecto (**960×270** a 32:9, por
  defecto). Ver [08 · Arte pixel](08-arte-pixel.md).
- Cada capa es una silueta rellenada hasta el fondo; las capas delanteras ocultan a las traseras.
- `parallax` = cuánto se mueve la capa respecto a la cámara (1.0 = pegado al frente).
- `rugged` = peso del ruido *ridged* (alto = crestas afiladas; bajo = colinas suaves).

## Suelo y agua

- **Nieve**: aparece sobre cierta fracción de `amp` (`snowFrac`). Los Andes la tienen siempre; la
  línea la desplazan el bioma y la estación ([15 · Estaciones](15-estaciones.md)).
- **Volcanes**: conos deterministas por hash, con penacho animado (`volcano`).
- **Roca**: vetas sutiles bajo la nieve en los Andes (`rocky`).
- **Campos**: textura de franjas en el valle (`fields`).
- **Línea de marea**: arena húmeda en la playa (`beach`).
- **Ríos**: tallados en el valle y la Costa (`rivers`). Ver [07 · Ríos](07-rios.md).

## Biomas y regiones

El perfil de las 6 capas es común, pero el **bioma** cambia el tinte y la composición de flora/fauna
según la región (`src/biomes.js`, ver [D-016](12-decisiones.md)). Hay tres:

| Bioma | Carácter | Flora | Fauna |
|-------|----------|-------|-------|
| **norte** | árido (Atacama/Coquimbo) | matorral y roca, **sin araucaria** | guanaco, vicuña, culpeo, flamenco, chinchilla |
| **centro** | actual (Linares–O'Higgins) | pools de `LAYERS` sin cambios | pools de `LAYERS` sin cambios |
| **sur** | boscoso (Araucanía/Patagonia) | lenga y araucaria densas | pudú, monito del monte, choroy, huemul, puma |

- **Procedural**: `biomeWeights(worldX, seed)` mezcla los biomas con ruido de baja frecuencia, así el
  paisaje **cambia al recorrer** (transición suave, sin saltos). Frecuencia `0.00015` (~regiones de
  miles de px).
- **Seleccionable**: `?biome=norte|centro|sur|auto` o el selector **Región** del panel.
- **Geometría**: `biomeGeometry` modula la **amplitud** (`ampMul`) y la **línea de nieve**
  (`snowShift`): el norte baja el relieve y sube la nieve; el sur lo eleva y la baja. Se aplica en
  `bankHeight`/`drawLayer` vía `setBiomeGeometry` (solo en capas con nieve). El **centro** no cambia.
- **Tinte**: el bioma tiñe paleta de terreno/flora/suelo (nunca cielo ni astros) y **pondera** los
  pools de especies. La frecuencia del ruido (`freq`) no se toca: solo amplitud y nieve.
- **Desierto florido**: en el norte, `bloomAt` abre **parches amplios y raros** de flores (tipo
  `flower`) y sube la actividad de aves/zorros. El ancho del parche lo fija `BLOOM_BLOCK` (~60000 px)
  y la puerta de norte se evalúa en el centro del bloque, así el parche no queda recortado por el
  ancho de la región norte. Las flores se reparten hacia el interior de la banda visible de cada capa
  (no solo en el contorno) y el suelo se tiñe de tonos floridos. Se fuerza con
  `?biome=norte&bloom=on` (ver [D-017](12-decisiones.md) y [D-024](12-decisiones.md)).

## Escala y determinismo

- 1 unidad de mundo ≈ 1 px interno; el mundo avanza de forma continua en `x` (infinito).
- La altura de cualquier columna se calcula con `ridgeHeight(layer, worldX)`, así no hace falta
  almacenar el mundo: es una **función** de `x`.
- La semilla del usuario se mezcla en cada capa con `seedLayers(seed)`.

## Pendiente

- TODO: fijar una nomenclatura/altitud "real" aproximada por capa (m s. n. m.) para dar escala.
- TODO: documentar el largo de onda y la frecuencia de cada capa y por qué (sensación de escala).
