// Momentos raros y deterministas: eventos ocasionales que rompen la rutina.
//
// `18sep` (ambiente patrio + papelitos), `leorey` (cumbia), `kungleo` (su alter
// ego de Mortal Kombat), `condor` (vuelo amplio con escolta), `bandada`
// (parvada en formación) y `manada` (guanacos trotando). El disparo es
// determinista por (semilla, x) y puede forzarse con `?moment=` o desde el
// panel. Solo es visual.

import { mulberry32, hashInt, hash1 } from "./rng.js";
import { LAYERS, bankHeight } from "./terrain.js";
import { px } from "./pixel.js";

export const MOMENT_IDS = ["18sep", "leorey", "kungleo", "condor", "bandada", "manada"];
const SPACING = 9000; // px de mundo entre posibles momentos
const CHANCE = 0.22;  // probabilidad por bloque
const TRICOLOR = ["#0039a6", "#ffffff", "#d52b1e"];

function costa() {
  return LAYERS.find((l) => l.name === "costa");
}

// Eventos de momento visibles para una cámara (sin dibujar).
export function momentEvents(seed, camera, W) {
  const chunkSeed = (seed ^ 0x1e0e) >>> 0;
  const c0 = Math.floor((camera.x - 240) / SPACING);
  const c1 = Math.floor((camera.x + W + 240) / SPACING);
  const out = [];
  for (let c = c0; c <= c1; c++) {
    const rng = mulberry32(hashInt(c, chunkSeed));
    if (rng() > CHANCE) continue;
    const type = MOMENT_IDS[Math.floor(rng() * MOMENT_IDS.length)];
    const wx = (c + 0.2 + rng() * 0.6) * SPACING;
    out.push({ type, wx });
  }
  return out;
}

function eventsFor(mode, seed, camera, W) {
  if (mode === "auto") return momentEvents(seed, camera, W);
  if (!MOMENT_IDS.includes(mode)) return [];
  return [{ type: mode, wx: camera.x + W * 0.5 }];
}

// --- 18 de septiembre: ambiente patrio y papelitos -------------------------

function patrioticSky(ctx, W, H, tSec) {
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#d52b1e";
  ctx.fillRect(0, 0, W, Math.round(H * 0.26));
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, Math.round(H * 0.26), W, Math.round(H * 0.16));
  ctx.globalAlpha = 1;

  for (let i = 0; i < 70; i++) {
    const h = hash1(i, 0x18ce);
    const drift = 8 + h * 26;
    const x = ((i * 149 + tSec * drift) % (W + 24)) - 12;
    const y = (hash1(i, 0x5e9) * H * 0.55 + tSec * (6 + h * 14)) % (H * 0.62);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = TRICOLOR[i % 3];
    ctx.fillRect(Math.round(x), Math.round(y), 2, 3);
  }
  ctx.globalAlpha = 1;
}

// --- Personajes (matrices de píxeles) --------------------------------------

const LEO_PAL = { h: "#1a1a22", s: "#d9a066", g: "#f2c14e", k: "#141419" };
const KUNG_PAL = { h: "#1a1a22", s: "#d9a066", g: "#f2c14e", r: "#c62828", m: "#c0c6d0" };

// Leo Rey: lentes de sol, pelo ondulado y traje dorado.
const LEO_FRAMES = [
  [
    "..h.h.h..",
    ".hhhhhh..",
    "hhhhhhh..",
    ".sssss...",
    ".skkss...",
    "..sss....",
    "..ggg....",
    ".ggggg...",
    "ggggggg..",
    ".gg.gg...",
    "..g.g....",
    "..g.g....",
  ],
  [
    "...h.h...",
    "..hhhhh..",
    "..hhhhhh.",
    "...sssss.",
    "..sskks..",
    "...sss...",
    "...ggg...",
    "..gggggg.",
    "..ggggg..",
    "..gg.gg..",
    "..g...g..",
    "..g...g..",
  ],
];

// Kung Leo: cinta roja, sombrero de Kung Lao y postura de pelea.
const KUNG_FRAMES = [
  [
    "..mmmm...",
    ".mmmmm...",
    "..rrr....",
    ".sssss...",
    ".skkss...",
    "..sss....",
    "..ggg..m.",
    ".ggggg.m.",
    "gg.ggg.m.",
    ".g.g.g...",
    "..g.g....",
    "..g.g....",
  ],
  [
    "..mmmm...",
    ".mmmmm...",
    "..rrr....",
    "...sssss.",
    "..sskks..",
    "...sss...",
    ".m..ggg..",
    ".m.ggggg.",
    ".mggg.gg.",
    "...g.g...",
    "..g...g..",
    "..g...g..",
  ],
];

function drawMatrix(ctx, rows, colors, left, top, flip) {
  const w = Math.max(...rows.map((r) => r.length));
  for (let ry = 0; ry < rows.length; ry++) {
    const row = rows[ry];
    for (let rx = 0; rx < row.length; rx++) {
      const ch = row[rx];
      if (ch === "." || ch === " ") continue;
      const col = colors[ch];
      if (!col) continue;
      const dx = flip ? w - 1 - rx : rx;
      px(ctx, left + dx, top + ry, col);
    }
  }
}

// --- Fuente mínima 3x5 para el destello "MORTAL KUMBIA" --------------------

const FONT = {
  A: ["###", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  O: ["###", "#.#", "#.#", "#.#", "###"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  " ": ["...", "...", "...", "...", "..."],
};

export function drawText(ctx, text, left, top, color, scale = 1) {
  let cx = left;
  for (const raw of text.toUpperCase()) {
    const glyph = FONT[raw];
    if (glyph) {
      for (let ry = 0; ry < glyph.length; ry++) {
        for (let rx = 0; rx < glyph[ry].length; rx++) {
          if (glyph[ry][rx] !== "#") continue;
          ctx.fillStyle = color;
          ctx.fillRect(cx + rx * scale, top + ry * scale, scale, scale);
        }
      }
    }
    cx += 4 * scale;
  }
}

function drawCharacter(ctx, rows, palMap, pal, left, top, flip) {
  const colors = {};
  for (const ch in palMap) {
    const key = palMap[ch];
    colors[ch] = key.startsWith("#") ? key : pal[key] || "#000000";
  }
  drawMatrix(ctx, rows, colors, left, top, flip);
}

function drawLeo(ctx, pal, left, top, s, tSec) {
  const sway = Math.round(Math.sin(tSec * 3 + s.phase) * 1);
  const nFrames = LEO_FRAMES.length;
  const fi = ((Math.floor(tSec * 3 + s.phase) % nFrames) + nFrames) % nFrames;
  drawCharacter(ctx, LEO_FRAMES[fi], LEO_PAL, pal, left + sway, top, s.dir < 0);
  // notas musicales ascendentes
  for (let i = 0; i < 3; i++) {
    const p = (tSec * 0.6 + i / 3 + s.phase * 0.1) % 1;
    const nx = left + (s.dir < 0 ? -4 - i * 2 : 9 + i * 2);
    const ny = top - Math.round(p * 16);
    ctx.globalAlpha = 0.85 * (1 - p);
    px(ctx, Math.round(nx), Math.round(ny), pal.star);
    px(ctx, Math.round(nx), Math.round(ny) - 1, pal.star);
    px(ctx, Math.round(nx) + 1, Math.round(ny) - 2, pal.star);
  }
  ctx.globalAlpha = 1;
}

function drawKungLeo(ctx, pal, left, top, s, tSec) {
  const nFrames = KUNG_FRAMES.length;
  const fi = ((Math.floor(tSec * 6 + s.phase) % nFrames) + nFrames) % nFrames;
  drawCharacter(ctx, KUNG_FRAMES[fi], KUNG_PAL, pal, left, top, s.dir < 0);
  // sombrero lanzado (proyectil que va y vuelve)
  const reach = 16 + Math.sin(tSec * 2 + s.phase) * 8;
  const hx = Math.round(left + (s.dir < 0 ? -reach : 9 + reach));
  const hy = Math.round(top - 4 + Math.sin(tSec * 3 + s.phase) * 2);
  px(ctx, hx, hy, "#c0c6d0");
  px(ctx, hx + 1, hy, "#e2e6ee");
  px(ctx, hx + 2, hy, "#c0c6d0");
  // destello "MORTAL KUMBIA" intermitente
  if (Math.sin(tSec * 2.4 + s.phase) > 0.1) {
    const text = "MORTAL KUMBIA";
    const w = text.length * 4 - 1;
    drawText(ctx, text, Math.round(left - w / 2 + 4), Math.round(top - 22), pal.sun, 1);
  }
}

// --- Vuelo de cóndor: planeo amplio con un par de escoltas -----------------

const CONDOR_PAL = { d: "trunk", k: "snow" };
const CONDOR_FRAMES = [
  [
    "...d.......d...",
    "..ddd.....ddd..",
    ".dddddddddddddd",
    "ddddddddddddddd",
    "...d.kddddk.d..",
    ".....dddddd....",
    "......dddd.....",
  ],
  [
    "....dd...dd....",
    "...dddddddddd..",
    "..dddddddddddd.",
    "..dddddddddddd.",
    "....kddddddk...",
    "......dddd.....",
    "......d..d.....",
  ],
];

function condorFrame(t, phase, i = 0) {
  return ((Math.floor(t * 2.2 + phase + i * 0.5) % 2) + 2) % 2;
}

function drawCondorFlight(ctx, pal, ev, camera, W, tSec, layer) {
  const base = ev.wx - camera.x * layer.parallax;
  if (base < -80 || base > W + 80) return;
  const s = hash1(Math.round(ev.wx), 0x3e0) * Math.PI * 2;
  const x = base + Math.sin(tSec * 0.22 + s) * W * 0.32; // planeo largo
  const y = 26 + Math.sin(tSec * 0.6 + s) * 6;
  drawCharacter(ctx, CONDOR_FRAMES[condorFrame(tSec, s)], CONDOR_PAL, pal, Math.round(x), Math.round(y), false);
  for (let i = 1; i <= 2; i++) {
    ctx.globalAlpha = 0.8;
    drawCharacter(ctx, CONDOR_FRAMES[condorFrame(tSec, s, i)], CONDOR_PAL, pal,
      Math.round(x - i * 11), Math.round(y - 3 - i * 2), false);
    ctx.globalAlpha = 1;
  }
}

// --- Bandada: parvada en formación en V -----------------------------------

function drawBandada(ctx, pal, ev, camera, W, tSec, layer) {
  const base = ev.wx - camera.x * layer.parallax;
  if (base < -100 || base > W + 100) return;
  const s = hash1(Math.round(ev.wx), 0x4e0) * Math.PI * 2;
  const x = base + Math.sin(tSec * 0.18 + s) * W * 0.3;
  const y = 38 + Math.sin(tSec * 0.5 + s) * 5;
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 1 : -1;
    const k = Math.ceil(i / 2);
    const bx = Math.round(x + side * k * 5);
    const by = Math.round(y + k * 3);
    const flap = Math.sin(tSec * 6 + i) > 0 ? 0 : 1;
    px(ctx, bx, by, pal.trunk);
    px(ctx, bx - 1, by + 1 + flap, pal.trunk);
    px(ctx, bx + 1, by + 1 + flap, pal.trunk);
  }
}

// --- Manada: guanacos trotando --------------------------------------------

const GUANACO_PAL = { b: "trunk", l: "sand", h: "trunk" };
const GUANACO_FRAMES = [
  [
    "...bb...",
    "..bbbb..",
    ".bbbbbb.",
    "bbbbbbh.",
    ".b..b...",
    ".l..l...",
  ],
  [
    "...bb...",
    "..bbbb..",
    ".bbbbbb.",
    "bbbbbbh.",
    "..b..b..",
    ".l...l..",
  ],
];

function drawManada(ctx, pal, ev, camera, W, tSec, layer) {
  const s = hash1(Math.round(ev.wx), 0x5e0) * Math.PI * 2;
  for (let i = 0; i < 3; i++) {
    const wx = ev.wx + (i - 1) * 9;
    const left = Math.round(wx - camera.x * layer.parallax);
    if (left < -20 || left > W + 20) continue;
    const top = Math.round(bankHeight(layer, wx) - 6 + Math.sin(tSec * 4 + i) * 0.5);
    const fi = ((Math.floor(tSec * 4 + s + i * 0.3) % 2) + 2) % 2;
    drawCharacter(ctx, GUANACO_FRAMES[fi], GUANACO_PAL, pal, left, top, false);
  }
}

// --- Entradas públicas -----------------------------------------------------

// Capa de cielo: ambiente patrio y aves en vuelo. Se dibuja por delante de las nubes.
export function momentSky(ctx, pal, camera, W, H, seed, tSec, mode) {
  if (mode === "none") return;
  const evs = eventsFor(mode, seed, camera, W);
  const layer = costa();
  for (const ev of evs) {
    if (ev.type === "18sep") patrioticSky(ctx, W, H, tSec);
    else if (ev.type === "condor" && layer) drawCondorFlight(ctx, pal, ev, camera, W, tSec, layer);
    else if (ev.type === "bandada" && layer) drawBandada(ctx, pal, ev, camera, W, tSec, layer);
  }
}

// Capa de suelo: personajes y manadas. Se dibuja por delante del terreno.
export function momentGround(ctx, pal, camera, W, H, seed, tSec, mode) {
  if (mode === "none") return;
  const layer = costa();
  if (!layer) return;
  const p = layer.parallax;
  for (const ev of eventsFor(mode, seed, camera, W)) {
    if (ev.type === "manada") { drawManada(ctx, pal, ev, camera, W, tSec, layer); continue; }
    if (ev.type !== "leorey" && ev.type !== "kungleo") continue;
    const left = Math.round(ev.wx - camera.x * p);
    if (left < -40 || left > W + 40) continue;
    const ground = bankHeight(layer, ev.wx);
    const top = Math.round(ground - 12);
    const s = { phase: hash1(Math.round(ev.wx), 0x1e0) * Math.PI * 2, dir: hash1(Math.round(ev.wx), 0x2e0) < 0.5 ? -1 : 1 };
    if (ev.type === "leorey") drawLeo(ctx, pal, left, top, s, tSec);
    else drawKungLeo(ctx, pal, left, top, s, tSec);
  }
}
