// Estaciones del año: tinte global, línea de nieve y sesgo de clima.
// Avanzan con un ciclo temporal lento (o se fijan con `?season=`) y se mezclan
// con una meseta y un crossfade suave entre estaciones adyacentes.

import { lerpColor } from "./palette.js";

export const SEASON_IDS = ["verano", "otono", "invierno", "primavera"];

// `tint`: colores objetivo (atmósfera + terreno/flora). `snowShift`: desplaza la
// línea de nieve (positivo = más nieve / línea más baja). `weatherBias`: pesos por clima.
// El verano no tiñe: es la base actual.
export const SEASONS = {
  verano: {
    tint: {},
    snowShift: -0.18,
    weatherBias: { clear: 2.2, snow: 0.2, rain: 0.5, fog: 0.6, wind: 1.0 },
  },
  otono: {
    tint: {
      floraL: "#8a6a2e", floraD: "#5e4420", costaL: "#8a6a2e", costaD: "#5e4420",
      valleyL: "#8a7a34", valleyD: "#5e5226", sand: "#dcb884", sandD: "#b8935e",
      skyHorizon: "#e6c08a",
    },
    snowShift: 0.12,
    weatherBias: { clear: 1.0, snow: 0.6, rain: 0.9, fog: 1.0, wind: 1.8 },
  },
  invierno: {
    tint: {
      floraL: "#3a5a4a", floraD: "#26403a", costaL: "#38564a", costaD: "#26403a",
      valleyL: "#4a6a52", valleyD: "#33503c", sand: "#b8bec4", sandD: "#98a0a8",
      skyHorizon: "#cfd8e0",
    },
    snowShift: 0.32,
    weatherBias: { clear: 0.8, snow: 2.2, rain: 1.4, fog: 1.2, wind: 1.2 },
  },
  primavera: {
    tint: {
      floraL: "#4a9a44", floraD: "#2f6a30", costaL: "#489a44", costaD: "#2f6a30",
      valleyL: "#6aa848", valleyD: "#48803a", sand: "#e2c896", sandD: "#c0a070",
      skyHorizon: "#d6ecf2",
    },
    snowShift: -0.05,
    weatherBias: { clear: 1.6, snow: 0.3, rain: 0.8, fog: 0.7, wind: 1.2 },
  },
};

export const SEASON_DURATION = 120; // segundos por estación (año ≈ 8 min)
export const SEASON_STRENGTH = 0.5; // cuánto tiñe la estación la paleta base
const HOLD = 0.6; // fracción de la estación sostenida antes del crossfade

// Claves que la estación puede teñir (atmósfera + terreno/flora; no astros ni mar).
const SEASON_KEYS = new Set([
  "floraL", "floraD", "costaL", "costaD", "valleyL", "valleyD",
  "sand", "sandD", "skyHorizon", "skyMid", "snow", "snowD",
]);

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(a, b, x) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

// Estado de estación para una fase continua. `mode` fijo (una estación) salta el ciclo.
export function seasonState(phase, mode = "auto") {
  if (SEASON_IDS.includes(mode)) {
    const i = SEASON_IDS.indexOf(mode);
    return { index: i, next: i, t: 0 };
  }
  const p = ((phase % 4) + 4) % 4;
  const index = Math.floor(p);
  const t = smoothstep(HOLD, 1, p - index);
  return { index, next: (index + 1) % 4, t };
}

function blendNum(a, b, t) {
  return a + (b - a) * t;
}

// Desplazamiento de la línea de nieve (se suma al del bioma).
export function seasonSnowShift(state) {
  const a = SEASONS[SEASON_IDS[state.index]].snowShift;
  const b = SEASONS[SEASON_IDS[state.next]].snowShift;
  return blendNum(a, b, state.t);
}

// Pesos de clima de la estación (mezclados entre actual y siguiente).
export function seasonWeatherBias(state) {
  const a = SEASONS[SEASON_IDS[state.index]].weatherBias;
  const b = SEASONS[SEASON_IDS[state.next]].weatherBias;
  const out = {};
  for (const k in a) out[k] = blendNum(a[k], b[k] ?? a[k], state.t);
  return out;
}

// Tinte mezclado entre estación actual y siguiente.
function seasonTint(state) {
  const a = SEASONS[SEASON_IDS[state.index]].tint;
  const b = SEASONS[SEASON_IDS[state.next]].tint;
  const out = {};
  for (const k in a) {
    if (!SEASON_KEYS.has(k)) continue;
    out[k] = state.t > 0 && b[k] ? lerpColor(a[k], b[k], state.t) : a[k];
  }
  return out;
}

// Aplica el tinte de estación a una paleta (devuelve una copia). `strength` en 0..1.
export function applySeason(pal, state, strength = SEASON_STRENGTH) {
  const s = clamp01(strength);
  if (s <= 0) return { ...pal };
  const tint = seasonTint(state);
  const out = { ...pal };
  for (const k in tint) out[k] = lerpColor(out[k], tint[k], s);
  return out;
}

// Elige un clima según el sesgo de estación. `rnd` devuelve [0,1).
export function pickSeasonWeather(state, rnd) {
  const bias = seasonWeatherBias(state);
  const keys = Object.keys(bias);
  let total = 0;
  for (const k of keys) total += bias[k];
  if (total <= 0) return keys[0];
  let r = rnd() * total;
  for (const k of keys) {
    r -= bias[k];
    if (r < 0) return k;
  }
  return keys[keys.length - 1];
}
