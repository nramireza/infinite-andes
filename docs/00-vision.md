# 00 · Visión

> Estado: estable · Actualizado: 2026-10-08

## Qué es

**Infinite Andes** es un paisaje procedural infinito de los Andes chilenos, renderizado en
**pixel art** en el navegador. Se recorre horizontalmente sin principio ni fin: una cordillera
generada por ruido, con ciclo día/noche, clima dinámico, ríos, volcanes y especies endémicas.

No es un juego: es una **pieza generativa explorable**, como una pintura continua que se despliega.
Su destino natural es funcionar como **fondo de pantalla vivo**: solo imagen, dejada correr en la
pantalla sin interacción ([D-025](12-decisiones.md), [D-026](12-decisiones.md)).

## Inspiración

- [{Shan, Shui}\*](https://github.com/LingDong-/shan-shui-inf) de Lingdong Huang: paisaje chino
  procedural infinito. Infinite Andes toma de ahí la idea del *scroll* infinito generado por ruido
  y la composición en capas, pero con geografía, paleta y especies chilenas, y en pixel art.
- Los grabados y pinturas de paisaje andino y la tradición del naturalismo chileno (fauna/flora endémica).

## Objetivos

- Representar un **perfil oeste→este** de Chile central, del mar a los Andes, con sus bandas reales:
  Mar · Playa · Cordillera de la Costa · Valle central · Precordillera · Cordillera de los Andes.
- Que todo sea **determinista por semilla**: la misma semilla reproduce exactamente el mismo paisaje.
- Estética **pixel art** nítida, con paleta que responde a la hora y al clima.
- Integrar **especies endémicas** de Chile (flora y, en fases siguientes, fauna animada).
- Que se sienta vivo y tranquilo: día/noche, clima, agua y viento.
- Que se coordine con la **realidad de Chile**: por defecto sigue la hora local y la estación del
  año, con el amanecer/atardecer reales ([D-027](12-decisiones.md)).

## No-objetivos

- Gameplay, puntaje, niveles, colisiones o personaje jugable.
- **Audio**: es una pieza puramente visual (sin sonido), pensada como fondo de pantalla vivo.
- Realismo fotográfico o 3D. La estética es pixel art deliberada.
- Dependencias pesadas, frameworks o build step. Se mantiene JS puro y ligero.
- Precisión cartográfica: es una interpretación artística del paisaje, no un mapa.

## Público

Personas que disfrutan de arte generativo, pixel art y paisajes; sin necesidad de instrucciones.

## Preguntas abiertas

- TODO: ¿se quiere exportar también una "tira larga" del paisaje, no solo la vista actual? (opcional)
- [x] ¿Habrá audio ambiente? **No**: pieza solo visual para fondo de pantalla ([D-025](12-decisiones.md)).
- [x] Biomas/regiones seleccionables o procedurales ([D-016](12-decisiones.md), v0.6.0).
