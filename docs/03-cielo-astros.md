# 03 · Cielo y astros

> Estado: estable · Actualizado: 2026-10-08

Implementado en `src/sky.js` y la paleta en `src/palette.js`.

## Gradiente del cielo

Gradiente vertical de tres tonos que cambia con la hora: `skyTop` → `skyMid` → `skyHorizon`.
El horizonte visual está a `H * 0.56` (~151 px). Los colores salen de las claves de `palette.js`
interpoladas por hora del día.

## Orden del cielo

De atrás hacia adelante: **gradiente → Vía Láctea → estrellas → aurora → resplandor → sol/luna →
nubes → capas de terreno → clima**. Las nubes se pintan **después del astro** (lo tapan) y **antes
del terreno** (las montañas tapan a las nubes).

## Astros

El sol y la luna **nacen tras los Andes** (fondo), **salen de pantalla** a mediodía/medianoche,
y en el ocaso quedan **tras la cámara** (no se dibujan). Constantes en `src/sky.js`:

- `RISE = 6.5`, `SET = 18.5` (ventana del sol; la noche es el resto).
- `BACK_HORIZON = 118` (horizonte tras los Andes) y `FRONT_HORIZON = 212` (línea del mar).
- Avance `u` de 0 (salida) a 1 (puesta); la altura es `y = horizonte − A·sin(u·π)` con `A = 245`,
  de modo que a `u ≈ 0.5` el astro está muy por encima de la pantalla.
- El cuerpo se dibuja **al fondo** (`sky.drawBody`), justo tras el resplandor y **antes de las
  nubes**: el terreno lo oculta al alba y las nubes pueden taparlo. Ver [D-006 y D-009](12-decisiones.md).
- **Solo se dibuja al salir** (`u < 0.5`): al ocaso no hay disco solar ni lunar visible
  (queda tácitamente tras la cámara).

### Resplandor

`drawGlow` pinta un resplandor cálido/frío cuando el astro está cerca del horizonte, pero **solo
al salir**. Al amanecer produce el efecto de sol detrás de la cordillera (backlight).

## Estrellas

Campo de ~110 estrellas deterministas por semilla, visibles con `nightAmount > 0.02`,
con parpadeo suave. Aparecen al caer la noche y se apagan al amanecer.

## Vía Láctea

`drawMilkyWay` pinta una **banda de polvo estelar inclinada** (de abajo-izquierda a
arriba-derecha) determinista por semilla, visible con `nightAmount > 0.15`. Se compone de tres
capas tenues (`pal.star`/`pal.cloud`) más polvo brillante disperso, y queda **por detrás de las
estrellas** para que estas la salpiquen.

## Aurora austral

Bandas verticales semitransparentes (verde/cian/violeta) cerca de la parte superior del cielo,
visibles con `nightAmount > 0.35`. Guiño al hemisferio sur.

## Nubes

Nubes de puffs elípticos que derivan lentamente con parallax bajo (`camera.x * 0.04`) y se tiñen
según la hora y el clima. Se dibujan **por delante de las estrellas y del sol/luna** (los ocultan)
y **por detrás del terreno**.

## Pendiente

- TODO: fase lunar (luna creciente/menguante) y su relación con las estrellas.
- TODO: estrellas fugaces ocasionales.
- TODO: ajustar el tono del resplandor según estación.
