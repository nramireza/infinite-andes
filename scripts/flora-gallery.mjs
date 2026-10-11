// Galería de diagnóstico de la flora: dibuja cada `DRAWERS` aislado sobre un
// fondo neutro y compone hojas de contacto (día/noche) + PNG por especie.
// Sin dependencias ni navegador. Uso: `npm run gallery` (salida en gallery/).

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { FLORA, DRAWERS } from "../src/flora.js";
import { getPalette } from "../src/palette.js";
import { encodePNG } from "./lib/png.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "gallery", "flora");

const TILE_W = 46;
const TILE_H = 68;
const GAP = 6;
const PAD = 8;
const COLS = 6;
const GROUND = TILE_H - 12;
const BG = "#0e1622";
const GROUND_COL = "#24303f";

function parseHex(v) {
  const s = typeof v === "string" ? v.trim() : "";
  if (s[0] === "#") {
    if (s.length === 4) return [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16), 255];
    if (s.length === 7) return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 255];
  }
  return [255, 0, 255, 255];
}

function fill(buf, W, H, color) {
  const [r, g, b, a] = parseHex(color);
  for (let o = 0; o < buf.length; o += 4) {
    buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = a;
  }
}

function makeCtx(buf, W, H) {
  return {
    fillStyle: "#000000",
    globalAlpha: 1,
    fillRect(x, y, w, h) {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      const col = parseHex(this.fillStyle);
      const a = Math.min(1, Math.max(0, this.globalAlpha)) * (col[3] / 255);
      const ia = 1 - a;
      for (let yy = y; yy < y + h; yy++) {
        if (yy < 0 || yy >= H) continue;
        for (let xx = x; xx < x + w; xx++) {
          if (xx < 0 || xx >= W) continue;
          const o = (yy * W + xx) * 4;
          buf[o] = Math.round(col[0] * a + buf[o] * ia);
          buf[o + 1] = Math.round(col[1] * a + buf[o + 1] * ia);
          buf[o + 2] = Math.round(col[2] * a + buf[o + 2] * ia);
          buf[o + 3] = 255;
        }
      }
    },
  };
}

function drawTile(type, pal, season) {
  const buf = Buffer.alloc(TILE_W * TILE_H * 4);
  fill(buf, TILE_W, TILE_H, BG);
  const ctx = makeCtx(buf, TILE_W, TILE_H);
  ctx.fillStyle = GROUND_COL;
  ctx.fillRect(PAD, GROUND, TILE_W - PAD * 2, 1);
  const size = Math.min(30, Math.max(6, Math.round(12 * (FLORA[type]?.height ?? 1))));
  const fn = DRAWERS[type] || DRAWERS.grass;
  fn(ctx, TILE_W / 2, GROUND, size, pal, { sway: 0, warm: true, season, night: 0 });
  return buf;
}

function blit(dst, dstW, src, srcW, srcH, dx, dy) {
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const so = (y * srcW + x) * 4;
      const do_ = ((dy + y) * dstW + (dx + x)) * 4;
      dst[do_] = src[so];
      dst[do_ + 1] = src[so + 1];
      dst[do_ + 2] = src[so + 2];
      dst[do_ + 3] = src[so + 3];
    }
  }
}

// Escalado por vecino más cercano (entero) para poder revisar los sprites.
function zoom(buf, W, H, Z) {
  const out = Buffer.alloc(W * Z * H * Z * 4);
  for (let y = 0; y < H * Z; y++) {
    for (let x = 0; x < W * Z; x++) {
      const so = (Math.floor(y / Z) * W + Math.floor(x / Z)) * 4;
      const do_ = (y * W * Z + x) * 4;
      out[do_] = buf[so];
      out[do_ + 1] = buf[so + 1];
      out[do_ + 2] = buf[so + 2];
      out[do_ + 3] = buf[so + 3];
    }
  }
  return out;
}

function sheet(types, pal, season) {
  const rows = Math.ceil(types.length / COLS);
  const W = PAD * 2 + COLS * TILE_W + (COLS - 1) * GAP;
  const H = PAD * 2 + rows * TILE_H + (rows - 1) * GAP;
  const buf = Buffer.alloc(W * H * 4);
  fill(buf, W, H, "#080c14");
  types.forEach((type, i) => {
    const tile = drawTile(type, pal, season);
    const cx = PAD + (i % COLS) * (TILE_W + GAP);
    const cy = PAD + Math.floor(i / COLS) * (TILE_H + GAP);
    blit(buf, W, tile, TILE_W, TILE_H, cx, cy);
  });
  return { buf, W, H };
}

const types = Object.keys(DRAWERS);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const type of types) {
  const day = drawTile(type, getPalette(12, "clear"), 0);
  writeFileSync(join(OUT, `flora-${type}.png`), encodePNG(TILE_W * 4, TILE_H * 4, zoom(day, TILE_W, TILE_H, 4)));
}

for (const [name, hour, season] of [["contact-dia", 12, 0], ["contact-noche", 23, 0], ["contact-otono", 12, 1]]) {
  const { buf, W, H } = sheet(types, getPalette(hour, "clear"), season);
  writeFileSync(join(OUT, `${name}.png`), encodePNG(W * 2, H * 2, zoom(buf, W, H, 2)));
}

const legend = types.map((t, i) => `${String(i + 1).padStart(2)}. ${t}`).join("\n");
writeFileSync(join(OUT, "orden.txt"), legend + "\n");
console.log(`Galería de flora: ${types.length} tipos -> gallery/flora/`);
console.log(legend);
