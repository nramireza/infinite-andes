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
