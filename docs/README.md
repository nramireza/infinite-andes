# Documentación — Infinite Andes

Índice y convenciones de la documentación del proyecto.

## Índice

| # | Documento | Contenido |
|---|-----------|-----------|
| 00 | [Visión](00-vision.md) | Qué es, inspiración, objetivos y no-objetivos |
| 01 | [Experiencia](01-experiencia.md) | Exploración sin gameplay, recorrido y controles |
| 02 | [Mundo](02-mundo.md) | Geografía, 6 capas, parallax, biomas, escala |
| 03 | [Cielo y astros](03-cielo-astros.md) | Día/noche, sol y luna, aurora, estrellas, nubes |
| 04 | [Clima](04-clima.md) | Estados, transiciones, duración, intensidad |
| 05 | [Flora](05-flora.md) | Especies vegetales y su especificación |
| 06 | [Fauna](06-fauna.md) | Especies endémicas, comportamiento y sprites |
| 07 | [Ríos](07-rios.md) | Diseño e integración de los ríos (estable) |
| 08 | [Arte pixel](08-arte-pixel.md) | Resolución, paleta, sprites, animación |
| 09 | [Arquitectura](09-arquitectura.md) | Módulos, pipeline de render, determinismo |
| 10 | [UI y exportación](10-ui-y-export.md) | Panel, export PNG, URLs |
| 11 | [Roadmap](11-roadmap.md) | Fases y pendientes |
| 12 | [Decisiones](12-decisiones.md) | Registro de decisiones (ADR ligera) |
| 13 | [Glosario](13-glosario.md) | Términos técnicos y especies |
| 14 | [Paleta maestra](14-paleta-maestra.md) | Tabla de colores por hora (generada con `npm run palette`) |
| 15 | [Estaciones](15-estaciones.md) | Ciclo estacional, tinte, nieve y clima |

Plantillas en [`templates/`](templates/). Fichas de flora y fauna en [`especies/`](especies/) (generadas con `npm run species`).

## Convenciones

- Cada documento empieza con una cita de metadatos:

  ```markdown
  > Estado: borrador · Actualizado: 2026-10-08
  ```

  - **Estado**: `borrador` (se está escribiendo) · `en progreso` (parcial) · `estable` (consolidado).
- Títulos en español, frases concisas, tablas para datos repetibles.
- Los **placeholders** se marcan con `TODO:` en una lista.
- Las especies se documentan con nombre común, nombre científico y si son endémicas de Chile.
- Las decisiones se registran en `12-decisiones.md` (una entrada por decisión, usando `templates/decision.md`).
- Referencias al código con la ruta (`src/terrain.js`) y, cuando aporte, `archivo.js:línea`.

## Cómo contribuir a la documentación

1. Elige el doc correspondiente (o crea uno nuevo numerado si es un tema nuevo).
2. Usa la plantilla adecuada de `templates/` para especímenes, features o decisiones.
3. Actualiza el índice de este archivo y el de [`../README.md`](../README.md).
4. Añade una línea en [`../CHANGELOG.md`](../CHANGELOG.md).
