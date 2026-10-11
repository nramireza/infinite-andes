// Galería de diagnóstico de la flora: dibuja cada `DRAWERS` aislado sobre un
// fondo neutro y compone hojas de contacto (día/noche) + PNG por especie.
// Sin dependencias ni navegador. Uso: `npm run gallery` (salida en gallery/).

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { FLORA, DRAWERS } from "../src/flora.js";
import { getPalette } from "../src/palette.js";
import { encodePNG } from "./lib/png.mjs";
import { fill, makeCtx, blit, zoom } from "./lib/raster.mjs";

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
