// Genera los íconos PWA (192 y 512) sin dependencias: dibuja un pixel-art
// fijo (16×16) y lo escala por factor entero. Uso: `npm run icons`.

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { encodePNG } from "./lib/png.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "icons");

// Escena nocturna mínima: luna, montaña nevada y estrellas. El arte se mantiene
// dentro del margen seguro para que el recorte circular (maskable) no lo corte.
const ART = [
  "..........*.....",
  "..*...........*.",
  ".....MMM........",
  "....MMMMM.......",
  "....MMMMM.......",
  ".....MMM........",
  "...*............",
  "................",
  "..........S.....",
  ".........SSS....",
  "........SDDS....",
  ".......SDDDDS...",
  "...D..DDDDDDD...",
  "..DDDDDDDDDDDD..",
  ".DDDDDDDDDDDDDD.",
  "................",
];

// Colores por carácter (RGBA). `.` = cielo de fondo.
const COLORS = {
  ".": [0x0b, 0x14, 0x20, 255],
  "*": [0x7f, 0xa8, 0xc9, 255],
  M: [0xf4, 0xe9, 0xc8, 255],
  D: [0x24, 0x40, 0x5c, 255],
  S: [0xdb, 0xe7, 0xf2, 255],
};

function raster(size) {
  const factor = size / ART.length;
  if (!Number.isInteger(factor)) throw new Error(`escala no entera para ${size}`);
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const src = ART[Math.floor(y / factor)];
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = COLORS[src[Math.floor(x / factor)]] || COLORS["."];
      const o = (y * size + x) * 4;
      buf[o] = r;
      buf[o + 1] = g;
      buf[o + 2] = b;
      buf[o + 3] = a;
    }
  }
  return buf;
}

mkdirSync(OUT, { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(join(OUT, `icon-${size}.png`), encodePNG(size, size, raster(size)));
  console.log(`icons/icon-${size}.png`);
}
