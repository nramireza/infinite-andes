# AGENTS.md — Guía para asistentes (opencode)

Este archivo describe cómo trabajar en **Infinite Andes** de forma consistente.

## Qué es el proyecto

Paisaje procedural infinito de los Andes chilenos en **pixel art**, para el navegador.
Sin gameplay: exploración con scroll, ciclo día/noche, clima, ríos y especies endémicas.
Toda la documentación de diseño vive en [`docs/`](docs/README.md).

## Cómo ejecutar y verificar

No hay build, bundler ni dependencias. Son **módulos ES** que deben servirse por HTTP:

```bash
python3 -m http.server 8000   # o: npm start
# abrir http://localhost:8000
```

- **Tests** (sin dependencias): `npm test` usa `node --test` + `node:assert`. Cubre lógica pura,
  *smoke* de render con contexto 2D falso y **snapshots dorados** en `test/golden.json`.
  Regenerar dorados tras un cambio intencional: `UPDATE_GOLDEN=1 npm test`. Ver `test/README.md`.
- Sin linter configurado.
- Verificación de sintaxis de los módulos: `npm run check` (o `node --check src/<archivo>.js`).
- Paleta maestra: si tocas `src/palette.js`, regenera la tabla con `npm run palette`.
- Verificación visual: renderizar con Chrome headless y revisar el PNG:

```bash
google-chrome-stable --headless=new --disable-gpu --no-sandbox \
  --window-size=1280,720 --virtual-time-budget=2000 \
  --screenshot=/tmp/out.png "http://localhost:8000/?seed=andes&hour=12"
```

Parámetros de URL útiles: `seed`, `x` (posición; desactiva auto-scroll), `hour` (0–24),
`weather` (`clear|snow|rain|fog|wind`), `aspect` (`16:9|21:9|32:9` o decimal; por defecto `32:9`),
`season` (`auto|verano|otono|invierno|primavera`), `biome` (`auto|norte|centro|sur`),
`bloom` (`auto|on|off`), `moment` (`auto|none|18sep|leorey|kungleo`) y `ui` (`0` = kiosco).

- **Capturas versionadas**: `npm run shots` genera `screenshots/v<versión>-<hash|fecha>/` con la
  matriz de semillas/horas/climas, `manifest.json` y `contact-sheet.png`. La versión sale de
  `package.json`; si hay git, se añade el hash corto. Actualiza `CHANGELOG.md` y el índice
  `screenshots/README.md` se regenera solo.

## Convenciones de código

- **JS puro, módulos ES**, sin dependencias externas ni frameworks.
- **Sin comentarios innecesarios**; los que hay son en español y explican *por qué*, no *qué*.
- Idioma del código y comentarios: español (nombres coherentes con el dominio: `valle`, `costa`, `playa`, `mar`).
- **Determinismo ante todo**: nada de `Math.random()` para generar paisaje. Usar `mulberry32`/`hash1`
  de `src/rng.js`. El paisaje debe ser reproducible a partir de la semilla.
- **El terreno siempre se siembra**: al crear o regenerar la escena, llamar a `seedLayers(seed)`
  (`src/terrain.js`) antes de dibujar. Si no, todas las semillas dan el mismo paisaje.
- Render en un canvas interno de **altura 270 px** y ancho según la relación de aspecto
  (`src/viewport.js`; 32:9 → 960×270 por defecto). El escalado es por CSS con `image-rendering: pixelated`.
  Dibujar siempre en coordenadas enteras (`Math.round`/`fillRect`) para evitar bordes borrosos.
- Colores: no escribir hex "a mano" en el dibujo del terreno/cielo; usar las claves de `getPalette(hour, weather, strength)`
  (`src/palette.js`) para que respondan a hora y clima.

## Arquitectura (resumen)

Pipeline por fotograma en `src/scene.js`: `sky` → capas de `terrain` (con `flora` por capa) → clima.
El orden y los detalles están en [`docs/09-arquitectura.md`](docs/09-arquitectura.md).

`src/terrain.js` es el corazón: define `LAYERS` (parallax, baseY, amp, freq, seed, nieve, volcanes, ríos)
y las funciones `ridgeHeight`, `bankHeight`, `riverInfluence`, `drawLayer`, `drawSea`.

## Al cambiar el diseño

1. Actualiza el doc correspondiente en `docs/`.
2. Registra la decisión en [`docs/12-decisiones.md`](docs/12-decisiones.md).
3. Añade una entrada en [`CHANGELOG.md`](CHANGELOG.md).
4. Publica los cambios en GitHub (ver [Publicación en GitHub](#publicación-en-github)).

## Publicación en GitHub

El repositorio es `origin` (`git@github.com:nramireza/infinite-andes.git`), rama `main`, que también
sirve la demo por **GitHub Pages** (`.github/workflows/pages.yml`).

**Toda modificación grande de código debe quedar publicada en el repositorio**: no basta con dejar
los cambios en local. Al terminar una tanda:

1. Verifica: `npm run check` y `npm test` (regenera dorados con `UPDATE_GOLDEN=1 npm test` si el
   cambio es intencional). Si algo falla, no se publica.
2. Actualiza docs, `docs/12-decisiones.md`, `CHANGELOG.md` y sube la versión en `package.json`.
3. Haz **dos commits**, siguiendo la convención del historial:
   - Código y docs: `Infinite Andes vX.Y.Z: <resumen>`.
   - Capturas: `Capturas vX.Y.Z (<resumen>)`.
4. Genera las capturas **después** del commit de código, para que la carpeta use su hash:
   `npm run shots` → `screenshots/vX.Y.Z-<hash>/` (y regenera `screenshots/README.md`).
5. Sube: `git push origin main`.

Nunca se publican cambios a medias o sin verificar; tampoco secretos ni credenciales.

## Plantillas

Para nuevas especies o features, copia `docs/templates/especimen.md`, `feature.md` o `decision.md`.

## Alcance / no-objetivos

- **No hay gameplay** (sin puntaje, niveles ni personaje jugable).
- No romper el determinismo ni la pixelación nítida.
- Los ríos están en revisión (ver [`docs/07-rios.md`](docs/07-rios.md)); documenta cambios ahí.
