# 02 · Mundo y geografía

> Estado: estable · Actualizado: 2026-10-10

## Punto de vista

Se mira **desde el mar hacia la cordillera** (oeste → este), reproduciendo el perfil de Chile central.
El mar queda al frente (parallax mayor) y los Andes al fondo (parallax menor).

## Las 6 capas

De atrás hacia adelante (todas definidas en `src/terrain.js`, arreglo `LAYERS`):

| # | Capa | Parallax | `baseY` | `amp` | Rugosidad | Nieve | Rasgos | Altitud aprox. |
|---|------|----------|---------|-------|-----------|-------|--------|----------------|
| 1 | Cordillera de los Andes | 0.07 | 128 | 92 | alta (ridged) | **siempre** | cumbres escarpadas, **volcanes** con penacho, vetas de roca | 3 000–5 500 m |
| 2 | Precordillera | 0.16 | 158 | 50 | alta | poca | rocosa, más baja | 1 500–2 500 m |
| 3 | Valle central | 0.32 | 200 | 20 | baja | no | verde, campos, **río**; protagonista | 400–600 m |
| 4 | Cordillera de la Costa | 0.52 | 226 | 12 | **muy baja** | no | muy verde y redondeada, **portezuelo** | 800–1 500 m |
| 5 | Playa | 0.78 | 232 | 7 | muy baja | no | banda de arena, línea de marea | 0–5 m |
| 6 | Mar | 1.0 | `SEA_Y`=242 | 6 | oleaje | no | olas, espuma, horizonte | 0 m |

- Resolución interna: **altura 270 px** y ancho por relación de aspecto (**960×270** a 32:9, por
  defecto). Ver [08 · Arte pixel](08-arte-pixel.md).
- Cada capa es una silueta rellenada hasta el fondo; las capas delanteras ocultan a las traseras.
- `parallax` = cuánto se mueve la capa respecto a la cámara (1.0 = pegado al frente).
- `rugged` = peso del ruido *ridged* (alto = crestas afiladas; bajo = colinas suaves).

## Escala "real" (nomenclatura aproximada)

La **altitud aproximada** por capa (columna derecha de la tabla) es una convención artística para
dar escala, inspirada en Chile central: cordillera sobre los 3 000 m con nieve permanente, valle
central bajo y fértil, cordillera de la Costa redondeada. **No es cartografía**: es una
interpretación estética (ver [00 · Visión](00-vision.md)). El relieve interno sigue siendo
`baseY ± amp` en píxeles; la altitud solo se usa para nombrar y comparar (línea de nieve,
biomas) en la documentación.

## Frecuencia y longitud de onda

Cada capa genera su silueta con ruido de valor + fBm de frecuencia `freq` (`src/noise.js`), en
ciclos por píxel de mundo. La **longitud de onda** (1/`freq`) da la sensación de escala:

| Capa | `freq` | Longitud de onda | Lectura |
|------|--------|------------------|---------|
| Andes | 0.0032 | ≈ 312 px | montañas anchas y lentas: lejanía |
| Precordillera | 0.0060 | ≈ 167 px | media |
| Valle | 0.012 | ≈ 83 px | colinas medias |
| Costa | 0.010 | ≈ 100 px | lomajes redondeados |
| Playa | 0.020 | ≈ 50 px | detalle fino |
| Mar | 0.05 | ≈ 20 px | oleaje corto |

La regla: **a más lejos, longitud de onda más larga** (montañas que cambian lento) y **a más cerca,
más corta** (textura rápida); combinada con el `parallax` y la amplitud, produce la profundidad.

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
según la región (`src/biomes.js`, ver [D-016](12-decisiones.md)). Hay seis, en el orden en que
aparecen al recorrer (de norte a sur):

| Bioma | Carácter | Flora | Fauna |
|-------|----------|-------|-------|
| **altiplano** | puna alta y fría (Norte Grande) | pastizal y matorral bajo, **sin árboles** | vicuña, guanaco, chinchilla, flamenco |
| **norte** | árido (Atacama/Coquimbo) | matorral, copao y roca, **sin araucaria** | guanaco, vicuña, culpeo, flamenco, chinchilla |
| **centro** | actual (Linares–O'Higgins) | pools de `LAYERS` (con quillay) | pools de `LAYERS` sin cambios |
| **sur** | boscoso (Araucanía/Los Lagos) | lenga y araucaria densas | pudú, monito del monte, choroy, huemul, puma |
| **patagonia** | estepa fría (Aysén/Magallanes) | lenga baja, coirón y matorral | guanaco, choique, puma, huemul |
| **austral** | fiordos (sur insular) | islas boscosas: mañío, canelo, coihue | huillín, chungungo, pingüino, chucao, rana |

- **Procedural**: `biomeWeights(worldX, seed)` mezcla los biomas con ruido de baja frecuencia, así el
  paisaje **cambia al recorrer** (transición suave, sin saltos). Frecuencia `0.00015` (~regiones de
  miles de px); cada bioma domina en su centro y se mezcla con el vecino.
- **Seleccionable**: `?biome=altiplano|norte|centro|sur|patagonia|austral|auto` o el selector **Región** del panel.
- **Geometría**: `biomeGeometry` modula la **amplitud** (`ampMul`), la **línea de nieve**
  (`snowShift`) y la **fuerza de fiordos** (`fjord`): el norte baja el relieve y sube la nieve; el
  altiplano lo eleva con algo de nieve; el sur lo eleva y la baja, y la Patagonia es la más nevada.
  Se aplica en `bankHeight`/`drawLayer` vía `setBiomeGeometry` (solo en capas con nieve). El
  **centro** no cambia.
- **Fiordos** ([D-042](12-decisiones.md)): solo con bioma **austral**, `setFjordStrength` activa
  canales de agua densos que tallan el valle y la Costa (`fjords` en `LAYERS`, reutilizando el
  tallado de ríos); sin ese bioma no se talla ni se dibuja ningún canal.
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

- Ninguna pendiente: la altitud aproximada y la frecuencia/longitud de onda quedaron documentadas
  arriba (cierre v1.0, [D-035](12-decisiones.md)).
