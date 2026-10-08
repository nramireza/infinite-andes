# 02 · Mundo y geografía

> Estado: en progreso · Actualizado: 2026-10-08

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

- **Nieve**: aparece sobre cierta fracción de `amp` (`snowFrac`). Los Andes la tienen siempre.
- **Volcanes**: conos deterministas por hash, con penacho animado (`volcano`).
- **Roca**: vetas sutiles bajo la nieve en los Andes (`rocky`).
- **Campos**: textura de franjas en el valle (`fields`).
- **Línea de marea**: arena húmeda en la playa (`beach`).
- **Ríos**: tallados en el valle y la Costa (`rivers`). Ver [07 · Ríos](07-rios.md).

## Escala y determinismo

- 1 unidad de mundo ≈ 1 px interno; el mundo avanza de forma continua en `x` (infinito).
- La altura de cualquier columna se calcula con `ridgeHeight(layer, worldX)`, así no hace falta
  almacenar el mundo: es una **función** de `x`.
- La semilla del usuario se mezcla en cada capa con `seedLayers(seed)`.

## Pendiente

- TODO: fijar una nomenclatura/altitud "real" aproximada por capa (m s. n. m.) para dar escala.
- TODO: decidir si el perfil es siempre el mismo o si varía por región (Norte/Centro/Sur).
- TODO: documentar el largo de onda y la frecuencia de cada capa y por qué (sensación de escala).
