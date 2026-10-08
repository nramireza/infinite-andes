// Flora andina en pixel art: araucaria (pehuén), lenga/ñire, arbustos, rocas y pasto.

import { mulberry32, hashInt, hash1 } from "./rng.js";
import { bankHeight, riverInfluence } from "./terrain.js";
import { shade } from "./palette.js";

const FLOWER_COLORS = ["#e05a9a", "#f2c14e", "#f4f0e6", "#9a6ad0"];

function drawAraucaria(ctx, x, baseY, size, pal, sway) {
  x = Math.round(x);
  baseY = Math.round(baseY);

  const trunkH = Math.max(3, Math.round(size * 0.52));
  const trunkW = Math.max(1, Math.round(size * 0.08));
  const trunkTop = baseY - trunkH;

  // tronco
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - (trunkW >> 1), trunkTop, trunkW, trunkH);

  // copa: cúpula de ramas (silueta de araucaria)
  const crownH = Math.max(3, Math.round(size * 0.62));
  const crownW = Math.max(4, Math.round(size * 0.82));
  const crownTop = baseY - size;
  const halfMax = crownW / 2;

  for (let i = 0; i < crownH; i++) {
    const t = i / crownH; // 0 arriba, 1 abajo
    const profile = Math.pow(t, 0.42);
    const half = Math.max(1, Math.round(halfMax * profile));
    const yy = crownTop + i;
    const off = Math.round(sway * (crownH - i) * 0.16);
    const cx = x + off;

    ctx.fillStyle = pal.floraD;
    ctx.fillRect(cx - half, yy, half * 2, 1);

    // borde iluminado arriba / a la izquierda
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(cx - half, yy, half * 2, 1);
    if (t < 0.42) {
      ctx.fillStyle = pal.floraD;
      ctx.fillRect(cx - half + 1, yy, Math.max(0, half * 2 - 2), 1);
    }

    // "púas" laterales de las ramas
    if (i % 2 === 0) {
      ctx.fillStyle = pal.floraD;
      ctx.fillRect(cx - half - 1, yy, 1, 1);
      ctx.fillRect(cx + half, yy, 1, 1);
    }
  }

  // remate superior
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, crownTop - 1, 2, 1);
}

function drawLenga(ctx, x, baseY, size, pal, warm) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(4, Math.round(size * 0.9));
  const w = Math.max(3, Math.round(size * 0.85));
  const trunkH = Math.max(2, Math.round(size * 0.25));
  const trunkTop = baseY - trunkH;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, trunkTop, 2, trunkH);

  const top = baseY - h;
  const cx = x;
  const cy = top + (h - trunkH) / 2;
  const rx = w / 2;
  const ry = (h - trunkH) / 2;
  const light = warm ? pal.sun : pal.floraL;
  const dark = warm ? pal.sunGlow : pal.floraD;

  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    ctx.fillStyle = dark;
    ctx.fillRect(cx - span, Math.round(cy + dy), span * 2 + 1, 1);
    ctx.fillStyle = light;
    ctx.fillRect(cx - span, Math.round(cy + dy), span * 2 + 1, 1);
    ctx.fillStyle = dark;
    ctx.fillRect(cx - span + Math.max(1, span >> 1), Math.round(cy + dy), Math.max(1, span), 1);
  }
}

function drawBush(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.72));
  const h = Math.max(2, Math.round(size * 0.44));
  for (let r = 0; r < h; r++) {
    const t = (r + 1) / (h + 1);
    const half = Math.max(1, Math.round((w / 2) * Math.sin(t * Math.PI * 0.9) + w * 0.08));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0 || r === h - 1) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
}

function drawGrass(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const n = 2 + Math.floor(size * 0.4);
  for (let i = 0; i < n; i++) {
    const gx = x + i - (n >> 1);
    const gh = 1 + ((i * 7 + Math.floor(x)) % 2);
    ctx.fillStyle = i % 2 ? pal.floraL : pal.floraD;
    ctx.fillRect(gx, baseY - gh, 1, gh);
  }
}

function drawCrop(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(4, Math.round(size * 0.9));
  const h = Math.max(1, Math.round(size * 0.32));
  ctx.fillStyle = pal.valleyD;
  ctx.fillRect(x - (w >> 1), baseY - h, w, h);
  for (let i = 0; i < w; i += 2) {
    ctx.fillStyle = i % 4 === 0 ? pal.valleyL : pal.costaL;
    ctx.fillRect(x - (w >> 1) + i, baseY - h - 1, 1, 1);
  }
}

function drawRock(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.55));
  const h = Math.max(2, Math.round(size * 0.32));
  const profile = [0.45, 0.75, 1, 0.95, 0.7];
  for (let r = 0; r < h; r++) {
    const f = profile[Math.min(r, profile.length - 1)];
    const half = Math.max(1, Math.round((w / 2) * f));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.rockD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0) {
      ctx.fillStyle = pal.rock;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
}

function drawPlant(ctx, x, baseY, size, type, pal, sway, warm) {
  switch (type) {
    case "araucaria": return drawAraucaria(ctx, x, baseY, size, pal, sway);
    case "lenga": return drawLenga(ctx, x, baseY, size, pal, warm);
    case "bush": return drawBush(ctx, x, baseY, size, pal);
    case "crop": return drawCrop(ctx, x, baseY, size, pal);
    case "rock": return drawRock(ctx, x, baseY, size, pal);
    case "flower": return drawFlower(ctx, x, baseY, size, pal, sway);
    case "cactus": return drawCactus(ctx, x, baseY, size, pal);
    case "alerce": return drawAlerce(ctx, x, baseY, size, pal);
    case "nalca": return drawNalca(ctx, x, baseY, size, pal);
    case "colihue": return drawColihue(ctx, x, baseY, size, pal);
    case "palma": return drawPalma(ctx, x, baseY, size, pal);
    default: return drawGrass(ctx, x, baseY, size, pal);
  }
}

// Copao / cactus columnar (norte árido): columna con brazos y espinas.
function drawCactus(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 0.9));
  const top = baseY - h;
  ctx.fillStyle = pal.floraD;
  ctx.fillRect(x - 1, top, 2, h);
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, top, 1, h);

  const dir = hash1(x, 0xcac) < 0.5 ? -1 : 1;
  const armY = top + Math.round(h * 0.35);
  const armH = Math.max(2, Math.round(h * 0.35));
  ctx.fillStyle = pal.floraD;
  ctx.fillRect(x + dir, armY, 1, 1);
  ctx.fillRect(x + dir * 2, armY, 1, armH);

  ctx.fillStyle = pal.sandD;
  for (let i = 1; i < h; i += 3) {
    ctx.fillRect(x - 2, top + i, 1, 1);
    ctx.fillRect(x + 1, top + i + 1, 1, 1);
  }
}

// Alerce: conífera austral alta y estrecha.
function drawAlerce(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(8, Math.round(size * 1.05));
  const trunkH = Math.max(2, Math.round(size * 0.2));
  const top = baseY - h;
  const halfMax = Math.max(2, Math.round(size * 0.32));

  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  for (let i = 0; i < h - trunkH; i++) {
    const t = i / (h - trunkH);
    const half = Math.max(1, Math.round(halfMax * Math.pow(t, 0.6)));
    const yy = top + i;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (i % 2 === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, top - 1, 2, 1);
}

// Nalca / pangue: hojas gigantes en roseta sobre tallos cortos.
function drawNalca(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const n = 3 + Math.floor(size * 0.15);
  for (let i = 0; i < n; i++) {
    const h = hash1(i * 13 + x, 0xaa11);
    const lx = x + Math.round((h - 0.5) * size * 0.8);
    const stemH = Math.max(2, Math.round(size * (0.3 + h * 0.3)));
    ctx.fillStyle = pal.trunk;
    ctx.fillRect(lx, baseY - stemH, 1, stemH);
    const r = Math.max(1, Math.round(size * 0.22));
    const cy = baseY - stemH;
    ctx.fillStyle = pal.floraD;
    for (let dy = -r; dy <= r; dy++) {
      const span = Math.floor(r * Math.sqrt(Math.max(0, 1 - (dy / r) ** 2)));
      ctx.fillRect(lx - span, cy + dy, span * 2 + 1, 1);
    }
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(lx - r, cy - r, r * 2 + 1, 1);
  }
}

// Colihue / quila: cañaveral de tallos finos con hojas.
function drawColihue(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const n = 3 + Math.floor(size * 0.2);
  for (let i = 0; i < n; i++) {
    const h = hash1(i * 17 + x, 0xc01);
    const cxp = x + i - (n >> 1);
    const ch = Math.max(4, Math.round(size * (0.7 + h * 0.5)));
    ctx.fillStyle = pal.trunk;
    ctx.fillRect(cxp, baseY - ch, 1, ch);
    ctx.fillStyle = i % 2 ? pal.floraL : pal.floraD;
    for (let j = 0; j < 4; j++) {
      const ly = baseY - ch + 1 + j * 2;
      const dir = (j + i) % 2 ? 1 : -1;
      ctx.fillRect(cxp + dir, ly, 1, 1);
      ctx.fillRect(cxp + dir * 2, ly + 1, 1, 1);
    }
  }
}

// Palma chilena: tronco esbelto y corona de frondas.
function drawPalma(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const trunkH = Math.max(3, Math.round(size * 0.4));
  const crownY = baseY - trunkH - 1;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  const fronds = [[0, -2], [-2, -1], [2, -1], [-3, 0], [3, 0], [-2, 1], [2, 1], [0, -3]];
  ctx.fillStyle = pal.floraD;
  for (const [dx, dy] of fronds) ctx.fillRect(x + dx, crownY + dy, 1, 1);
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, crownY - 1, 2, 1);
}

// Parche de flores del desierto florido: tallos cortos con corola de 3 px.
function drawFlower(ctx, x, baseY, size, pal, sway) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const n = 2 + Math.floor(size * 0.25);
  for (let i = 0; i < n; i++) {
    const h = hash1(i * 31 + x, 0xf10e);
    const fx = x + Math.round((h - 0.5) * size * 0.9 + sway);
    const stemH = 1 + Math.floor(h * 3);
    const col = FLOWER_COLORS[Math.floor(hash1(i * 7 + x, 0xf1a) * FLOWER_COLORS.length)];
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(fx, baseY - stemH, 1, stemH);
    ctx.fillStyle = col;
    ctx.fillRect(fx, baseY - stemH - 1, 1, 1);
    ctx.fillRect(fx - 1, baseY - stemH, 1, 1);
    ctx.fillRect(fx + 1, baseY - stemH, 1, 1);
  }
}

// Sorteo ponderado de tipo (consume un único `rng()`, como la elección uniforme).
function pickType(pool, rng) {
  let total = 0;
  for (const e of pool) total += e.w;
  if (total <= 0) return pool[0].type;
  let r = rng() * total;
  for (const e of pool) {
    r -= e.w;
    if (r < 0) return e.type;
  }
  return pool[pool.length - 1].type;
}

// Posiciones deterministas de flora por chunk (sin dibujar). El parallax ya está
// aplicado (`sx` es pantalla, `wx` mundo). No depende del tiempo, así es testeable.
export function floraSpawns(layer, camera, W, H, seed, poolAt) {
  const f = layer.flora;
  if (!f) return [];
  const p = layer.parallax;
  const chunkW = f.chunkW || 56;
  const startC = Math.floor((camera.x * p - 80) / chunkW);
  const endC = Math.floor((camera.x * p + W + 80) / chunkW);
  const out = [];

  for (let c = startC; c <= endC; c++) {
    const rng = mulberry32(hashInt(c, (seed + layer.seed * 7) >>> 0));
    const count = Math.floor(rng() * f.maxPer) + (rng() < f.minChance ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const wx = (c + rng()) * chunkW;
      const sx = wx - camera.x * p;
      if (sx < -48 || sx > W + 48) continue;

      if (riverInfluence(layer, wx) > 0.25) continue; // fuera del cauce
      const gy = Math.round(bankHeight(layer, wx));
      if (gy > H + 4) continue;
      const size = f.minSize + rng() * (f.maxSize - f.minSize);
      const pool = poolAt ? poolAt(wx) : null;
      const type = pool && pool.length
        ? pickType(pool, rng)
        : f.types[Math.floor(rng() * f.types.length)];
      const warm = rng() < 0.4;
      out.push({ wx, sx, gy, size, type, warm });
    }
  }
  return out;
}

export function placeFlora(ctx, layer, pal, camera, W, H, seed, tSec, poolAt) {
  if (!layer.flora) return;
  if (layer.darken) {
    pal = {
      ...pal,
      floraL: shade(pal.floraL, -layer.darken),
      floraD: shade(pal.floraD, -layer.darken),
      trunk: shade(pal.trunk, -layer.darken),
      rock: shade(pal.rock, -layer.darken),
      rockD: shade(pal.rockD, -layer.darken),
      sun: shade(pal.sun, -layer.darken * 0.5),
      sunGlow: shade(pal.sunGlow, -layer.darken * 0.5),
    };
  }
  for (const s of floraSpawns(layer, camera, W, H, seed, poolAt)) {
    const sway = Math.sin(tSec * 0.9 + s.wx * 0.05);
    drawPlant(ctx, s.sx, s.gy, s.size, s.type, pal, sway, s.warm);
  }
}
