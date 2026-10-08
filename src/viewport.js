// Dimensiones del lienzo: altura fija y relación de aspecto configurable.
//
// El ancho sale de la relación: W = round(BASE_H * ratio). Así 16:9 → 480,
// 21:9 → 630 y 32:9 (por defecto) → 960, sin alterar el detalle vertical.

export const BASE_H = 270;
export const DEFAULT_ASPECT = "32:9";

export const ASPECT_PRESETS = [
  { id: "16:9", ratio: 16 / 9 },
  { id: "21:9", ratio: 21 / 9 },
  { id: "32:9", ratio: 32 / 9 },
];

export function widthForRatio(ratio) {
  const r = Number.isFinite(ratio) && ratio > 0 ? ratio : 32 / 9;
  return Math.max(1, Math.round(BASE_H * r));
}

// Acepta "32:9", "2.4" o "21/9" y devuelve la relación; null si no es válida.
export function ratioFromString(s) {
  if (s == null) return null;
  const str = String(s).trim();
  const m = str.match(/^(\d+(?:\.\d+)?)\s*[:xX/]\s*(\d+(?:\.\d+)?)$/);
  if (m) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    return a > 0 && b > 0 ? a / b : null;
  }
  const n = parseFloat(str);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Etiqueta canónica para la URL: preset conocido o relación decimal.
export function labelForRatio(ratio) {
  const preset = ASPECT_PRESETS.find((a) => Math.abs(a.ratio - ratio) < 0.0001);
  return preset ? preset.id : `${ratio.toFixed(3)}:1`;
}
