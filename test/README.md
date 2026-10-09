# Tests

Sin dependencias externas: usan `node:test` y `node:assert` (Node 18+).

```bash
npm test          # corre toda la suite
npm run check     # verifica sintaxis de src/*.js
```

## Qué se cubre

| Archivo | Contenido |
|---------|-----------|
| `rng.test.js` | PRNG y hashes deterministas |
| `noise.test.js` | ruido de valor, fBm y ridged |
| `viewport.test.js` | relación de aspecto y derivación del ancho |
| `palette.test.js` | interpolación de color y clima |
| `weather.test.js` | crossfade de clima, viento que inclina la lluvia, tormenta y relámpagos |
| `terrain.test.js` | alturas, muesca del río y semillas |
| `spawn.test.js` | spawn por capa con parallax: ríos y flora |
| `fauna.test.js` | fauna: actividad, determinismo, parallax, cauce, mar, huillín y validez de sprites |
| `sky.test.js` | determinismo del cielo, Vía Láctea y estrellas fugaces |
| `sky-order.test.js` | orden de render del cielo (astro/nubes/terreno) |
| `moments.test.js` | momentos raros: determinismo y dibujo |
| `biomes.test.js` | biomas: pesos, floración del norte, pools ponderados y tinte |
| `seasons.test.js` | estaciones: ciclo, línea de nieve, sesgo de clima y tinte |
| `views.test.js` | vistas: serialización URL/estado, favoritos (alta/baja/parseo) |
| `render.test.js` | *smoke* de dibujo con `helpers/fakeCtx.js` (reflejo del astro, flora estacional) |
| `golden.test.js` | snapshots dorados (terreno, ríos, flora, fauna, paleta) |

## Snapshots dorados

`test/golden.json` guarda *digests* de resultados conocidos. Si un cambio de comportamiento es
**intencional**, regenéralos y revisa el diff:

```bash
UPDATE_GOLDEN=1 npm test
```

Si falla un dorado sin haber cambiado nada a propósito, es una regresión: no lo regeneres.

## Helpers

- `helpers/fakeCtx.js`: contexto 2D que registra `fillRect`/`ellipse` para testear render sin canvas.
- `helpers/golden.js`: `digest(values)` (hash estable) y `golden(t, name, value)`.

El arnés de spawn por chunk (`spawn.test.js`) se reutiliza para la fauna (`fauna.test.js`).
