# Infinite Andes

Paisaje procedural infinito de los Andes chilenos en **pixel art**, para el navegador.
Explorable, sin gameplay: se recorre horizontalmente una cordillera generada con ruido,
con ciclo día/noche, clima dinámico, ríos, volcanes y especies endémicas de flora y fauna.

Inspirado en [{Shan, Shui}\*](https://github.com/LingDong-/shan-shui-inf) de Lingdong Huang,
pero con la geografía, la paleta y las especies de Chile.

> **Estado:** en desarrollo · **Versión:** 0.4.0 · **Licencia:** MIT

**Demo en vivo:** https://nramireza.github.io/infinite-andes/

---

## Cómo ejecutarlo

El proyecto usa **módulos ES** (sin build, sin dependencias), así que necesita servirse por HTTP
(no funciona abriendo `file://` directamente):

```bash
cd infinite-andes
python3 -m http.server 8000
# abrir http://localhost:8000
```

o con el script de npm:

```bash
npm start
```

### Parámetros de URL

| Parámetro | Ejemplo | Descripción |
|-----------|---------|-------------|
| `seed`    | `?seed=pewen` | Semilla del paisaje (texto o número) |
| `hour`    | `?hour=6.7`   | Hora del día (0–24); desactiva el paso del tiempo |
| `weather` | `?weather=snow` | Clima fijo: `clear`, `snow`, `rain`, `fog`, `wind` |
| `aspect`  | `?aspect=21:9` | Relación de aspecto: `16:9`, `21:9`, `32:9` (def.) o decimal (`2.4`) |
| `moment`  | `?moment=kungleo` | Momento raro: `auto`, `none`, `18sep`, `leorey`, `kungleo` |
| `ui`      | `?ui=0`       | Oculta el panel (modo kiosco) |

Ejemplos: `?seed=pewen&hour=12` (río en el valle) · `?seed=andes&hour=6.7` (amanecer naranjo) ·
`?aspect=32:9&moment=leorey`.

---

## Capturas versionadas

Genera una tanda de capturas (Chrome headless) guardada por versión, para tener un track visual:

```bash
npm run shots   # -> screenshots/v<versión>-<hash|fecha>/
```

Cada carpeta incluye la matriz de semillas/horas/climas, un `manifest.json` con metadatos y una
`contact-sheet.png` con todas juntas. El índice está en [`screenshots/README.md`](screenshots/README.md).

---

## Controles

Panel superior izquierdo (se oculta con el botón `∞`):

- **Semilla**: escribir/número y `↻` para una nueva.
- **Recorrer**: `◀` `▶`, auto-scroll y velocidad.
- **Relación**: 16:9, 21:9, 32:9 o personalizada (por defecto 32:9).
- **Hora**: deslizador + paso del tiempo automático.
- **Clima**: automático o forzado a uno de los cinco.
- **Momento**: raro automático o forzado (18 de septiembre, Leo Rey, Kung Leo).
- **Exportar PNG**: descarga la vista actual. **Copiar enlace**: comparte la vista.
- **HUD**: semilla, posición, hora y clima.

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
│   ├── viewport.js       # altura fija + relación de aspecto
│   ├── palette.js        # paletas día/noche/estaciones + clima
│   ├── sky.js            # gradiente, astros, estrellas, Vía Láctea, aurora, nubes
│   ├── weather.js        # partículas (nieve/lluvia/viento) y niebla
│   ├── terrain.js        # capas de montaña, nieve, rocas, playa, mar, ríos
│   ├── flora.js          # araucaria, lenga, cultivos, arbustos, rocas
│   ├── fauna.js          # especies endémicas (sprites + spawn)
│   ├── moments.js        # momentos raros (18-sep, Leo Rey, Kung Leo)
│   ├── scene.js          # composición, cámara/parallax, día/noche, export
│   ├── ui.js             # controles enlazados a la escena
│   └── main.js           # arranque y loop
├── test/                 # tests sin dependencias (npm test; ver test/README.md)
├── scripts/capture.sh    # capturas versionadas (npm run shots)
├── screenshots/          # capturas por versión (ver screenshots/README.md)
└── docs/                 # documentación del proyecto (ver docs/README.md)
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

→ Índice y convenciones completas en [docs/README.md](docs/README.md).
