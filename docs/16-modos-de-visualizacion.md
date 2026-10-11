# 16 · Modos de visualización

> Estado: estable · Actualizado: 2026-10-11

Formas de dejar el paisaje corriendo, más allá de la pestaña normal. La base ya existe como **modo
kiosco/fondo de pantalla** (`?ui=0`, pantalla completa, `fit=cover`, pausa al ocultar la pestaña)
([D-026](12-decisiones.md), [10 · UI y exportación](10-ui-y-export.md)); lo nuevo es empaquetarlo
para que arranque solo y funcione sin conexión (**PWA**) y, opcionalmente, llevarlo al *wallpaper*
del sistema operativo.

## Modo kiosco (implementado)

| Aspecto | Estado |
|---------|--------|
| `?ui=0` | Oculta panel, botón, HUD y cursor. |
| `?fit=cover\|contain` | Llena la pantalla (recorta) o encaja el canvas entero. |
| Pantalla completa | Clic en el paisaje (kiosco) o tecla `F`. |
| Rendimiento | 30 fps por defecto (`?fps=`), 8 fps en reposo, pausa al ocultar la pestaña. |

## Live wallpaper (implementado, v1.7.0 · [D-050](12-decisiones.md))

Acercar el fondo vivo **desde el navegador**, sin romper el modelo *JS puro, sin dependencias*:

1. **PWA instalable** — `manifest.webmanifest` (nombre, tema oscuro, `display: fullscreen` u
   `standalone`, íconos) para poder instalarlo como app.
2. **Service worker** — cachea el *shell* (`index.html`, `style.css`, `src/*.js`) para uso **offline**.
   Es la primera caché de producción del proyecto: el servidor de desarrollo `npm start` mantiene
   `Cache-Control: no-store` para no mezclar versiones al editar.
3. **Wake Lock** — `navigator.wakeLock.request("screen")` mientras el modo fondo está activo, para
   que la pantalla no se apague (con liberación al ocultar la pestaña y reintento al volver).
4. **Arranque directo** — `?ui=0&fit=cover` como URL de inicio para que, una vez instalada, abra
   directo en modo fondo.

### Íconos y metadatos

- Íconos cuadrados (192 y 512 px) derivados del canvas pixelado, sin arte nuevo si es posible.
- `background_color` y `theme_color` alineados con la paleta nocturna.

## Capa externa de wallpaper del SO (fuera de alcance)

Un *live wallpaper* real del escritorio exige integración por sistema (Wallpaper Engine en Windows,
`swww`/`hyprpaper` en Wayland, herramientas de macOS) y sale del alcance browser-only. Se documenta
como **capa externa opcional**: cualquier herramienta que muestre una URL en el escritorio puede
apuntar a la PWA en modo kiosco. No se incluye en el repositorio.

## Parámetros de URL

| Parámetro | Efecto | Estado |
|-----------|--------|--------|
| `ui` | `0` oculta el panel/cursor (kiosco) | Implementado |
| `fit` | `cover` (def.) o `contain` | Implementado |
| `fps` | Límite de fotogramas (def. `30`; `0` = sin límite) | Implementado |
| `wall` | `1` fuerza el modo fondo (kiosco + Wake Lock) | Implementado (v1.7.0) |
| `sw` | `1` fuerza el registro del service worker en localhost | Implementado (v1.7.0) |

## Criterios de aceptación

- [x] Instalable como PWA y arranca offline desde caché (runtime `stale-while-revalidate`).
- [x] La pantalla no se apaga mientras el modo fondo está activo (si el navegador lo permite).
- [x] `npm start` sigue sirviendo sin caché para desarrollo (el SW no se registra en localhost).
- [x] El modo kiosco actual no cambia de comportamiento sin el flag nuevo.

## Riesgos / dudas

- Wake Lock por navegador: **degradado con gracia** si `navigator.wakeLock` no existe (Safari/iOS).
- Invalidación de caché: **resuelta** con *stale-while-revalidate* (los recursos se revalidan solos
  en segundo plano) y navegación red-primero.
- Flag: `?wall=1` **propio** (implica kiosco y Wake Lock), independiente de `?ui=0`.

## Referencias

- [D-050](12-decisiones.md) · [D-026](12-decisiones.md) · [10 · UI y exportación](10-ui-y-export.md)
