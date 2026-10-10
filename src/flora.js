// Flora andina en pixel art: araucaria (pehuén), lenga/ñire, arbustos, rocas y pasto.

import { mulberry32, hashInt, hash1 } from "./rng.js";
import { bankHeight, riverInfluence } from "./terrain.js";
import { shade, lerpColor } from "./palette.js";

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

// Ramas desnudas (invierno): tallos diagonales desde la punta del tronco.
function drawBareBranches(ctx, x, top, h, pal) {
  ctx.fillStyle = pal.trunk;
  for (const [dir, len, wave] of [[-1, 0.8, 0.5], [0, 1.0, 0], [1, 0.7, -0.5]]) {
    const steps = Math.max(2, Math.round(h * len));
    let bx = x;
    for (let i = 0; i < steps; i++) {
      const yy = top + steps - i;
      bx = x + Math.round(dir * (i * 0.35 + (i % 2) * wave));
      ctx.fillRect(bx, yy, 1, 1);
    }
    if (dir !== 0 && steps > 3) ctx.fillRect(bx + dir, top + Math.round(steps * 0.4), 1, 1);
  }
}

function drawLenga(ctx, x, baseY, size, pal, warm, season = 0) {
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

  if (season === 2) {
    // Invierno: copa desnuda, solo ramas.
    drawBareBranches(ctx, x, top, h - trunkH, pal);
    return;
  }

  for (let dy = -ry; dy <= ry; dy++) {
    // Otoño: hojas que se caen (huecos deterministas en la copa).
    if (season === 1 && hash1(Math.floor(x) * 7 + Math.round(dy) + 0x1e, 0xa7e) < 0.32) continue;
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    ctx.fillStyle = dark;
    ctx.fillRect(cx - span, Math.round(cy + dy), span * 2 + 1, 1);
    ctx.fillStyle = light;
    ctx.fillRect(cx - span, Math.round(cy + dy), span * 2 + 1, 1);
    ctx.fillStyle = dark;
    ctx.fillRect(cx - span + Math.max(1, span >> 1), Math.round(cy + dy), Math.max(1, span), 1);
  }

  if (season === 3) {
    // Primavera: brotes claros en la punta de la copa.
    ctx.fillStyle = light;
    ctx.fillRect(cx - 2, Math.round(cy - ry), 1, 1);
    ctx.fillRect(cx + 1, Math.round(cy - ry) + 1, 1, 1);
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

function drawPlant(ctx, x, baseY, size, type, pal, sway, warm, season = 0, night = 0) {
  switch (type) {
    case "araucaria": return drawAraucaria(ctx, x, baseY, size, pal, sway);
    case "lenga": return drawLenga(ctx, x, baseY, size, pal, warm, season);
    case "bush": return drawBush(ctx, x, baseY, size, pal);
    case "crop": return drawCrop(ctx, x, baseY, size, pal);
    case "rock": return drawRock(ctx, x, baseY, size, pal);
    case "flower": return drawFlower(ctx, x, baseY, size, pal, sway, night);
    case "cactus": return drawCactus(ctx, x, baseY, size, pal);
    case "alerce": return drawAlerce(ctx, x, baseY, size, pal);
    case "nalca": return drawNalca(ctx, x, baseY, size, pal);
    case "colihue": return drawColihue(ctx, x, baseY, size, pal);
    case "palma": return drawPalma(ctx, x, baseY, size, pal);
    case "coihue": return drawCoihue(ctx, x, baseY, size, pal);
    case "roble": return drawRoble(ctx, x, baseY, size, pal, season);
    case "copihue": return drawCopihue(ctx, x, baseY, size, pal, season);
    case "michay": return drawMichay(ctx, x, baseY, size, pal, season);
    case "chaura": return drawChaura(ctx, x, baseY, size, pal);
    case "quillay": return drawQuillay(ctx, x, baseY, size, pal, season);
    case "manio": return drawManio(ctx, x, baseY, size, pal);
    case "canelo": return drawCanelo(ctx, x, baseY, size, pal, season);
    case "arrayan": return drawArrayan(ctx, x, baseY, size, pal, season);
    case "notro": return drawNotro(ctx, x, baseY, size, pal, season);
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

// Coihue: copa ancha y redondeada sobre tronco recto.
function drawCoihue(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 1.0));
  const trunkH = Math.max(2, Math.round(size * 0.3));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.46));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x + 1, yy, span, 1);
  }
}

// Roble: copa más estrecha y erguida. Caducifolio: en invierno queda desnudo y
// en otoño pierde hojas (huecos deterministas).
function drawRoble(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 1.15));
  const trunkH = Math.max(2, Math.round(size * 0.28));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  const crownH = h - trunkH;
  if (season === 2) {
    drawBareBranches(ctx, x, top, crownH, pal);
    return;
  }
  const halfMax = Math.max(2, Math.round(size * 0.3));
  for (let i = 0; i < crownH; i++) {
    if (season === 1 && hash1(Math.floor(x) * 11 + i + 0x2f, 0xb3e) < 0.3) continue;
    const t = i / crownH;
    const half = Math.max(1, Math.round(halfMax * Math.sin((0.25 + 0.75 * t) * Math.PI)));
    const yy = top + i;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x + 1, yy, half, 1);
  }
  if (season === 3) {
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - 2, top - 1, 1, 1);
    ctx.fillRect(x + 1, top - 2, 1, 1);
  }
}

// Copihue: enredadera con tallo ondulado y campanas rojas colgantes.
// Las campanas florecen en verano y primavera; en otoño/invierno solo queda la enredadera.
function drawCopihue(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.95));
  const top = baseY - h;
  for (let i = 0; i < h; i++) {
    const yy = baseY - i;
    const off = Math.round(Math.sin(i * 0.6) * 1.5);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x + off, yy, 1, 1);
    if (i % 3 === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x + off + (i % 2 ? 1 : -1), yy, 1, 1);
    }
  }
  if (season !== 0 && season !== 3) return;
  const n = 2 + Math.floor(size * 0.12);
  for (let i = 0; i < n; i++) {
    const yy = top + Math.round(((i + 1) / (n + 1)) * h);
    const off = Math.round(Math.sin((baseY - yy) * 0.6) * 1.5);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x + off, yy, 1, 1);
    ctx.fillStyle = "#d94f6a";
    ctx.fillRect(x + off, yy + 1, 1, 2);
    ctx.fillRect(x + off - 1, yy + 2, 1, 1);
    ctx.fillRect(x + off + 1, yy + 2, 1, 1);
  }
}

// Michay: arbusto espinoso con flores naranjas en primavera y verano.
function drawMichay(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.7));
  const h = Math.max(3, Math.round(size * 0.5));
  for (let r = 0; r < h; r++) {
    const t = (r + 1) / (h + 1);
    const half = Math.max(1, Math.round((w / 2) * Math.sin(t * Math.PI * 0.9) + w * 0.08));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
  ctx.fillStyle = pal.floraD;
  ctx.fillRect(x - (w >> 1) - 1, baseY - h + 1, 1, 1);
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.12);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 23 + x, 0xb011);
    const fx = x + Math.round((hh - 0.5) * w * 0.9);
    const fy = baseY - h - 1 - (i % 2);
    ctx.fillStyle = "#e8912a";
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(fx, fy + 1, 1, 1);
  }
}

// Chaura (Gaultheria mucronata): arbusto achaparrado del sotobosque con bayas
// blanco-rosadas, perenne todo el año.
function drawChaura(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.6));
  const h = Math.max(2, Math.round(size * 0.42));
  for (let r = 0; r < h; r++) {
    const t = (r + 1) / (h + 1);
    const half = Math.max(1, Math.round((w / 2) * Math.sin(t * Math.PI * 0.9) + w * 0.08));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
  const n = 1 + Math.floor(size * 0.14);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 29 + x, 0x0c4);
    const fx = x + Math.round((hh - 0.5) * w * 0.9);
    const fy = baseY - h - 1 - (i % 2);
    ctx.fillStyle = "#f2d8e8";
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillStyle = "#d97a9a";
    ctx.fillRect(fx, fy - 1, 1, 1);
  }
}

// Quillay (Quillaja saponaria): árbol esclerófilo de copa redondeada; florece
// (motas blancas) en primavera y verano.
function drawQuillay(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.85));
  const trunkH = Math.max(2, Math.round(size * 0.22));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.4));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    if (hash1(Math.floor(x) * 5 + yy, 0x9111) < 0.4) {
      ctx.fillStyle = pal.floraD;
      ctx.fillRect(x + 1, yy, span, 1);
    }
  }
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.1);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 37 + x, 0x9112);
    const fy = top + 1 + Math.round(((i + 1) / (n + 1)) * crownH);
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(x + Math.round((hh - 0.5) * rx * 1.6), fy, 1, 1);
  }
}

// Mañío (Podocarpus): conífera austral de copa estrecha, oscura y colgante.
function drawManio(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(7, Math.round(size * 1.0));
  const trunkH = Math.max(2, Math.round(size * 0.18));
  const top = baseY - h;
  const halfMax = Math.max(2, Math.round(size * 0.3));
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  for (let i = 0; i < h - trunkH; i++) {
    const t = i / (h - trunkH);
    const half = Math.max(1, Math.round(halfMax * (0.35 + 0.65 * Math.sin(t * Math.PI))));
    const yy = top + i;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    if (i % 3 === 0 || t < 0.18) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    }
    if (i % 2 === 1) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half - 1, yy, 1, 1);
      ctx.fillRect(x + half + 1, yy, 1, 1);
    }
  }
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, top - 1, 2, 1);
}

// Canelo (Drimys winteri): siempreverde de copa densa; flor blanca en primavera/verano.
function drawCanelo(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 0.95));
  const trunkH = Math.max(2, Math.round(size * 0.24));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.36));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    // brillo de hoja lustrosa
    if ((yy + span) % 3 === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    }
  }
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.1);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 41 + x, 0xc0e);
    ctx.fillStyle = "#f6f2e6";
    ctx.fillRect(x + Math.round((hh - 0.5) * rx * 1.7), top + 1 + (i % Math.max(1, crownH)), 1, 1);
  }
}

// Arrayán (Luma apiculata): tronco canela rojizo y copa menuda; flor blanca.
function drawArrayan(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.8));
  const trunkH = Math.max(3, Math.round(size * 0.34));
  const top = baseY - h;
  ctx.fillStyle = "#8a4a3a";
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.32));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - span, yy, Math.max(1, span), 1);
  }
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.1);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 43 + x, 0xa77a);
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(x + Math.round((hh - 0.5) * rx * 1.6), top + 1 + (i % 3), 1, 1);
  }
}

// Notro / ciruelillo (Embothrium coccineum): ramilletes de flores rojas.
function drawNotro(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.85));
  const trunkH = Math.max(2, Math.round(size * 0.26));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  const crownH = h - trunkH;
  const rx = Math.max(2, Math.round(size * 0.34));
  const ry = crownH / 2;
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, Math.round(cy + dy), span * 2 + 1, 1);
  }
  if (season !== 0 && season !== 3) return;
  const n = 2 + Math.floor(size * 0.14);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 47 + x, 0x07e0);
    const fx = x + Math.round((hh - 0.5) * rx * 1.8);
    const fy = baseY - Math.round(2 + hh * crownH);
    ctx.fillStyle = "#d1401e";
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillStyle = "#f26a2a";
    ctx.fillRect(fx + 1, fy - (i % 2), 1, 1);
  }
}

// Parche de flores del desierto florido: manto amplio (~10x el área del racimo
// original) de tallos cortos con corola de 3 px, en dos filas de profundidad.
// De noche (`night` 0..1) las corolas se apagan hacia el cielo nocturno.
function drawFlower(ctx, x, baseY, size, pal, sway, night = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = size * 2.6;
  const n = 6 + Math.floor(size * 0.7);
  const dim = Math.min(1, Math.max(0, night)) * 0.85;
  for (let i = 0; i < n; i++) {
    const h = hash1(i * 31 + x, 0xf10e);
    const back = hash1(i * 53 + x, 0xf10f) < 0.45 ? 1 : 0; // fila de fondo
    const fx = x + Math.round((h - 0.5) * w + sway) - back;
    const stemH = 1 + Math.floor(h * 4);
    const base = FLOWER_COLORS[Math.floor(hash1(i * 7 + x, 0xf1a) * FLOWER_COLORS.length)];
    const col = dim > 0 ? lerpColor(base, pal.skyTop, dim) : base;
    const yy = baseY - back;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(fx, yy - stemH, 1, stemH);
    ctx.fillStyle = col;
    ctx.fillRect(fx, yy - stemH - 1, 1, 1);
    ctx.fillRect(fx - 1, yy - stemH, 1, 1);
    ctx.fillRect(fx + 1, yy - stemH, 1, 1);
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
      // Las flores de la floración se reparten hacia el interior de la banda
      // visible de la capa (no solo en el contorno). El hash no consume rng.
      let depth = 0;
      if (type === "flower") {
        const d = hash1(Math.floor(wx * 0.5), 0xf100);
        depth = Math.round(d * (layer.amp || 12) * 1.3);
      }
      out.push({ wx, sx, gy, size, type, warm, depth });
    }
  }
  return out;
}

// `season` (opcional) = índice de estación para las variantes (hojas, brotes, flores);
// `night` (opcional) = 0..1 para apagar las corolas del desierto de noche.
// El spawn no cambia: solo varía el dibujo, así los dorados de flora quedan intactos.
export function placeFlora(ctx, layer, pal, camera, W, H, seed, tSec, poolAt, season, night) {
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
  const seasonIdx = Number.isInteger(season) ? season : 0;
  const nightAmt = Number.isFinite(night) ? Math.min(1, Math.max(0, night)) : 0;
  for (const s of floraSpawns(layer, camera, W, H, seed, poolAt)) {
    const sway = Math.sin(tSec * 0.9 + s.wx * 0.05);
    const gy = s.depth ? Math.min(H - 2, s.gy + s.depth) : s.gy;
    drawPlant(ctx, s.sx, gy, s.size, s.type, pal, sway, s.warm, seasonIdx, nightAmt);
  }
}
