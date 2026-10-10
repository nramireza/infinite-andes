# 08 · Arte pixel

> Estado: estable · Actualizado: 2026-10-10

## Resolución y escalado

- **Altura interna fija: 270 px.** El ancho sale de la **relación de aspecto**
  (`W = round(270 · ratio)`): 16:9 → 480, 21:9 → 630 y **32:9 → 960 (por defecto)**.
  Constantes y utilidades en `src/viewport.js`.
- La relación se elige en el panel (**Relación**) o con `?aspect=` (p. ej. `?aspect=21:9`
  o `?aspect=2.4`). El canvas se redimensiona en caliente (`Scene.resize`).
- Se dibuja siempre en ese espacio de baja resolución y se escala con CSS:
  `image-rendering: pixelated` + `imageSmoothingEnabled = false`.
- El escalado (`src/main.js`, `fit()`) usa un factor **entero** cuando es posible (nítido) y
  centra el canvas; con relaciones muy anchas puede quedar en 1×.
- Todo el dibujo es con coordenadas enteras y `fillRect` de 1 px para evitar bordes borrosos.

## Paleta

- Centralizada en `src/palette.js` como **claves por franja horaria** (medianoche, pre-alba,
  amanecer, mañana, mediodía, tarde, atardecer, anochecer) interpoladas por hora.
- La **tabla completa por hora** está en [14 · Paleta maestra](14-paleta-maestra.md), generada
  con `npm run palette`.
- Campos de la paleta: cielo (`skyTop/skyMid/skyHorizon`), astros (`sun/sunGlow/star`), nubes,
  montañas (`farL/farD`, `midL/midD`, `nearL/nearD`), valle (`valleyL/valleyD`), costa
  (`costaL/costaD`), arena (`sand/sandD`), mar (`sea/seaD/seaHi`), nieve (`snow/snowD`), agua,
  flora (`floraL/floraD`), tronco, roca (`rock/rockD`) y niebla (`fog`).
- El clima modifica la paleta con `applyWeather` (mezcla hacia tonos del clima según intensidad).
- **Regla**: no usar hex "a mano" en el dibujo; siempre leer de `getPalette(hour, weather, strength)`.

## Capas de color y perspectiva atmosférica

- Las capas lejanas usan tonos más azulados/desaturados (`alpha` < 1) para dar profundidad.
- La nieve se superpone en las cumbres según `snowFrac`.
- Las vetas de roca se dibujan mezcladas hacia el tono de la capa para no "saltar".

## Dithering y textura

- Utilidades en `src/pixel.js`: `bakeSprite`, `drawSprite`, `disc`, `rect`, `px`, `radixDither`.
- Texturas sutiles: vetas de roca, franjas de campos, línea de marea, dither por hash.

## Sprites

- Los sprites son **matrices de píxeles en código** (filas de caracteres + mapa de paleta).
  `bakeSprite`/`drawSprite` (`pixel.js`) hornean a un canvas offscreen para futuros casos.
- La flora es **procedural** (formas por bucles) en `flora.js`; cada `DRAWERS` dibuja el hábito real
  de la planta (copa de paraguas de la araucaria, frondas de la palma, candelabro del copao, roseta
  de la nalca…) y el borde de las copas usa `hash1` para una silueta irregular determinista
  ([D-046](12-decisiones.md), [D-048](12-decisiones.md)). La fauna (`fauna.js`) usa matrices
  de caracteres dibujadas con `px`/`fillRect`, mapeando cada carácter a una clave de `getPalette`
  (responde a hora y clima) o a un hex literal (p. ej. el flamenco o el pingüino). Ver
  [D-010](12-decisiones.md).
- Los **momentos** (`src/moments.js`: Leo Rey, Kung Leo) usan el mismo enfoque de matriz y una
  **fuente 3×5** propia (`drawText`) para el destello "MORTAL KUMBIA".

### Guía de estilo para sprites nuevos

- **Silueta primero:** la forma debe leerse como la especie real (cuello, patas, cola, pico o
  cuernos) antes que el color. Un buen contorno en 1 px pesa más que un tono extra.
- **Tamaño por especie:** cada sprite se dimensiona a escala relativa: la fauna con su matriz
  (ver [06 · Fauna](06-fauna.md); camélidos y aves grandes 14–20 px, pequeños 6–7 px) y la flora con
  un **multiplicador `height`** sobre el rango de la capa (ver [05 · Flora](05-flora.md);
  araucaria/alerce ×1.9, pasto ×0.5). Los personajes de momento, ~9×12 px.
- **Anclaje** (`anchor`): `ground` (los pies tocan `bankHeight`) o `center` (voladores, centrado
  en la trayectoria). Al añadir una especie, elige el correcto o "flotará".
- **Contorno:** 1 px de un tono oscuro (sombra del cuerpo) para despegarlo del fondo.
- **Luz:** un tono claro en el lomo/pecho; evita más de 3–4 tonos por sprite.
- **Paleta:** cada carácter debe existir en `palette` (clave de `getPalette` o `#hex`). Los tests
  verifican que no haya caracteres sin mapear.
- **Frames:** 2 bastan para caminar/aletear; el vaivén lateral es senoidal sobre `tSec`
  (determinista, sin `Math.random()`).

## Animación

- Animaciones por funciones del tiempo (`tSec`): oleaje del mar, brillo del agua, bamboleo de la
  flora, penachos de volcán, parpadeo de estrellas, partículas de clima.
- Los animales usan **frames discretos** (2) con *frame rate* fijo por especie; el cóndor alterna
  el aleteo. El vaivén lateral es senoidal sobre `tSec` (determinista, sin `Math.random()`).

## Pendiente

- [x] **Dithering ordenado manual en sprites: sí** ([D-033](12-decisiones.md)). Se admite alternar
  caracteres en damero dentro de la matriz para degradados sutiles (p. ej. las plumas del cóndor);
  `radixDither` automático en sprites queda descartado.
- [x] **Sprites de fauna refinados** (v0.16.0): cóndor, huemul, pudú, güiña, puma, flamenco,
  pingüino y chungungo ganaron detalle (ojos/pico, vientre claro, cola) y dithering manual
  ([D-033](12-decisiones.md)).
- [x] **Sprites restantes refinados** (v1.2.0): zorros, camélidos, chingue, monito, chinchilla,
  loros, choique, chucao, huillín y rana ([D-044](12-decisiones.md)); cada especie tiene su ficha en
  [`especies/`](especies/README.md).
- [x] **Silueta y proporción de la fauna** revisadas (v1.4.0): matrices redimensionadas a **escala
  relativa por especie** y formas más fieles (cuello, patas, cola, pico), con `palette` ampliada
  donde aporta volumen ([D-047](12-decisiones.md)).
- [x] **Silueta y hábito de la flora** revisados (v1.5.0): `DRAWERS` redibujados con el porte real
  (copa de araucaria, frondas de palma, candelabro del copao, roseta de nalca, nudos del colihue,
  copas irregulares de Nothofagus) sin cambiar las `size` por capa ([D-048](12-decisiones.md)).
- [x] **Altura relativa de la flora** (v1.6.0): cada especie multiplica el rango de su capa por un
  `height` (araucaria/alerce ×1.9, pasto ×0.5) con su altura real (`heightM`) documentada
  ([D-049](12-decisiones.md)).
