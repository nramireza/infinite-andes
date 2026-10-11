// Galería de diagnóstico de la fauna: dibuja las matrices de `SPECIES` (ambos
// frames) sobre fondo neutro y compone hojas de contacto + PNG por especie.
// Sin dependencias ni navegador. Uso: `npm run gallery:fauna` (salida en gallery/fauna).

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { SPECIES } from "../src/fauna.js";
import { getPalette } from "../src/palette.js";
import { encodePNG } from "./lib/png.mjs";
import { fill, makeCtx, blit, zoom } from "./lib/raster.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "gallery", "fauna");

const TILE_W = 68;
const TILE_H = 40;
const GAP = 6;
const PAD = 8;
const COLS = 5;
const GROUND = TILE_H - 10;
const BG = "#0e1622";
const GROUND_COL = "#24303f";

function spriteColors(species, pal) {
  const out = {};
  for (const ch in species.palette) {
    const key = species.palette[ch];
    out[ch] = key.startsWith("#") ? key : pal[key] || "#000000";
  }
  return out;
}

function drawRows(ctx, rows, colors, left, top, flip) {
  const w = Math.max(...rows.map((r) => r.length));
  for (let ry = 0; ry < rows.length; ry++) {
    const row = rows[ry];
    for (let rx = 0; rx < row.length; rx++) {
      const ch = row[rx];
      if (ch === "." || ch === " ") continue;
      const col = colors[ch];
      if (!col) continue;
      const dx = flip ? w - 1 - rx : rx;
      ctx.fillStyle = col;
      ctx.fillRect(left + dx, top + ry, 1, 1);
    }
  }
}

function frameSize(rows) {
  return { w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}

function drawTile(type, pal) {
  const buf = Buffer.alloc(TILE_W * TILE_H * 4);
  fill(buf, TILE_W, TILE_H, BG);
  const ctx = makeCtx(buf, TILE_W, TILE_H);
  ctx.fillStyle = GROUND_COL;
  ctx.fillRect(PAD, GROUND, TILE_W - PAD * 2, 1);

  const sp = SPECIES[type];
  const colors = spriteColors(sp, pal);
  const frames = sp.frames.slice(0, 2);
  const slots = frames.length;
  frames.forEach((rows, i) => {
    const { w, h } = frameSize(rows);
    const cx = slots === 1 ? TILE_W / 2 : TILE_W * (0.3 + 0.4 * i);
    const top = GROUND - h;
    drawRows(ctx, rows, colors, Math.round(cx - w / 2), top, false);
  });
  return buf;
}

function sheet(types, pal) {
  const rows = Math.ceil(types.length / COLS);
  const W = PAD * 2 + COLS * TILE_W + (COLS - 1) * GAP;
  const H = PAD * 2 + rows * TILE_H + (rows - 1) * GAP;
  const buf = Buffer.alloc(W * H * 4);
  fill(buf, W, H, "#080c14");
  types.forEach((type, i) => {
    const tile = drawTile(type, pal);
    const cx = PAD + (i % COLS) * (TILE_W + GAP);
    const cy = PAD + Math.floor(i / COLS) * (TILE_H + GAP);
    blit(buf, W, tile, TILE_W, TILE_H, cx, cy);
  });
  return { buf, W, H };
}

const types = Object.keys(SPECIES);
const pal = getPalette(12, "clear");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const type of types) {
  const tile = drawTile(type, pal);
  writeFileSync(join(OUT, `fauna-${type}.png`), encodePNG(TILE_W * 8, TILE_H * 8, zoom(tile, TILE_W, TILE_H, 8)));
}

const { buf, W, H } = sheet(types, pal);
writeFileSync(join(OUT, "contact.png"), encodePNG(W * 4, H * 4, zoom(buf, W, H, 4)));

const legend = types.map((t, i) => `${String(i + 1).padStart(2)}. ${t} (${SPECIES[t].common})`).join("\n");
writeFileSync(join(OUT, "orden.txt"), legend + "\n");
console.log(`Galería de fauna: ${types.length} tipos -> gallery/fauna/`);
console.log(legend);
