# Infinite Andes

Paisaje procedural infinito de los Andes chilenos en **pixel art**, para el navegador.
Explorable, sin gameplay: se recorre horizontalmente una cordillera generada con ruido,
con ciclo día/noche, clima dinámico, ríos, volcanes y especies endémicas de flora y fauna.
Pensado para funcionar como **fondo de pantalla vivo** (solo imagen, sin audio).

Inspirado en [{Shan, Shui}\*](https://github.com/LingDong-/shan-shui-inf) de Lingdong Huang,
pero con la geografía, la paleta y las especies de Chile.

> **Estado:** estable (v1.3) · **Versión:** 1.3.0 · **Licencia:** MIT

**Demo en vivo:** https://nramireza.github.io/infinite-andes/

---

## Cómo ejecutarlo

El proyecto usa **módulos ES** (sin build, sin dependencias), así que necesita servirse por HTTP
(no funciona abriendo `file://` directamente):

```bash
cd infinite-andes
npm start          # servidor Node sin caché (recomendado al editar)
# abrir http://localhost:8000
```

Alternativa con Python (ojo: cachea; recarga con `Ctrl+Shift+R` al editar):

```bash
npm run start:python
```

### Parámetros de URL

| Parámetro | Ejemplo | Descripción |
|-----------|---------|-------------|
| `seed`    | `?seed=pewen` | Semilla del paisaje (texto o número) |
| `hour`    | `?hour=6.7`   | Hora del día (0–24); desactiva el paso del tiempo |
| `weather` | `?weather=storm` | Clima fijo: `clear`, `snow`, `rain`, `fog`, `wind`, `storm` |
| `season`  | `?season=otono` | Estación: `auto` (ciclo), `verano`, `otono`, `invierno`, `primavera` |
| `aspect`  | `?aspect=21:9` | Relación de aspecto: `16:9`, `21:9`, `32:9` (def.) o decimal (`2.4`) |
| `moment`  | `?moment=condor` | Momento raro: `auto`, `none`, `18sep`, `leorey`, `kungleo`, `condor`, `bandada`, `manada` |
| `biome`   | `?biome=austral` | Región: `auto` (procedural), `altiplano`, `norte` (árido), `centro`, `sur` (boscoso), `patagonia`, `austral` (fiordos) |
| `bloom`   | `?bloom=on`   | Desierto florido (norte): `auto`, `on`, `off` |
| `clock`   | `?clock=fast` | Reloj: `real` (def., hora/estación y sol de Chile) o `fast` (ciclo) |
| `lat`     | `?lat=-53`    | Latitud para el cálculo solar (por defecto −33.45, Santiago) |
| `ui`      | `?ui=0`       | Oculta el panel, HUD y cursor (modo kiosco/fondo de pantalla) |
| `fit`     | `?fit=contain` | Ajuste a pantalla: `cover` (def., llena) o `contain` (encaja entero) |
| `fps`     | `?fps=60`     | Límite de fotogramas (def. `30`; `0` = sin límite) |
| `perf`    | `?perf=1`     | Overlay con ms/frame y fps objetivo |

Ejemplos: `?seed=pewen&hour=12` (río en el valle) · `?seed=andes&hour=6.7` (amanecer naranjo) ·
`?aspect=32:9&moment=leorey` · `?biome=norte&bloom=on` (desierto florido) ·
`?biome=austral&season=invierno` (fiordos nevados) · `?moment=condor` (vuelo de cóndor) ·
`?ui=0&fit=cover` (fondo de pantalla a pantalla completa) · `?clock=fast` (ciclo día/noche rápido).

Por defecto la pantalla sigue el **reloj real**: hora local, estación del hemisferio sur, el
amanecer/atardecer de Chile y la **fase de la luna**, así lo que se ve coincide con el momento y la
época del lugar.

---

## Capturas versionadas

Genera una tanda de capturas (Chrome headless) guardada por versión, para tener un track visual:

```bash
npm run shots   # -> screenshots/v<versión>-<hash|fecha>/
```

Cada carpeta incluye la matriz de semillas/horas/climas, un `manifest.json` con metadatos y una
`contact-sheet.png` con todas juntas. El índice está en [`screenshots/README.md`](screenshots/README.md).

---

## Rendimiento

El paisaje está pensado para quedar encendido como fondo: memoiza el terreno/bioma/paleta por píxel
de mundo y baja a 8 fps en reposo, además de pausarse al ocultar la pestaña o perder foco
([D-026](docs/12-decisiones.md), [D-028](docs/12-decisiones.md)). Para medir:

```bash
npm run bench           # rendimiento de render()/update() por capa (Node, sin navegador)
```

o añade `?perf=1` a la URL para un overlay con ms/frame y fps.

---

## Controles

Panel superior izquierdo (se oculta con el botón `∞`):

- **Semilla**: escribir/número y `↻` para una nueva.
- **Recorrer**: `◀` `▶`, auto-scroll y velocidad.
- **Relación**: 16:9, 21:9, 32:9 o personalizada (por defecto 32:9).
- **Hora**: deslizador + paso del tiempo automático.
- **Reloj**: real (hora local, estación y sol de Chile) o ciclo rápido.
- **Clima**: automático o forzado a uno de los seis (despejado, nieve, lluvia, niebla, viento,
  tormenta).
- **Estación**: automática (ciclo de ~8 min) o fija (verano, otoño, invierno, primavera).
- **Momento**: raro automático o forzado (18 de septiembre, Leo Rey, Kung Leo, vuelo de cóndor,
  bandada, manada).
- **Región**: procedural (automático), Altiplano, Norte árido, Centro, Sur boscoso, Patagonia
  esteparia o Austral (fiordos).
- **Floración**: desierto florido automático, forzado o desactivado (solo en el norte).
- **Exportar PNG**: descarga la vista actual. **Tira**: descarga 8 pantallas seguidas.
  **Copiar enlace**: comparte la vista.
- **HUD**: semilla, posición, hora y clima.

Atajos de teclado: `Espacio` pausa/reanuda el auto-scroll · `←`/`→` desplazan · `H`/`P` muestran el
panel · `F` pantalla completa (en kiosco también con clic). Para dejarlo como fondo, abrir con
`?ui=0&fit=cover`: sin panel ni cursor, llena la pantalla y limita a 30 fps (se pausa al ocultar la
pestaña). Ver [D-026](docs/12-decisiones.md).

---

## Estructura del proyecto

```
infinite-andes/
├── index.html            # shell + canvas + panel de control
├── style.css             # estilos del panel y del canvas pixelado
├── package.json          # metadata y script de arranque
├── src/
│   ├── rng.js            # PRNG sembrado + hashing por chunk
│   ├── noise.js          # ruido de valor 1D + fBm + ridged
│   ├── pixel.js          # utilidades de dibujo pixel-art (sprites, discos)
│   ├── loop.js           # control de fotogramas (FPS, delta) puro
│   ├── clock.js          # hora local, estación y fase lunar reales (hemisferio sur)
│   ├── sun.js            # amanecer/atardecer y reasignación solar pura
│   ├── viewport.js       # altura fija + relación de aspecto
│   ├── palette.js        # paletas día/noche/estaciones + clima
│   ├── sky.js            # gradiente, astros (luna con fases), estrellas, Vía Láctea, aurora, nubes
│   ├── weather.js        # partículas, niebla, crossfade de clima y relámpagos
│   ├── terrain.js        # capas de montaña, nieve, rocas, playa, mar, ríos
│   ├── flora.js          # araucaria, lenga, cultivos, arbustos, quillay, mañío, rocas
│   ├── fauna.js          # especies endémicas (sprites + spawn)
│   ├── moments.js        # momentos raros (18-sep, Leo Rey, Kung Leo, cóndor, bandada, manada)
│   ├── biomes.js         # biomas (altiplano…patagonia) y desierto florido
│   ├── seasons.js        # ciclo estacional (tinte, nieve, clima)
│   ├── views.js          # serialización del estado (enlaces y favoritos)
│   ├── scene.js          # composición, cámara/parallax, día/noche, export
│   ├── ui.js             # controles enlazados a la escena
│   └── main.js           # arranque y loop
├── test/                 # tests sin dependencias (npm test; ver test/README.md)
├── scripts/serve.mjs     # servidor de desarrollo sin caché (npm start)
├── scripts/capture.sh    # capturas versionadas (npm run shots)
├── scripts/bench.mjs     # benchmark de render/update (npm run bench)
├── scripts/species.mjs   # fichas y tablas de especies (npm run species)
├── screenshots/          # capturas por versión (ver screenshots/README.md)
└── docs/                 # documentación del proyecto (ver docs/README.md; fichas en docs/especies/)
```

---

## Índice de documentación

- [Visión](docs/00-vision.md)
- [Experiencia](docs/01-experiencia.md)
- [Mundo y geografía](docs/02-mundo.md)
- [Cielo y astros](docs/03-cielo-astros.md)
- [Clima](docs/04-clima.md)
- [Flora](docs/05-flora.md)
- [Fauna](docs/06-fauna.md)
- [Ríos](docs/07-rios.md)
- [Arte pixel](docs/08-arte-pixel.md)
- [Arquitectura](docs/09-arquitectura.md)
- [UI y exportación](docs/10-ui-y-export.md)
- [Roadmap](docs/11-roadmap.md)
- [Decisiones](docs/12-decisiones.md)
- [Glosario](docs/13-glosario.md)
- [Paleta maestra](docs/14-paleta-maestra.md)
- [Estaciones](docs/15-estaciones.md)
- [Fichas de especies](docs/especies/README.md)

→ Índice y convenciones completas en [docs/README.md](docs/README.md).
