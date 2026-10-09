// Control de fotogramas para el uso como fondo de pantalla: límite de FPS y
// presupuesto entre dibujos. Puro (sin DOM) para poder testearlo en Node.

// Milisegundos mínimos entre dibujos para un objetivo de FPS. <= 0 = sin límite.
export function frameBudget(fps) {
  const n = Number(fps);
  return Number.isFinite(n) && n > 0 ? 1000 / n : 0;
}

// ¿Toca dibujar? `nowMs`/`lastDrawMs` en la misma escala (p. ej. performance.now()).
export function shouldDraw(nowMs, lastDrawMs, fps) {
  return nowMs - lastDrawMs >= frameBudget(fps);
}

// Acota el delta de tiempo (segundos) para evitar saltos tras una pausa larga.
export function clampDt(dtSec, max = 0.05) {
  const d = Number(dtSec);
  if (!Number.isFinite(d) || d < 0) return 0;
  return Math.min(d, max);
}

// FPS de reposo: con la escena casi quieta (sin scroll ni clima) no hace falta
// redibujar a tasa completa.
export const IDLE_FPS = 8;

// FPS efectivo según el movimiento. `base` 0 = sin límite (se respeta).
export function effectiveFps(base, { scrolling = false, weather = false } = {}) {
  const n = Number(base);
  if (!Number.isFinite(n) || n <= 0) return n > 0 ? n : 0;
  if (scrolling || weather) return n;
  return Math.min(n, IDLE_FPS);
}

// ¿Se puede dibujar este fotograma? El primero siempre, aunque la ventana no
// tenga foco; después se respeta la pausa por foco/pestaña.
export function canRender({ painted = false, running = true, focused = true } = {}) {
  if (!running) return false;
  return focused || !painted;
}
