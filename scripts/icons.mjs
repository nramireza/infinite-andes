// Genera los íconos PWA (192 y 512) sin dependencias: dibuja un pixel-art
// fijo (16×16) y lo escala por factor entero, codificando el PNG a mano
// (zlib + CRC32). Uso: `npm run icons`.

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

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

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(rows, width, height) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filtro "none"
    const row = rows[y];
    for (let x = 0; x < width; x++) {
      const c = row[x];
      raw[o++] = c[0];
      raw[o++] = c[1];
      raw[o++] = c[2];
      raw[o++] = c[3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profundidad de bit
  ihdr[9] = 6; // color RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function scale(size) {
  const factor = size / ART.length;
  if (!Number.isInteger(factor)) throw new Error(`escala no entera para ${size}`);
  const rows = [];
  for (let y = 0; y < size; y++) {
    const src = ART[Math.floor(y / factor)];
    const row = [];
    for (let x = 0; x < size; x++) {
      const ch = src[Math.floor(x / factor)];
      row.push(COLORS[ch] || COLORS["."]);
    }
    rows.push(row);
  }
  return rows;
}

mkdirSync(OUT, { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(join(OUT, `icon-${size}.png`), encodePNG(scale(size), size, size));
  console.log(`icons/icon-${size}.png`);
}
