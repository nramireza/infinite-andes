# 06 · Fauna

> Estado: en progreso · Actualizado: 2026-10-08

**Set implementado** (Fase 2) en [`src/fauna.js`](../src/fauna.js): el grueso de la tabla objetivo,
con sprites de **matrices de píxeles en código**, spawn determinista por *chunk* y actividad según
la hora.

## Implementado (Fase 2)

| Tipo en código | Nombre común | Capa(s) | Movimiento | Actividad |
|----------------|--------------|---------|------------|-----------|
| `condor` | Cóndor | Andes | `fly` | día |
| `huemul` | Huemul | Precordillera, Valle | `walk` | día |
| `pudu` | Pudú | Valle, Costa | `walk` | crepúsculo |
| `guina` | Güiña | Valle, Costa | `hop` | noche |
| `puma` | Puma | Precordillera | `walk` | crepúsculo |
| `culpeo` | Zorro culpeo | Valle, Costa | `walk` | día |
| `chilla` | Zorro chilla | Costa, Playa | `walk` | crepúsculo |
| `guanaco` | Guanaco | Precordillera | `walk` | día |
| `vicuna` | Vicuña | Precordillera | `walk` | día |
| `chingue` | Chingue | Valle | `walk` | noche |
| `monito` | Monito del monte | Costa | `hop` | noche |
| `chinchilla` | Chinchilla | Andes | `hop` | noche |
| `choroy` | Choroy | Costa | `flock` | día |
| `cachana` | Cachaña | Costa | `flock` | día |
| `flamenco` | Flamenco | Playa | `walk` | día |
| `chungungo` | Chungungo | Mar | `swim` | día |
| `pinguino` | Pingüino de Humboldt | Mar | `swim` | día |

### Especificación de sprites

Anchura y frames por tipo; el mapa de paleta mezcla claves de `getPalette` con algún **hex
literal** (flamenco, pingüino) para tonos que la paleta no cubre. La guía general está en
[08 · Arte pixel](08-arte-pixel.md).

| Tipo | Tamaño (px) aprox. | Frames | Anclaje | Color |
|------|--------------------|--------|---------|-------|
| `condor` | 16 × 6 | 2 | centro | cuerpo `trunk`, manchas `snow` |
| resto terrestres | 6–10 × 4–8 | 2 | pies | cuerpo `trunk`/`sandD`/`sand` |
| `choroy` / `cachana` | 8 × 4 | 2 | centro | verde/rojizo, en bandada |
| `flamenco` | 6 × 9 | 2 | pies | rosa literal `#f2a0b8` |
| `pinguino` | 6 × 8 | 2 | pies | negro/blanco, pico naranja |

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
  superficie del mar.
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
| Zorro chilla | LC | común | abundante | 6 |
| Zorro culpeo | LC | común | abundante | 6 |
| Chingue | LC | común | abundante | 6 |
| Cóndor | NT | amplia | común | 3 |
| Güiña | LC | común, esquiva | común | 3 |
| Choroy | LC | endémica, estable | común | 3 |
| Cachaña | LC | común | común | 3 |
| Guanaco | LC | VU centro/norte | poco-común | 1.2 |
| Pudú | NT | decreciente | poco-común | 1.2 |
| Puma | LC | NT nacional | poco-común | 1.2 |
| Vicuña | LC | localizada | poco-común | 1.2 |
| Flamenco | NT | localizado | poco-común | 1.2 |
| Monito del monte | NT | localizado | poco-común | 1.2 |
| Pingüino de Humboldt | VU | colonias | rara | 0.5 |
| Huemul | EN | ~1.000 ind. | muy-rara | 0.12 |
| Chungungo | EN | costero | muy-rara | 0.12 |
| Chinchilla de cola larga | EN | casi extinta | muy-rara | 0.12 |

- **Chance por capa**: andes 0.25, precordillera 0.3, valle 0.5, costa 0.55, playa 0.3, mar 0.35.
- Fuentes: listados de la UICN (versiones 2016–2025), clasificación nacional del MMA y
  BirdLife/GBIF. Es una **aproximación artística**: el paisaje es un compendio nacional y las
  especies del sur (huemul, chinchilla, choroy) viven en su banda aunque no coincidan en latitud.

## Especies objetivo (endémicas / nativas de Chile)

| Nombre común | Nombre científico | Endémica | Capa/zona | Actividad | Comportamiento |
|--------------|-------------------|----------|-----------|-----------|----------------|
| Cóndor | *Vultur gryphus* | No (Andes) | Cielo/Andes | Día | Planea lento, aleteo ocasional |
| Pudú | *Pudu puda* | Sí (Chile/Arg) | Valle, Costa | Crepúsculo/noche | Camina entre arbustos |
| Güiña / Kodkod | *Leopardus guigna* | Sí (Chile/Arg) | Valle, Costa | Noche | Se desplaza a saltos, esquivo |
| Huemul | *Hippocamelus bisulcus* | Sí (Chile/Arg) | Precordillera, Valle | Día | Pastorea, se desplaza en pequeños grupos |
| Puma | *Puma concolor* | No | Precordillera | Amanecer/atardecer | Raro, solitario |
| Zorro culpeo | *Lycalopex culpaeus* | No (Sudamérica) | Valle, Costa | Día/noche | Trota; **colirrojo** |
| Zorro chilla | *Lycalopex griseus* | No | Valle, Playa | Crepúsculo | Más pequeño |
| Guanaco | *Lama guanicoe* | No | Precordillera/estepa | Día | Tropillas |
| Vicuña | *Vicugna vicugna* | No | Altiplano/precordillera | Día | Grupos, muy ágil |
| Chingue | *Conepatus chinga* | No | Valle | Noche | Lento, hocico al suelo |
| Monito del monte | *Dromiciops gliroides* | Sí (Chile/Arg) | Costa (colihue) | Noche | Diminuto, fósil viviente |
| Rana de Darwin | *Rhinoderma darwinii* | Sí (Chile/Arg) | Humedales, río | Día | Pequeña, estática |
| Choroy | *Enicognathus leptorhynchus* | **Sí (Chile)** | Bosque Costa | Día | Bandada ruidosa |
| Cachaña | *Enicognathus ferrugineus* | No (Patagonia) | Bosque | Día | Bandadas |
| Flamenco chileno | *Phoenicopterus chilensis* | No | Mar/lagunas costeras | Día | Filtra en el agua |
| Chungungo | *Lontra felina* | Sí (Chile/Perú) | Mar, roqueríos | Día | Nada, se asoma |
| Chinchilla de cola larga | *Chinchilla lanigera* | **Sí (Chile)** | Andes rocosos | Noche | Ágil en rocas |
| Pingüino de Humboldt | *Spheniscus humboldti* | No | Mar | Día | Nada, emerge |
| Guanaco/Yeco ya listados… | — | — | — | — | — |

> Los nombres y la condición de endemismo se revisarán; varios son "nativos" más que endémicos.
> Completar con estado de conservación (UICN) cuando se especifique.

## Modelo de datos de una especie

Cada entrada de `SPECIES` (`fauna.js`) declara: `movement` (`fly`/`walk`/`hop`), `active`
(franja horaria), `speed`/`range` (vaivén), `fps`, `anchor` (centro o pies), `palette`
(carácter → clave de `getPalette`) y `frames` (matrices de píxeles). Para documentar una
especie con detalle (UICN, nombre científico, referencia), usa
[`templates/especimen.md`](templates/especimen.md).

## Pendiente

- [x] Priorizar un primer set (cóndor, pudú, güiña, huemul) para la Fase 2.
- [x] Especies extra: puma, zorros, guanaco, vicuña, chingue, monito del monte, chinchilla,
      choroy, cachaña, flamenco, chungungo, pingüino de Humboldt.
- [x] Ajustar densidad y rareza por especie según estado UICN/nacional (ver [D-015](12-decisiones.md)).
- [ ] Rana de Darwin (*Rhinoderma darwinii*): humedales/río, estática.
- [ ] Decidir si el cóndor pasa a ser un "momento" destacado (vuelo largo ocasional).
- [ ] Completar cada especie con la plantilla [`templates/especimen.md`](templates/especimen.md)
      (estado UICN, nombre científico, referencia visual) y refinar los sprites.
