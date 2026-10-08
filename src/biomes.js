// Biomas de Chile: norte árido, centro y sur boscoso. Deterministas por semilla.
// El bioma cambia de forma procedural al recorrer (`biomeWeights`) o se fija con
// `?biome=`. Solo tiñe paleta y compone flora/fauna; no toca la geometría del ruido.
// El norte admite el evento de "desierto florido" (`bloomAt`).

import { fbm1 } from "./noise.js";
import { hash1, hashInt } from "./rng.js";
import { lerpColor } from "./palette.js";

export const BIOME_IDS = ["norte", "centro", "sur"];

// Tintes por bioma: solo claves de terreno/flora/suelo (nunca cielo ni astros).
export const BIOMES = {
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
      valle: ["lenga", "nalca", "colihue", "coihue", "roble", "michay", "copihue", "araucaria", "bush"],
      costa: ["lenga", "coihue", "roble", "alerce", "nalca", "colihue", "copihue", "michay", "araucaria", "bush"],
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

// Pesos normalizados (suman 1) de cada bioma en una posición de mundo.
export function biomeWeights(worldX, seed = 0) {
  const u = fbm1(worldX * BIOME_FREQ, (seed + 4242) >>> 0, 3, 2, 0.5);
  const pos = smoothstep(0.15, 0.85, u) * 2.5; // 0..2.5
  const norte = clamp01((0.75 - pos) / 0.5);
  const sur = clamp01((pos - 1.75) / 0.5);
  const centro = clamp01((pos - 0.25) / 0.5) * clamp01((2.25 - pos) / 0.5);
  const total = norte + centro + sur || 1;
  return { norte: norte / total, centro: centro / total, sur: sur / total };
}

// Pesos según el modo: región fija o procedural (`auto`).
export function modeWeights(mode, worldX, seed = 0) {
  if (BIOME_IDS.includes(mode)) {
    const w = { norte: 0, centro: 0, sur: 0 };
    w[mode] = 1;
    return w;
  }
  return biomeWeights(worldX, seed);
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

// Geometría mezclada por pesos: multiplicador de amplitud y desplazamiento de la
// línea de nieve. Centro no cambia nada (1 / 0).
export function biomeGeometry(weights) {
  let ampMul = 0;
  let snowShift = 0;
  for (const id of BIOME_IDS) {
    const w = weights[id] || 0;
    if (w <= 0) continue;
    const g = BIOMES[id].geometry || { ampMul: 1, snowShift: 0 };
    ampMul += w * g.ampMul;
    snowShift += w * g.snowShift;
  }
  return { ampMul: ampMul || 1, snowShift };
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
export function biomeAt(worldX, seed = 0, mode = "auto") {
  const weights = modeWeights(mode, worldX, seed);
  const tint = tintFor(weights);
  const amount = 1 - (weights.centro || 0);
  const block = Math.floor(worldX / BLOOM_BLOCK);
  const bloom = bloomAt(worldX, seed, bloomCenterWeights(block, seed, mode));
  return { weights, tint, amount, bloom };
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
