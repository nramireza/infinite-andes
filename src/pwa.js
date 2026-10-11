// PWA: registro del service worker (uso offline) y Wake Lock (pantalla encendida).

// Registra `sw.js`. En desarrollo (localhost) se omite para no interferir con el
// servidor sin caché; se puede forzar con `?sw=1`.
export function registerServiceWorker({ force = false } = {}) {
  if (!("serviceWorker" in navigator)) return;
  const host = location.hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "";
  if (local && !force) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

// Mantiene la pantalla encendida mientras el modo fondo está activo. Degrada
// con gracia si el navegador no soporta Wake Lock. Devuelve una función para
// desactivarlo.
export function setupWakeLock(enabled) {
  if (!enabled || !("wakeLock" in navigator)) return () => {};
  let lock = null;
  let active = true;

  async function acquire() {
    if (!active || lock || document.visibilityState !== "visible") return;
    try {
      lock = await navigator.wakeLock.request("screen");
      lock.addEventListener("release", () => { lock = null; });
    } catch (_) {
      lock = null;
    }
  }

  function release() {
    if (lock) {
      lock.release().catch(() => {});
      lock = null;
    }
  }

  function onVisibility() {
    if (document.visibilityState === "visible") acquire();
    else release();
  }

  document.addEventListener("visibilitychange", onVisibility);
  acquire();

  return () => {
    active = false;
    document.removeEventListener("visibilitychange", onVisibility);
    release();
  };
}
