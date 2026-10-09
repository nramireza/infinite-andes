// Geografía de Chile central, vista desde el mar hacia los Andes.
// 6 capas con parallax: Andes · Precordillera · Valle · Costa · Playa · Mar.

import { fbm1, ridged1 } from "./noise.js";
import { hash1 } from "./rng.js";
import { shade, lerpColor } from "./palette.js";

export const SEA_Y = 242;

// `rugged`: peso del ruido ridged (crestas afiladas). Bajo = colinas suaves.
// `snowFrac`: altura (fracción de amp) desde la que aparece nieve; >=1.4 = sin nieve.
export const LAYERS = [
  {
    name: "andes", parallax: 0.07, baseY: 128, amp: 92, freq: 0.0032, seed: 101,
    rugged: 0.78, snowFrac: 0.22, lightKey: "farL", darkKey: "farD", alpha: 0.8,
    volcano: { spacing: 600, height: 58 }, rocky: true,
    fauna: { chunkW: 220, chance: 0.25, species: ["condor", "chinchilla"] },
  },
  {
    name: "precordillera", parallax: 0.16, baseY: 158, amp: 50, freq: 0.0060, seed: 211,
    rugged: 0.7, snowFrac: 0.94, lightKey: "midL", darkKey: "midD", alpha: 0.9,
    flora: { chunkW: 84, minSize: 5, maxSize: 10, minChance: 0.2, maxPer: 1, types: ["araucaria"] },
    fauna: { chunkW: 200, chance: 0.3, species: ["huemul", "guanaco", "vicuna"] },
  },
  {
    name: "valle", parallax: 0.32, baseY: 200, amp: 20, freq: 0.012, seed: 307,
    rugged: 0.12, snowFrac: 1.4, lightKey: "valleyL", darkKey: "valleyD", alpha: 0.97, fields: true,
    rivers: { spacing: 1100, chance: 0.45, width: 3.2, depth: 7, wfreq: 4.2 },
    flora: { chunkW: 40, minSize: 5, maxSize: 12, minChance: 0.75, maxPer: 5, types: ["crop", "crop", "bush", "grass", "araucaria", "palma", "coihue", "roble", "michay"] },
    fauna: { chunkW: 150, chance: 0.5, species: ["pudu", "huemul", "guina", "culpeo", "chingue", "huillin"] },
  },
  {
    name: "costa", parallax: 0.52, baseY: 226, amp: 12, freq: 0.010, seed: 419,
    rugged: 0.05, snowFrac: 1.4, lightKey: "costaL", darkKey: "costaD", alpha: 1,
    rivers: { spacing: 1500, chance: 0.4, width: 2.1, depth: 5, wfreq: 4.5 },
    flora: { chunkW: 44, minSize: 8, maxSize: 18, minChance: 0.8, maxPer: 4, types: ["lenga", "lenga", "bush", "araucaria", "palma", "coihue", "roble", "copihue", "michay"] },
    fauna: { chunkW: 160, chance: 0.55, species: ["pudu", "guina", "culpeo", "chilla", "monito", "choroy", "cachana", "rana", "huillin"] },
  },
  {
    name: "playa", parallax: 0.78, baseY: 232, amp: 7, freq: 0.020, seed: 523,
    rugged: 0.1, snowFrac: 1.4, lightKey: "sand", darkKey: "sandD", alpha: 1, beach: true,
    flora: { chunkW: 50, minSize: 4, maxSize: 8, minChance: 0.5, maxPer: 3, types: ["grass", "rock", "grass"] },
    fauna: { chunkW: 200, chance: 0.3, species: ["chilla", "flamenco"] },
  },
  {
    name: "mar", parallax: 1.0, baseY: SEA_Y, amp: 6, freq: 0.05, seed: 631,
    rugged: 0.2, snowFrac: 1.4, lightKey: "sea", darkKey: "seaD", alpha: 1, sea: true,
    fauna: { chunkW: 240, chance: 0.35, species: ["chungungo", "pinguino"] },
  },
];

function LSeed(layer) {
  return layer._seed !== undefined ? layer._seed : layer.seed;
}

// Geometría por bioma: sampler opcional `(wx) -> { ampMul, snowShift }`. Sin sampler
// (tests y dorados) el factor es 1 y la nieve no se desplaza.
let biomeGeo = null;

export function setBiomeGeometry(fn) {
  biomeGeo = fn || null;
}

function ampMulAt(wx) {
  return biomeGeo ? biomeGeo(wx).ampMul : 1;
}

function snowShiftAt(wx) {
  return biomeGeo ? biomeGeo(wx).snowShift : 0;
}

// Mezcla la semilla del usuario en cada capa para que el paisaje cambie.
export function seedLayers(seed) {
  const s = seed >>> 0;
  for (const l of LAYERS) l._seed = (l.seed + Math.imul(s, 0x9e3779b1)) >>> 0;
  clearColumnCaches();
}

function baseNoise(layer, wx) {
  const s = LSeed(layer);
  const f = fbm1(wx * layer.freq + s * 0.37, s, 4, 2.0, 0.5);
  const r = ridged1(wx * layer.freq * 1.7 + s, s + 5, 3);
  const rug = layer.rugged ?? 0.5;
  return f * (1 - rug) + r * rug;
}

// Aporte de altura de volcanes cónicos deterministas.
function volcanoAdd(layer, wx) {
  if (!layer.volcano) return 0;
  const s = LSeed(layer);
  const V = layer.volcano.spacing;
  const c0 = Math.floor(wx / V) - 1;
  let add = 0;
  for (let c = c0; c <= c0 + 2; c++) {
    if (hash1(c, s + 555) > 0.32) continue;
    const xc = c * V + hash1(c, s + 556) * V;
    const rad = V * (0.16 + hash1(c, s + 557) * 0.12);
    const d = Math.abs(wx - xc);
    if (d > rad) continue;
    const peak = layer.volcano.height * (0.8 + hash1(c, s + 558) * 0.6);
    add = Math.max(add, peak * Math.pow(1 - d / rad, 1.1));
  }
  return add;
}

// Altura del terreno SIN el tallado del río (nivel de los bancos).
export function bankHeight(layer, wx) {
  const n = baseNoise(layer, wx);
  return layer.baseY - (n * layer.amp * ampMulAt(wx) + volcanoAdd(layer, wx));
}

// Influencia 0..1 del cauce en una columna (muesca de entrada del río).
export function riverInfluence(layer, wx) {
  const R = layer.rivers;
  if (!R) return 0;
  const s = LSeed(layer);
  const V = R.spacing;
  const c0 = Math.floor(wx / V) - 1;
  const halfW = R.width * 2.2;
  let infl = 0;
  for (let c = c0; c <= c0 + 2; c++) {
    if (hash1(c, s + 911) > R.chance) continue;
    const xc = c * V + hash1(c, s + 912) * V;
    const d = Math.abs(wx - xc);
    if (d > halfW) continue;
    infl = Math.max(infl, Math.pow(1 - d / halfW, 1.6));
  }
  return infl;
}

function riverCarve(layer, wx) {
  return layer.rivers ? layer.rivers.depth * riverInfluence(layer, wx) : 0;
}

export function ridgeHeight(layer, wx) {
  return bankHeight(layer, wx) + riverCarve(layer, wx);
}

// Ancho del agua según la profundidad `u` (0 nacimiento, 1 desembocadura).
// Conicidad: angosto arriba, más ancho abajo, con una ondulación leve.
function channelHalf(layer, seed, u) {
  const R = layer.rivers;
  const taper = 0.45 + 0.95 * u;
  const wobble = 0.12 * Math.sin(u * R.wfreq + seed * 5);
  return Math.max(0.6, R.width * (taper + wobble));
}

// Eventos de río visibles para una cámara: centro en x y semilla del meandro.
export function riverEvents(layer, camera, W) {
  const R = layer.rivers;
  if (!R) return [];
  const p = layer.parallax;
  const s = LSeed(layer);
  const V = R.spacing;
  const c0 = Math.floor((camera.x * p - 80) / V);
  const c1 = Math.floor((camera.x * p + W + 80) / V);
  const out = [];
  for (let c = c0; c <= c1; c++) {
    if (hash1(c, s + 911) > R.chance) continue;
    out.push({ xc: c * V + hash1(c, s + 912) * V, seed: hash1(c, s + 913) });
  }
  return out;
}

// Canal de agua de una quebrada: centrado en la muesca (`ev.xc`), sin meandro en
// profundidad, para que el cauce quede dentro del tallado y herede su parallax.
// Brota en el fondo de la muesca y se ensancha al bajar; el borde oscuro lo integra.
function drawChannel(ctx, layer, pal, camera, W, H) {
  const R = layer.rivers;
  const p = layer.parallax;
  const water = lerpColor(pal.sea, pal.seaHi, 0.3);
  const bank = shade(water, -0.42);

  for (const ev of riverEvents(layer, camera, W)) {
    const cx = ev.xc - camera.x * p;
    const A = layer.amp * ampMulAt(ev.xc);
    const topRef = layer.baseY - A;
    const botRef = layer.baseY + A;
    const y0 = Math.max(0, Math.round(topRef));
    const y1 = Math.min(H, Math.round(botRef));
    for (let y = y0; y < y1; y++) {
      const u = (y - topRef) / (botRef - topRef);
      const hw = channelHalf(layer, ev.seed, u);
      const left = Math.round(cx - hw);
      const right = Math.round(cx + hw);
      if (right < -2 || left > W + 2) continue;
      const rim = Math.sin(y * 0.5 + ev.seed * 8) > 0.55;
      for (let sx = left - 1; sx <= right + 1; sx++) {
        if (sx < 0 || sx >= W) continue;
        const wx = camera.x * p + sx;
        if (y < ridgeHeight(layer, wx)) continue; // no flota sobre el valle/cielo
        let col;
        if (sx <= left || sx >= right) col = bank;
        else if (rim && (sx === left + 1 || sx === right - 1)) col = pal.seaHi;
        else col = water;
        ctx.fillStyle = col;
        ctx.fillRect(sx, y, 1, 1);
      }
    }
  }
}

// --- Caché de geometría por columna -----------------------------------------
// `ridgeHeight`, la nieve de detalle y las vetas de roca son funciones puras de
// (capa, semilla, wx). Cada fotograma muestrea ~W píxeles de mundo consecutivos
// y los siguientes se solapan, así que al hacer scroll las columnas se repiten:
// se memoizan por píxel de mundo (tolerancia ≤1 px). La nieve por estación se
// compone aparte para que el cache valga aunque cambie la estación.
const COL_CAP = 4096;

export function clearColumnCaches() {
  for (const l of LAYERS) {
    delete l._col;
    delete l._field;
  }
}

function rockVein(wx, s, vi, depth) {
  const path = fbm1(wx * 0.02 + vi * 37, s + 41 + vi * 13, 2);
  return { off: Math.floor(path * depth), two: path > 0.62 };
}

function columnAt(layer, wx, s) {
  let cache = layer._col;
  if (!cache) cache = layer._col = new Map();
  const key = Math.round(wx);
  const hit = cache.get(key);
  if (hit) return hit;

  const A = layer.amp * ampMulAt(wx);
  const y = Math.round(ridgeHeight(layer, wx));
  const jitter = layer.snowFrac < 1.4 ? Math.floor(fbm1(wx * 0.22, s + 7, 2) * 6) : 0;
  let rock = null;
  if (layer.rocky) {
    const depth = A * 0.72;
    rock = [rockVein(wx, s, 0, depth), rockVein(wx, s, 1, depth)];
  }
  const col = { A, y, jitter, rock };
  if (cache.size >= COL_CAP) {
    let drop = COL_CAP >> 2;
    for (const k of cache.keys()) {
      cache.delete(k);
      if (--drop <= 0) break;
    }
  }
  cache.set(key, col);
  return col;
}

// Máscara de campos por fila (no depende de wx): se calcula una vez por capa.
function fieldMask(layer, s, H) {
  let m = layer._field;
  if (!m || m.length !== H) {
    m = layer._field = new Float32Array(H);
    for (let row = 0; row < H; row++) m[row] = fbm1(Math.floor(row * 0.14), s + 71, 2);
  }
  return m;
}

export function drawLayer(ctx, layer, pal, camera, W, H) {
  const p = layer.parallax;
  let light = pal[layer.lightKey];
  let dark = pal[layer.darkKey];
  if (layer.darken) {
    light = shade(light, -layer.darken);
    dark = shade(dark, -layer.darken);
  }
  const snow = pal.snow;
  const snowD = pal.snowD;
  const s = LSeed(layer);

  // vetas de roca integradas en la perspectiva atmosférica
  const rockA = lerpColor(pal.rock, dark, 0.55);
  const rockB = lerpColor(pal.rockD, dark, 0.6);

  ctx.globalAlpha = layer.alpha;

  const fields = layer.fields ? fieldMask(layer, s, H) : null;

  for (let sx = 0; sx < W; sx++) {
    const wx = camera.x * p + sx;
    const col = columnAt(layer, wx, s);
    const A = col.A;
    // la nieve solo se desplaza en capas que ya la tienen
    const sf = layer.snowFrac < 1.4 ? layer.snowFrac + snowShiftAt(wx) : layer.snowFrac;
    const snowThr = A * sf;
    const band = Math.max(2, A * 0.22);
    let y = col.y;
    if (y > H) y = H;

    ctx.fillStyle = dark;
    ctx.fillRect(sx, y, 1, H - y);
    ctx.fillStyle = light;
    ctx.fillRect(sx, y, 1, band);

    const tx = hash1(Math.floor(wx), s);
    if (tx > 0.82) {
      ctx.fillStyle = light;
      ctx.fillRect(sx, y + band + Math.floor(tx * 9), 1, 2);
    } else if (tx < 0.14) {
      ctx.fillStyle = dark;
      ctx.fillRect(sx, y + band + 2, 1, 3);
    }

    let snowBottom = 0;
    if (snowThr > 0 && sf < 1.4) {
      const hgt = layer.baseY - y;
      if (hgt > snowThr) {
        const depth = Math.min(A * 0.36, (hgt - snowThr) * 0.9 + 2);
        const jitter = col.jitter;
        const d = Math.max(1, Math.round(depth - jitter));
        ctx.fillStyle = snow;
        ctx.fillRect(sx, y, 1, d);
        ctx.fillStyle = snowD;
        ctx.fillRect(sx, y + d, 1, 1 + Math.floor(jitter * 0.5));
        snowBottom = d + 1;
      }
    }

    // estratos de roca: vetas continuas bajo la nieve (capas marcadas rocky)
    if (layer.rocky) {
      const base = y + snowBottom;
      for (let vi = 0; vi < 2; vi++) {
        const vein = col.rock[vi];
        ctx.globalAlpha = layer.alpha * 0.75;
        ctx.fillStyle = vi === 0 ? rockA : rockB;
        ctx.fillRect(sx, base + vein.off, 1, vein.two ? 2 : 1);
        ctx.globalAlpha = layer.alpha;
      }
    }

    // textura de campos en el valle central
    if (fields) {
      for (let row = y + 7; row < H; row += 7) {
        const m = fields[row];
        if (m > 0.58) {
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = m > 0.74 ? pal.costaL : pal.valleyL;
          ctx.fillRect(sx, row, 1, 3);
          ctx.globalAlpha = layer.alpha;
        }
      }
    }
  }

  // canal meándrico del río, dentro de la propia capa
  if (layer.rivers) drawChannel(ctx, layer, pal, camera, W, H);

  // línea de marea (arena húmeda) en la playa
  if (layer.beach) {
    ctx.fillStyle = shade(pal.sandD, -0.12);
    for (let sx = 0; sx < W; sx++) {
      const wx = camera.x * p + sx;
      const w = Math.round(SEA_Y - 5 + (fbm1(wx * 0.06, 321, 2) - 0.5) * 4);
      ctx.fillRect(sx, w, 1, SEA_Y - w + 1);
    }
  }

  ctx.globalAlpha = 1;

  if (layer.volcano) drawPlumes(ctx, layer, pal, camera, W, H);
}

// Penachos sutiles sobre los volcanes de los Andes.
function drawPlumes(ctx, layer, pal, camera, W, H) {
  const V = layer.volcano.spacing;
  const p = layer.parallax;
  const s = LSeed(layer);
  const startC = Math.floor((camera.x * p - 40) / V) - 1;
  const endC = Math.floor((camera.x * p + W + 40) / V) + 1;
  const col = pal.cloudHi;
  for (let c = startC; c <= endC; c++) {
    if (hash1(c, s + 555) > 0.32) continue;
    const xc = c * V + hash1(c, s + 556) * V;
    const sx = xc - camera.x * p;
    if (sx < -60 || sx > W + 60) continue;
    const peakY = ridgeHeight(layer, xc);
    const seed = hash1(c, s + 559);
    for (let i = 0; i < 6; i++) {
      const t = i / 6;
      const drift = Math.sin(seed * 10 + i * 0.9) * 4 + t * 10;
      const px = sx + drift;
      const py = peakY - 4 - i * 5;
      const r = 2.4 + i * 0.7;
      ctx.globalAlpha = 0.22 * (1 - t * 0.7);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(Math.round(px), Math.round(py), r, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// Reflejo del astro sobre el agua: columna de brillo con destellos animados.
function drawReflection(ctx, pal, W, H, tSec, cel) {
  if (!cel) return;
  const cx = Math.round(cel.x);
  const col = lerpColor(pal.sea, pal.sunGlow, 0.55);
  const hi = lerpColor(col, pal.sun, 0.5);
  const maxHalf = 14;
  for (let y = SEA_Y; y < H; y++) {
    const t = (y - SEA_Y) / (H - SEA_Y);
    const half = Math.round(maxHalf * (0.35 + t * 0.9));
    for (let sx = cx - half; sx <= cx + half; sx++) {
      if (sx < 0 || sx >= W) continue;
      const d = Math.abs(sx - cx) / (half + 1);
      const wave = Math.sin(y * 0.7 + tSec * 2.2 + sx * 0.35);
      if (wave < 0.35) continue;
      const a = (1 - d) * 0.28 * (0.5 + 0.5 * Math.sin(tSec * 1.3 + y * 0.5));
      if (a <= 0.02) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = d < 0.3 ? hi : col;
      ctx.fillRect(sx, y, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

// El mar: oleaje, espuma y gradiente de profundidad. `cel` (opcional) añade el
// reflejo del astro; `wind` (0..1) agita la superficie.
export function drawSea(ctx, pal, camera, W, H, tSec, cel, wind = 0) {
  const p = LAYERS[5].parallax;
  const amp = 1 + wind * 0.45;
  const speed = 1 + wind * 0.8;
  for (let sx = 0; sx < W; sx++) {
    const wx = camera.x * p + sx;
    const w = fbm1(wx * 0.035, 4321, 3);
    const top = Math.round(SEA_Y + (w - 0.5) * 8 * amp);

    ctx.fillStyle = pal.seaD;
    ctx.fillRect(sx, top, 1, H - top);
    ctx.fillStyle = pal.sea;
    ctx.fillRect(sx, top, 1, 9);

    const crest = Math.sin(wx * 0.11 + tSec * 1.4 * speed) + Math.sin(wx * 0.05 - tSec * 0.9 * speed);
    if (crest > 0.9 - wind * 0.3) {
      ctx.fillStyle = pal.seaHi;
      ctx.fillRect(sx, top, 1, 2);
      if (crest > 1.5 - wind * 0.45) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sx, top, 1, 1);
      }
    }
    if (w > 0.72 && crest > 0.2) {
      ctx.fillStyle = pal.seaHi;
      ctx.fillRect(sx, top + 3 + Math.floor(w * 4), 1, 1);
    }
    if (wind > 0.55 && crest > 1.1) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx, top - 1, 1, 1);
    }
  }

  drawReflection(ctx, pal, W, H, tSec, cel);
}


