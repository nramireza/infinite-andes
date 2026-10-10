// Vistas: serialización del estado de la escena para enlaces y favoritos.
//
// Un "view" es un objeto plano con los mismos campos que la URL. `encodeView`
// produce el query string y `decodeView` lo valida; los favoritos guardan el
// query resultante. Todo es puro (sin DOM) para poder testearlo en Node.

import { ratioFromString } from "./viewport.js";

export const VIEW_KEYS = ["seed", "x", "hour", "weather", "aspect", "moment", "season", "biome", "bloom", "clock"];

export const VIEW_WEATHERS = ["auto", "clear", "snow", "rain", "fog", "wind", "storm"];
export const VIEW_MOMENTS = ["auto", "none", "18sep", "leorey", "kungleo"];
export const VIEW_SEASONS = ["auto", "verano", "otono", "invierno", "primavera"];
export const VIEW_BIOMES = ["auto", "altiplano", "norte", "centro", "sur", "patagonia"];
export const VIEW_BLOOMS = ["auto", "on", "off"];
export const VIEW_CLOCKS = ["real", "fast"];

function clampHour(h) {
  return ((h % 24) + 24) % 24;
}

function toParams(input) {
  if (input instanceof URLSearchParams) return input;
  if (typeof input === "string") return new URLSearchParams(input.replace(/^\?/, ""));
  if (input && typeof input === "object") {
    const p = new URLSearchParams();
    for (const k of VIEW_KEYS) {
      if (input[k] != null && input[k] !== "") p.set(k, String(input[k]));
    }
    return p;
  }
  return new URLSearchParams();
}

// Objeto de estado -> query string (sin "?"). Omite campos ausentes o inválidos.
export function encodeView(state) {
  const p = new URLSearchParams();
  const s = state || {};
  if (s.seed != null && s.seed !== "") p.set("seed", String(s.seed));
  if (Number.isFinite(Number(s.x))) p.set("x", String(Math.round(Number(s.x))));
  if (Number.isFinite(Number(s.hour))) p.set("hour", clampHour(Number(s.hour)).toFixed(2));
  if (VIEW_WEATHERS.includes(s.weather)) p.set("weather", s.weather);
  if (s.aspect && ratioFromString(s.aspect)) p.set("aspect", String(s.aspect).trim());
  if (VIEW_MOMENTS.includes(s.moment)) p.set("moment", s.moment);
  if (VIEW_SEASONS.includes(s.season)) p.set("season", s.season);
  if (VIEW_BIOMES.includes(s.biome)) p.set("biome", s.biome);
  if (VIEW_BLOOMS.includes(s.bloom)) p.set("bloom", s.bloom);
  if (VIEW_CLOCKS.includes(s.clock)) p.set("clock", s.clock);
  return p.toString();
}

// Query string / URLSearchParams / objeto -> estado validado (solo campos presentes).
export function decodeView(input) {
  const p = toParams(input);
  const view = {};
  const seed = p.get("seed");
  if (seed != null && seed !== "") view.seed = seed;

  const x = parseFloat(p.get("x"));
  if (Number.isFinite(x)) view.x = Math.round(x);

  const hour = parseFloat(p.get("hour"));
  if (Number.isFinite(hour)) view.hour = clampHour(hour);

  const weather = p.get("weather");
  if (VIEW_WEATHERS.includes(weather)) view.weather = weather;
  const aspect = p.get("aspect");
  if (aspect && ratioFromString(aspect)) view.aspect = aspect.trim();
  const moment = p.get("moment");
  if (VIEW_MOMENTS.includes(moment)) view.moment = moment;
  const season = p.get("season");
  if (VIEW_SEASONS.includes(season)) view.season = season;
  const biome = p.get("biome");
  if (VIEW_BIOMES.includes(biome)) view.biome = biome;
  const bloom = p.get("bloom");
  if (VIEW_BLOOMS.includes(bloom)) view.bloom = bloom;
  const clock = p.get("clock");
  if (VIEW_CLOCKS.includes(clock)) view.clock = clock;
  return view;
}

// Alta/actualización de un favorito por nombre (reemplaza si ya existe).
export function addView(list, view, name) {
  const entry = { name: String(name).trim(), query: encodeView(view) };
  const out = (list || []).filter((e) => e.name !== entry.name);
  out.push(entry);
  return out;
}

export function removeView(list, name) {
  return (list || []).filter((e) => e.name !== name);
}

// JSON de localStorage -> lista válida (tolera datos corruptos).
export function parseViews(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e) => e && typeof e.name === "string" && typeof e.query === "string")
      .map((e) => ({ name: e.name, query: e.query }));
  } catch (_) {
    return [];
  }
}
