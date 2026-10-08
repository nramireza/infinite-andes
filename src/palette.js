// Paletas del paisaje: interpolación por hora del día + modificadores de clima.

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}

export function lerpColor(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}

export function shade(hex, amt) {
  const A = hexToRgb(hex);
  if (amt >= 0) return rgbToHex(A[0] + (255 - A[0]) * amt, A[1] + (255 - A[1]) * amt, A[2] + (255 - A[2]) * amt);
  return rgbToHex(A[0] * (1 + amt), A[1] * (1 + amt), A[2] * (1 + amt));
}

export const FIELDS = [
  "skyTop", "skyMid", "skyHorizon",
  "sun", "sunGlow", "cloud", "cloudHi", "star",
  "farL", "farD", "midL", "midD", "nearL", "nearD",
  "valleyL", "valleyD", "costaL", "costaD",
  "sand", "sandD", "sea", "seaD", "seaHi",
  "snow", "snowD", "water", "waterHi", "ground", "groundHi",
  "floraL", "floraD", "trunk", "rock", "rockD", "fog",
];

export const KEYS = [
  {
    t: 0.0,
    p: {
      skyTop: "#04060e", skyMid: "#081326", skyHorizon: "#122036",
      sun: "#e8eefc", sunGlow: "#5b6f96", cloud: "#1a2740", cloudHi: "#2a3a58", star: "#dfe8ff",
      farL: "#1c2b46", farD: "#141f35", midL: "#172540", midD: "#101a30",
      nearL: "#121d31", nearD: "#0b1423",
      valleyL: "#12301f", valleyD: "#0b2016", costaL: "#0f2a1c", costaD: "#0a1c13",
      sand: "#2a2a33", sandD: "#20202a", sea: "#0a1730", seaD: "#081226", seaHi: "#1d3a63",
      snow: "#41527a", snowD: "#2c3a5c", water: "#0a1730", waterHi: "#1d3a63",
      ground: "#0c1520", groundHi: "#14212f",
      floraL: "#123028", floraD: "#0a1f1c", trunk: "#1a1a22", rock: "#1a2233", rockD: "#121825",
      fog: "#101a2c",
    },
  },
  {
    t: 0.22,
    p: {
      skyTop: "#24305a", skyMid: "#6a4a66", skyHorizon: "#c26a4a",
      sun: "#ffcf9a", sunGlow: "#d97a4a", cloud: "#5a4060", cloudHi: "#7a5a70", star: "#c9d4ff",
      farL: "#3a4468", farD: "#2c3554", midL: "#333c5c", midD: "#28304c",
      nearL: "#2c3450", nearD: "#20273e",
      valleyL: "#16301f", valleyD: "#0e2114", costaL: "#122a1a", costaD: "#0c1d12",
      sand: "#3a3630", sandD: "#2c2924", sea: "#1c2c4c", seaD: "#152238", seaHi: "#3a5a80",
      snow: "#c9b8c8", snowD: "#9a8fa8", water: "#1c2c4c", waterHi: "#3a5a80",
      ground: "#1e2a34", groundHi: "#2a3844",
      floraL: "#1e3a30", floraD: "#142a24", trunk: "#221f22", rock: "#2a3245", rockD: "#1f2634",
      fog: "#5a4050",
    },
  },
  {
    t: 0.25,
    p: {
      skyTop: "#3f5288", skyMid: "#c0705a", skyHorizon: "#ff9d4a",
      sun: "#ffcf80", sunGlow: "#ff8038", cloud: "#d99a80", cloudHi: "#f0b8a0", star: "#b8c4ff",
      farL: "#7a7290", farD: "#5c5678", midL: "#6a6488", midD: "#524c70",
      nearL: "#5a5474", nearD: "#443f5c",
      valleyL: "#3f5a34", valleyD: "#2c4026", costaL: "#2f5a30", costaD: "#214022",
      sand: "#c8a878", sandD: "#a88a5e", sea: "#3c5a7c", seaD: "#2c4660", seaHi: "#7c94b0",
      snow: "#ffe6d0", snowD: "#d8b8b0", water: "#3c5a7c", waterHi: "#7c94b0",
      ground: "#40503f", groundHi: "#556b4a",
      floraL: "#2f4a38", floraD: "#213830", trunk: "#3a2a22", rock: "#5a5a6a", rockD: "#45455a",
      fog: "#c08a70",
    },
  },
  {
    t: 0.33,
    p: {
      skyTop: "#3a8ecf", skyMid: "#83c0e6", skyHorizon: "#d2eaf3",
      sun: "#fff0b8", sunGlow: "#ffdca0", cloud: "#e6eff6", cloudHi: "#ffffff", star: "#ccd6ff",
      farL: "#9db4cd", farD: "#8097b3", midL: "#7a94ac", midD: "#5f7c96",
      nearL: "#5d7b8d", nearD: "#476378",
      valleyL: "#5a8a3f", valleyD: "#3f6a2e", costaL: "#3f8a45", costaD: "#2a6630",
      sand: "#dcc08a", sandD: "#b89a66", sea: "#3d7ea5", seaD: "#2a6285", seaHi: "#7fbcda",
      snow: "#ffffff", snowD: "#dbe8f2", water: "#3d7ea5", waterHi: "#7fbcda",
      ground: "#4b6b45", groundHi: "#608351",
      floraL: "#356b3a", floraD: "#254a28", trunk: "#4a3524", rock: "#6a7280", rockD: "#525a66",
      fog: "#d8e4ea",
    },
  },
  {
    t: 0.5,
    p: {
      skyTop: "#3d97d6", skyMid: "#7cc0e8", skyHorizon: "#cfe8f5",
      sun: "#fff6d0", sunGlow: "#ffe8a8", cloud: "#eef5fa", cloudHi: "#ffffff", star: "#ccd6ff",
      farL: "#a6bcd2", farD: "#8aa0ba", midL: "#7f9ab2", midD: "#64829c",
      nearL: "#5f7e90", nearD: "#48657b",
      valleyL: "#5f9243", valleyD: "#436e30", costaL: "#3f8f47", costaD: "#2a6a33",
      sand: "#e2c896", sandD: "#c0a070", sea: "#2f7aa6", seaD: "#1f6088", seaHi: "#7fc4e0",
      snow: "#ffffff", snowD: "#dcebf4", water: "#2f7aa6", waterHi: "#7fc4e0",
      ground: "#4f7247", groundHi: "#648a52",
      floraL: "#356f3c", floraD: "#264d29", trunk: "#4c3726", rock: "#707888", rockD: "#565e6c",
      fog: "#dce8ee",
    },
  },
  {
    t: 0.70,
    p: {
      skyTop: "#3f8fca", skyMid: "#8ac0e0", skyHorizon: "#e8e0c8",
      sun: "#ffeeb0", sunGlow: "#ffd888", cloud: "#eee8dc", cloudHi: "#fff8f0", star: "#ccd6ff",
      farL: "#a8b4c4", farD: "#8c98ac", midL: "#84929e", midD: "#6a7886",
      nearL: "#667a7c", nearD: "#4e6270",
      valleyL: "#5f8840", valleyD: "#446630", costaL: "#437f42", costaD: "#2e5f2e",
      sand: "#dcc084", sandD: "#b8985e", sea: "#3a7c9c", seaD: "#2a6080", seaHi: "#86bcd0",
      snow: "#fff4e0", snowD: "#e0dccc", water: "#3a7c9c", waterHi: "#86bcd0",
      ground: "#557444", groundHi: "#6a8a50",
      floraL: "#386c38", floraD: "#284c26", trunk: "#4e3a26", rock: "#727684", rockD: "#585c68",
      fog: "#e0e4dc",
    },
  },
  {
    t: 0.76,
    p: {
      skyTop: "#26407e", skyMid: "#8a5a86", skyHorizon: "#f2a05a",
      sun: "#ffbe78", sunGlow: "#ff8a4a", cloud: "#b07888", cloudHi: "#e0a0a0", star: "#b8c4ff",
      farL: "#6e6388", farD: "#544c70", midL: "#655a80", midD: "#4e4566",
      nearL: "#5a506e", nearD: "#443c56",
      valleyL: "#41482c", valleyD: "#2c3220", costaL: "#33482c", costaD: "#243420",
      sand: "#b08858", sandD: "#8c6a44", sea: "#3c5478", seaD: "#2c4058", seaHi: "#8a7a9a",
      snow: "#ffddc0", snowD: "#d8a898", water: "#3c5478", waterHi: "#8a7a9a",
      ground: "#4a4438", groundHi: "#5e5442",
      floraL: "#33483a", floraD: "#243430", trunk: "#3a2a22", rock: "#605860", rockD: "#48424c",
      fog: "#c08a78",
    },
  },
  {
    t: 0.84,
    p: {
      skyTop: "#141f45", skyMid: "#33305e", skyHorizon: "#6e4a66",
      sun: "#ffd9a0", sunGlow: "#7a5068", cloud: "#2c3050", cloudHi: "#3e4468", star: "#c9d4ff",
      farL: "#2e3858", farD: "#232c46", midL: "#2a3350", midD: "#20283f",
      nearL: "#27304a", nearD: "#1d2438",
      valleyL: "#1a2f1e", valleyD: "#122015", costaL: "#152a19", costaD: "#0f1f13",
      sand: "#3a3328", sandD: "#2c271e", sea: "#182a48", seaD: "#122038", seaHi: "#33527a",
      snow: "#8a92b0", snowD: "#666f90", water: "#182a48", waterHi: "#33527a",
      ground: "#1a2530", groundHi: "#25333e",
      floraL: "#1c3a30", floraD: "#142a24", trunk: "#221f22", rock: "#28304a", rockD: "#1d2436",
      fog: "#2a3450",
    },
  },
  { t: 1.0, p: null }, // se rellena con la clave de medianoche
];

KEYS[KEYS.length - 1].p = KEYS[0].p;

function interpKeys(time) {
  const t = ((time % 1) + 1) % 1;
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const span = b.t - a.t || 1;
  const k = Math.max(0, Math.min(1, (t - a.t) / span));
  const out = {};
  for (const f of FIELDS) out[f] = lerpColor(a.p[f], b.p[f], k);
  return out;
}

const WEATHER_TARGETS = {
  snow: {
    skyTop: "#8f9aa8", skyMid: "#aab4c0", skyHorizon: "#cfd6dd",
    farL: "#8a94a2", farD: "#78828f", midL: "#8590a0", midD: "#707b8a", nearL: "#7c8894", nearD: "#68737f",
    valleyL: "#8a949c", valleyD: "#767f86", costaL: "#8a949c", costaD: "#767f86",
    sand: "#c8ccd0", sandD: "#a8adb2", sea: "#7f8a94", seaD: "#6c7680", seaHi: "#a8b2ba",
  },
  rain: {
    skyTop: "#4a5560", skyMid: "#5a646e", skyHorizon: "#78828c",
    farL: "#55606a", farD: "#48525b", midL: "#4e585f", midD: "#424b52", nearL: "#454e55", nearD: "#3a4248",
    valleyL: "#46524a", valleyD: "#3a443c", costaL: "#46524a", costaD: "#3a443c",
    sand: "#5a5248", sandD: "#48423a", sea: "#3a4750", seaD: "#2f3a42", seaHi: "#55626a",
  },
  fog: {
    skyTop: "#c9d2da", skyMid: "#cdd5dd", skyHorizon: "#d3dae1",
    farL: "#c2cbd3", farD: "#b8c1c9", midL: "#bcc5cd", midD: "#b2bbc3", nearL: "#b6bfc7", nearD: "#acb5bd",
    valleyL: "#bcc5cd", valleyD: "#b2bbc3", costaL: "#bcc5cd", costaD: "#b2bbc3",
    sand: "#c4cbd1", sandD: "#b8bfc5", sea: "#bcc5cd", seaD: "#b2bbc3", seaHi: "#cdd5db",
  },
  wind: { skyTop: "#3c8fca", skyMid: "#8ec0da", skyHorizon: "#e2dcc4" },
};

export function applyWeather(pal, weather, strength = 1) {
  const s = Math.max(0, Math.min(1, strength));
  if (!WEATHER_TARGETS[weather]) return pal;
  const out = { ...pal };
  const targets = WEATHER_TARGETS[weather];
  for (const key in targets) {
    const k = weather === "fog" ? s * 0.8 : s * (weather === "wind" ? 0.35 : 0.7);
    out[key] = lerpColor(out[key], targets[key], k);
  }
  if (weather === "snow") out.snow = "#ffffff";
  if (weather === "rain") out.water = lerpColor(out.water, "#3a4750", s * 0.5);
  return out;
}

// Claves que un bioma puede teñir: terreno, flora y suelo. Nunca cielo, astros,
// nubes, estrellas, niebla ni mar (el bioma es terrestre).
const BIOME_KEYS = new Set([
  "farL", "farD", "midL", "midD", "nearL", "nearD",
  "valleyL", "valleyD", "costaL", "costaD",
  "sand", "sandD", "rock", "rockD", "floraL", "floraD",
  "snow", "snowD", "ground", "groundHi",
]);

// Aplica el tinte de bioma (`amount` 0..1) y el rubor de la floración (`bloom` 0..1).
export function applyBiome(pal, tint, amount = 1, bloom = 0) {
  const a = Math.max(0, Math.min(1, amount));
  const b = Math.max(0, Math.min(1, bloom));
  if ((!tint || a <= 0) && b <= 0) return pal;
  const out = { ...pal };
  if (tint && a > 0) {
    for (const k in tint) {
      if (!BIOME_KEYS.has(k)) continue;
      out[k] = lerpColor(out[k], tint[k], a);
    }
  }
  if (b > 0) {
    out.sand = lerpColor(out.sand, "#e6b8c8", b * 0.6);
    out.sandD = lerpColor(out.sandD, "#c89aa0", b * 0.45);
    out.valleyL = lerpColor(out.valleyL, "#c8a86a", b * 0.45);
    out.valleyD = lerpColor(out.valleyD, "#b08a58", b * 0.4);
    out.costaL = lerpColor(out.costaL, "#c2a878", b * 0.4);
    out.costaD = lerpColor(out.costaD, "#9a8060", b * 0.35);
    out.floraL = lerpColor(out.floraL, "#d98ab0", b * 0.5);
    out.floraD = lerpColor(out.floraD, "#a86a90", b * 0.4);
  }
  return out;
}

export function getPalette(hour24, weather = "clear", strength = 1) {
  const base = interpKeys(hour24 / 24);
  return applyWeather(base, weather, strength);
}

// Cuánto "de noche" está (0 = pleno día, 1 = noche cerrada).
export function nightAmount(hour24) {
  const h = ((hour24 % 24) + 24) % 24;
  if (h >= 7 && h <= 18) return 0;
  if (h > 18 && h < 20) return (h - 18) / 2;
  if (h > 5 && h < 7) return 1 - (h - 5) / 2;
  return 1;
}
