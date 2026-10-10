# 01 · Experiencia

> Estado: estable · Actualizado: 2026-10-10

## Concepto

El paisaje se recorre **sin objetivo**: se contempla y se explora. El usuario decide el ritmo —
parar cuando una composición le gusta, o dejar que el paisaje se desplace solo.

## Formas de recorrerlo

- **Manual**: botones `◀` `▶` (desplazamiento por saltos).
- **Auto-scroll**: desplazamiento continuo a velocidad ajustable.
- **Cambio de paisaje**: nueva semilla genera otro mundo.
- **Parámetros de URL**: compartir una vista exacta (semilla + hora + clima).

## Qué se puede observar

- Amanecer naranjo con el sol detrás de la cordillera.
- Mediodía con el sol fuera de pantalla (pasa por encima).
- Atardecer cálido sin sol visible (queda tras la cámara).
- Noche con estrellas y aurora austral.
- Clima cambiando solo: despejado, nieve, lluvia, niebla, viento y tormenta.
- Ríos que bajan por el valle y un portezuelo en la cordillera de la Costa.
- Volcanes con penacho en los Andes.

## Controles (panel superior izquierdo)

| Control | Función |
|---------|---------|
| Semilla + `↻` | Elegir/escribir una semilla o generar una nueva |
| `◀` `▶` | Desplazar el paisaje |
| auto + velocidad | Auto-scroll y su rapidez |
| Relación | 16:9, 21:9, 32:9 o personalizada |
| Hora | Deslizador de hora del día (0–24) |
| paso del tiempo | Activar/desactivar el avance automático de la hora |
| Reloj | Real (hora, estación y sol de Chile) o ciclo rápido |
| Clima | Automático o forzado (despejado, nieve, lluvia, niebla, viento, tormenta) |
| Estación | Automática (ciclo) o fija (verano, otoño, invierno, primavera) |
| Momento | Raro automático o forzado (18-sep, Leo Rey, Kung Leo, cóndor, bandada, manada) |
| Región | Procedural, altiplano, norte, centro, sur, Patagonia o Austral (fiordos) |
| Floración | Desierto florido automático, forzado o desactivado |
| Vistas | Guardar/cargar/eliminar vistas favoritas |
| Exportar PNG | Descargar la vista actual |
| Exportar tira | Descargar 8 pantallas seguidas (PNG) |
| Copiar enlace | Copiar la URL con la vista actual |
| HUD | Semilla, posición, hora, clima, estación y región |

El panel se oculta con el botón `∞`.

## Principios de sensación

- **Tranquilidad**: ritmos lentos, sin urgencia ni interrupciones.
- **Legibilidad**: las capas deben leerse como geografía, no como manchas.
- **Vida sutil**: el movimiento (agua, clima, penachos, pasto) evita que se sienta estático.
- **Coherencia**: hora y clima afectan todo (cielo, montañas, mar, agua, flora).
- **Sincronía con Chile**: por defecto la hora, la estación y el amanecer/atardecer siguen la
  realidad ([D-027](12-decisiones.md)); con `?clock=fast` vuelve el ciclo rápido de demostración.

## Pendiente

- [x] "Momentos" raros como pequeños eventos ([D-014](12-decisiones.md), v0.4.0).
- [x] Biomas/regiones como anclas visuales ([D-016](12-decisiones.md), v0.6.0).
