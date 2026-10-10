// Biomas de Chile: norte árido, centro y sur boscoso. Deterministas por semilla.
// El bioma cambia de forma procedural al recorrer (`biomeWeights`) o se fija con
// `?biome=`. Solo tiñe paleta y compone flora/fauna; no toca la geometría del ruido.
// El norte admite el evento de "desierto florido" (`bloomAt`).

import { fbm1 } from "./noise.js";
import { hash1, hashInt } from "./rng.js";
import { lerpColor } from "./palette.js";

export const BIOME_IDS = ["altiplano", "norte", "centro", "sur", "patagonia", "austral"];

// Tintes por bioma: solo claves de terreno/flora/suelo (nunca cielo ni astros).
export const BIOMES = {
  altiplano: {
    palette: {
      valleyL: "#9a9668", valleyD: "#6e6c4a", costaL: "#8e8a60", costaD: "#646044",
      floraL: "#7e8654", floraD: "#565c38", sand: "#e2d6ae", sandD: "#b8ac84",
      rock: "#8f8378", rockD: "#6b6058", snow: "#ffffff", snowD: "#e4eaf0",
    },
    geometry: { ampMul: 1.12, snowShift: -0.1 },
    // Puna: paja brava, matorral bajo y roca; sin árboles.
    flora: {
      precordillera: ["cactus", "bush", "rock", "grass"],
      valle: ["grass", "grass", "bush", "rock", "cactus"],
      costa: ["cactus", "bush", "rock", "grass"],
      playa: ["rock", "grass"],
    },
    fauna: {
      andes: ["condor", "chinchilla"],
      precordillera: ["guanaco", "vicuna", "culpeo", "chinchilla"],
      valle: ["vicuna", "guanaco", "culpeo", "chingue"],
      costa: ["chilla", "culpeo", "chingue"],
      playa: ["flamenco", "chilla"],
    },
  },
  norte: {
    palette: {
      valleyL: "#a8a05a", valleyD: "#7a7440", costaL: "#9a9450", costaD: "#6e6a38",
      floraL: "#8a8a4a", floraD: "#5e5e30", sand: "#e8d29a", sandD: "#c8ae72",
      rock: "#8a7a6a", rockD: "#6a5a4e", snow: "#fff6e6", snowD: "#e0d2b8",
    },
    geometry: { ampMul: 0.92, snowShift: 0.3 },
    // Sin araucaria ni árboles: matorral, copao y roca del desierto.
    flora: {
      precordillera: ["cactus", "bush", "rock"],
      valle: ["cactus", "bush", "rock", "grass", "crop"],
      costa: ["cactus", "bush", "rock"],
      playa: ["rock", "grass"],
    },
    fauna: {
      andes: ["condor", "chinchilla"],
      precordillera: ["guanaco", "vicuna", "culpeo"],
      valle: ["culpeo", "chingue", "chilla", "guanaco"],
      costa: ["chilla", "culpeo", "chingue"],
      playa: ["flamenco", "chilla"],
    },
  },
  centro: {
    palette: null,
    geometry: { ampMul: 1, snowShift: 0 },
    flora: null, // usa los pools de LAYERS
    fauna: null,
  },
  sur: {
    palette: {
      valleyL: "#3f7a3a", valleyD: "#2c5a2a", costaL: "#2f7a3a", costaD: "#1f5a28",
      floraL: "#2a6a34", floraD: "#1c4a24", sand: "#d8c090", sandD: "#b0986e",
      rock: "#5f6a70", rockD: "#48525a", snow: "#ffffff", snowD: "#d8e6f0",
    },
    geometry: { ampMul: 1.06, snowShift: -0.3 },
    flora: {
      precordillera: ["araucaria", "alerce", "lenga", "coihue", "michay", "bush"],
      valle: ["lenga", "nalca", "colihue", "coihue", "roble", "michay", "copihue", "araucaria", "bush", "quillay", "manio", "canelo", "arrayan", "notro"],
      costa: ["lenga", "coihue", "roble", "alerce", "nalca", "colihue", "copihue", "michay", "chaura", "araucaria", "bush", "quillay", "manio", "canelo", "arrayan", "notro"],
      playa: ["grass", "rock"],
    },
    fauna: {
      andes: ["condor", "chinchilla"],
      precordillera: ["huemul", "pudu", "puma", "choique"],
      valle: ["pudu", "guina", "huemul", "chingue", "culpeo", "choique", "huillin", "rana"],
      costa: ["monito", "choroy", "cachana", "pudu", "guina", "chucao", "huillin", "rana"],
      playa: ["chilla", "flamenco"],
    },
  },
  patagonia: {
    palette: {
      valleyL: "#8a8a5e", valleyD: "#62623e", costaL: "#727a52", costaD: "#525a3a",
      floraL: "#6a7a48", floraD: "#485838", sand: "#d8cba0", sandD: "#b0a37c",
      rock: "#6b7078", rockD: "#4e545c", snow: "#ffffff", snowD: "#dbe8f2",
    },
    geometry: { ampMul: 1.02, snowShift: -0.45 },
    // Estepa fría: lenga y ñire bajos, coirón y matorral; mucha nieve.
    flora: {
      precordillera: ["lenga", "coihue", "michay", "bush", "rock"],
      valle: ["lenga", "colihue", "michay", "chaura", "bush", "grass", "manio", "notro", "arrayan"],
      costa: ["lenga", "coihue", "michay", "chaura", "colihue", "bush", "manio", "notro", "arrayan", "canelo"],
      playa: ["grass", "rock"],
    },
    fauna: {
      andes: ["condor", "chinchilla"],
      precordillera: ["guanaco", "choique", "puma", "huemul"],
      valle: ["guanaco", "choique", "culpeo", "puma", "huemul"],
      costa: ["chucao", "pudu", "guina", "culpeo", "huillin", "rana"],
      playa: ["chilla", "flamenco"],
    },
  },
  austral: {
    palette: {
      valleyL: "#3d6b52", valleyD: "#2a4a3a", costaL: "#356048", costaD: "#244234",
      floraL: "#2f6a46", floraD: "#1e4a32", sand: "#b8c4bc", sandD: "#8ea098",
      rock: "#5a6a6e", rockD: "#414f54", snow: "#ffffff", snowD: "#dbe8f2",
    },
    geometry: { ampMul: 1.08, snowShift: -0.5, fjord: 1 },
    // Fiordos: islas boscosas y húmedas cortadas por canales de agua.
    flora: {
      precordillera: ["alerce", "coihue", "manio", "canelo", "bush"],
      valle: ["coihue", "manio", "canelo", "nalca", "colihue", "notro", "arrayan", "lenga", "bush"],
      costa: ["coihue", "manio", "canelo", "nalca", "colihue", "notro", "arrayan", "alerce", "chaura", "bush"],
      playa: ["grass", "rock"],
    },
    fauna: {
      andes: ["condor", "chinchilla"],
      precordillera: ["huemul", "puma", "guanaco"],
      valle: ["huillin", "rana", "pudu", "guina"],
      costa: ["huillin", "chungungo", "pinguino", "chucao", "rana", "pudu", "guina"],
      playa: ["chilla", "flamenco"],
    },
  },
};

// Especies de aves y zorros que se activan con la floración.
export const BLOOM_FAUNA = ["condor", "culpeo", "chilla", "flamenco"];

const BIOME_FREQ = 0.00015; // longitud de onda amplia: regiones de miles de px
const BLOOM_BLOCK = 60000;  // px de mundo por bloque de floración (~22x el original)
const BLOOM_CHANCE = 0.28;  // probabilidad de floración por bloque (raro pero muy extenso)
const BLOOM_FLORA_WEIGHT = 2.5;
const BLOOM_FAUNA_WEIGHT = 1.5;
const BLOOM_CHANCE_MUL = 0.6;

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(a, b, x) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

// Pesos normalizados (suman 1) de cada bioma en una posición de mundo. Cada
// bioma domina en su centro (meseta de 0.5) y se mezcla con el vecino en 0.5.
export function biomeWeights(worldX, seed = 0) {
  const u = fbm1(worldX * BIOME_FREQ, (seed + 4242) >>> 0, 3, 2, 0.5);
  const pos = smoothstep(0.15, 0.85, u) * (BIOME_IDS.length - 0.5); // 0..4.5
  const out = {};
  let total = 0;
  for (let i = 0; i < BIOME_IDS.length; i++) {
    const lo = clamp01((pos - (i - 0.75)) / 0.5);
    const hi = clamp01(((i + 0.75) - pos) / 0.5);
    out[BIOME_IDS[i]] = lo * hi;
    total += lo * hi;
  }
  const t = total || 1;
  for (const id of BIOME_IDS) out[id] /= t;
  return out;
}

// Pesos según el modo: región fija o procedural (`auto`). Memo acotado por
// píxel de mundo (el ruido de bioma varía en miles de px, así que redondear es
// imperceptible) para no recalcular el fBm en cada columna y cada spawn.
const WEIGHTS_CACHE = new Map();
const WEIGHTS_CAP = 4096;

export function modeWeights(mode, worldX, seed = 0) {
  if (BIOME_IDS.includes(mode)) {
    const w = {};
    for (const id of BIOME_IDS) w[id] = id === mode ? 1 : 0;
    return w;
  }
  const key = ((seed >>> 0) + ":" + Math.round(worldX));
  const hit = WEIGHTS_CACHE.get(key);
  if (hit) return hit;
  const w = biomeWeights(worldX, seed);
  if (WEIGHTS_CACHE.size >= WEIGHTS_CAP) WEIGHTS_CACHE.clear();
  WEIGHTS_CACHE.set(key, w);
  return w;
}

// Tinte mezclado por pesos. Solo norte y sur declaran paleta; centro no tiñe.
function tintFor(weights) {
  const acc = {};
  for (const id of BIOME_IDS) {
    const w = weights[id] || 0;
    if (w <= 0) continue;
    const p = BIOMES[id].palette;
    if (!p) continue;
    for (const k in p) {
      if (!acc[k]) acc[k] = { color: p[k], w };
      else {
        const nw = acc[k].w + w;
        acc[k] = { color: lerpColor(acc[k].color, p[k], w / nw), w: nw };
      }
    }
  }
  const out = {};
  for (const k in acc) out[k] = acc[k].color;
  return out;
}

// Geometría mezclada por pesos: multiplicador de amplitud, desplazamiento de la
// línea de nieve y fuerza de fiordos. Centro no cambia nada (1 / 0 / 0).
export function biomeGeometry(weights) {
  let ampMul = 0;
  let snowShift = 0;
  let fjord = 0;
  for (const id of BIOME_IDS) {
    const w = weights[id] || 0;
    if (w <= 0) continue;
    const g = BIOMES[id].geometry || { ampMul: 1, snowShift: 0 };
    ampMul += w * g.ampMul;
    snowShift += w * g.snowShift;
    fjord += w * (g.fjord || 0);
  }
  return { ampMul: ampMul || 1, snowShift, fjord };
}

// Floración de desierto: bloques raros y extensos, solo con presencia de norte.
// La puerta se evalúa en el centro del bloque (`biomeAt`) para que el parche mida
// ~BLOOM_BLOCK y no lo recorte el ancho de las regiones norte.
export function bloomAt(worldX, seed, weights) {
  const gate = weights ? weights.norte || 0 : 0;
  if (gate <= 0.01) return 0;
  const c = Math.floor(worldX / BLOOM_BLOCK);
  if (hash1(c, (seed + 0xb100) >>> 0) > BLOOM_CHANCE) return 0;
  const u = worldX / BLOOM_BLOCK - c; // 0..1 dentro del bloque
  const env = smoothstep(0, 0.15, u) * smoothstep(1, 0.85, u); // meseta con laderas
  return clamp01(gate * env);
}

// Pesos del bioma en el centro del bloque de floración (memo de un bloque).
let bloomCenter = { key: "", weights: null };
function bloomCenterWeights(block, seed, mode) {
  const key = `${mode}:${seed}:${block}`;
  if (bloomCenter.key !== key) {
    bloomCenter = { key, weights: modeWeights(mode, (block + 0.5) * BLOOM_BLOCK, seed) };
  }
  return bloomCenter.weights;
}

// Resuelve la floración según el modo (`auto`/`on`/`off`).
export function resolveBloom(mode, biome) {
  if (mode === "off") return 0;
  if (mode === "on") return (biome.weights.norte || 0) > 0.05 ? 1 : 0;
  return biome.bloom;
}

// Contexto de bioma en una posición de mundo. La floración usa la puerta de
// norte del centro del bloque para que el parche no lo recorte la región norte.
// Memo acotado por (modo, semilla, píxel de mundo): el resultado es puro y de
// solo lectura, así que se reutiliza entre columnas y fotogramas.
const BIOME_CACHE = new Map();
const BIOME_CAP = 4096;

export function biomeAt(worldX, seed = 0, mode = "auto") {
  const key = mode + "|" + (seed >>> 0) + "|" + Math.round(worldX);
  const hit = BIOME_CACHE.get(key);
  if (hit) return hit;
  const weights = modeWeights(mode, worldX, seed);
  const tint = tintFor(weights);
  const amount = 1 - (weights.centro || 0);
  const block = Math.floor(worldX / BLOOM_BLOCK);
  const bloom = bloomAt(worldX, seed, bloomCenterWeights(block, seed, mode));
  const out = { weights, tint, amount, bloom };
  if (BIOME_CACHE.size >= BIOME_CAP) BIOME_CACHE.clear();
  BIOME_CACHE.set(key, out);
  return out;
}

// Pool de flora ponderado por bioma. `fallback` son los `types` de LAYERS (centro).
export function biomeFloraPool(layerName, weights, bloom, fallback) {
  const out = [];
  for (const id of BIOME_IDS) {
    const w = weights[id] || 0;
    if (w <= 0) continue;
    const pool = BIOMES[id].flora?.[layerName] ?? (id === "centro" ? fallback : null);
    if (!pool) continue;
    for (const type of pool) out.push({ type, w });
  }
  if (out.length === 0 && fallback) for (const type of fallback) out.push({ type, w: 1 });
  if (bloom > 0) out.push({ type: "flower", w: bloom * BLOOM_FLORA_WEIGHT });
  return out;
}

// Pool de fauna ponderado por bioma. `fallback` son las `species` de LAYERS (centro).
export function biomeFaunaPool(layerName, weights, bloom, fallback) {
  const out = [];
  for (const id of BIOME_IDS) {
    const w = weights[id] || 0;
    if (w <= 0) continue;
    const pool = BIOMES[id].fauna?.[layerName] ?? (id === "centro" ? fallback : null);
    if (!pool) continue;
    for (const type of pool) out.push({ type, w });
  }
  if (out.length === 0 && fallback) for (const type of fallback) out.push({ type, w: 1 });
  if (bloom > 0) for (const type of BLOOM_FAUNA) out.push({ type, w: bloom * BLOOM_FAUNA_WEIGHT });
  return out;
}

// Multiplicador de densidad de fauna durante la floración.
export function bloomChanceMul(bloom) {
  return 1 + BLOOM_CHANCE_MUL * bloom;
}
