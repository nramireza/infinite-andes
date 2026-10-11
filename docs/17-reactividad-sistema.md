# 17 · Reactividad del sistema

> Estado: estable · Actualizado: 2026-10-11

Idea: que la **densidad de población** de la fauna (y, si aplica, el follaje del sotobosque) reaccione
a la **actividad real del equipo** —uso de CPU, RAM, temperatura o *load average*— de forma opcional.
El navegador no puede leer esos sensores por sí solo, así que se leen mediante un **puente local
opcional** ([D-052](12-decisiones.md)).

## Principio: no romper el determinismo

La base del paisaje sigue siendo **determinista por semilla**: la *identidad* de cada candidato y su
*posición* se deciden por hash de chunk (ver [09 · Arquitectura](09-arquitectura.md),
[D-010](12-decisiones.md), [D-011](12-decisiones.md)). La actividad **solo pondera la densidad**,
igual que la hora filtra la actividad de cada especie: nunca decide *qué* animal ni *dónde*.

- Sin el puente activo → el paisaje es idéntico al actual y los **snapshots dorados** no cambian.
- El multiplicador entra por el hook `faunaChanceAt` de `src/scene.js` (`src/scene.js:174`), el mismo
  camino que usa el desierto florido (`chance × (1 + 0.6·bloom)`), consumido en `src/fauna.js:707`.

## Puente local (implementado, v1.7.0)

Un proceso pequeño, **sin dependencias**, que expone un JSON en `localhost`:

```json
{ "cpu": 0.42, "ram": 0.71, "temp": 63, "load": 1.8 }
```

- `cpu`: uso global 0–1 · `ram`: fracción usada 0–1 · `temp`: °C del paquete/sensor · `load`: load average 1 min.
- Implementación de referencia (Linux): `node:os` (`loadavg`, `cpus`, `totalmem`/`freemem`) y
  `/sys/class/thermal/thermal_zone*/temp` para la temperatura.
- CORS habilitado solo para `localhost`, solo lectura.

## Consumo en el frontend

- **Switch en el panel** (casilla "Actividad del equipo"): **off por defecto**. Al apagarlo **no se
  hace ningún `fetch`** y el multiplicador vuelve a 1 ([D-055](12-decisiones.md)).
- Estado visible: en el panel (`off` · `sondeando…` · `act 1.42` · `sin puente`) y en el **HUD**
  (`act <m>` solo mientras está encendida).
- URL del puente: por defecto `http://localhost:8787/activity` (sobreescribible con
  `?activity=<url>`). La preferencia se guarda en `localStorage` (`infinite-andes:activity`);
  `?activity=` la enciende y `?activity=off` la apaga (la URL manda sobre la preferencia).
- El frontend hace *poll* cada N segundos; si el endpoint falla, **degrada a 1** (comportamiento
  normal) sin errores visibles.
- Mapeo implementado en `src/activity.js`: un **multiplicador global** acotado a `[0.5, 1.8]` a
  partir de `cpu` (+), `ram` (+), `temp` (− por encima de 55 °C) y `load` (−). La granularidad por
  gremio/especie queda como ampliación futura.

  | Señal | Efecto en el multiplicador global |
  |-------|-----------------------------------|
  | `cpu` alta | + (más actividad general) |
  | `ram` alta | + (más bandadas) |
  | Temperatura alta | − (menos actividad; el sesgo crepuscular/nocturno sigue por hora) |
  | `load` alto | − (menos especies esquivas) |

### Cómo verificarlo

1. `npm run activity` (puente) y `curl -s http://localhost:8787/activity`.
2. `npm start` y abrir `/?activity=1` (o marcar la casilla) con carga en el equipo.
3. El HUD debe mostrar `act <m>` subiendo con el uso de CPU.

> Nota: en la demo **HTTPS** (GitHub Pages) el navegador bloquea `http://localhost`
> (*contenido mixto* / Private Network Access), así que el monitoreo es **solo local**.

## Alternativas descartadas

| Alternativa | Por qué |
|-------------|---------|
| Solo señales del navegador | Aproximadas; no es la actividad real pedida. |
| APIs nativas de SO | Requieren runtime específico; el puente es agnóstico. |

## Criterios de aceptación

- [x] Apagada (default) el render y los dorados son idénticos a los actuales y no hay red.
- [x] Con el puente caído, el paisaje sigue funcionando (multiplicador 1).
- [x] La actividad no altera identidad ni posición, solo la densidad.
- [x] Hay un switch explícito y un indicador (`act`) de si está activa.

## Riesgos / dudas

- Protocolo: **JSON simple** por HTTP (`GET /activity`), puerto por defecto **8787** (`PORT=`).
- Mapeo señal→densidad: **multiplicador global** validado por tests (`test/activity.test.js`); el
  mapeo por gremio queda como ampliación.
- Privacidad: el modo es **opt-in** (switch / `?activity=`) y el puente solo lee `localhost` y
  expone CORS solo a orígenes locales.
- Plataforma: no funciona desde la demo HTTPS por bloqueo de contenido mixto; es **solo local**.

## Referencias

- [D-052](12-decisiones.md) · [D-055](12-decisiones.md) · [D-010](12-decisiones.md) ·
  [D-011](12-decisiones.md) · [09 · Arquitectura](09-arquitectura.md)
