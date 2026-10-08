// Utilidades de dibujo pixel-art: sprites desde matrices y primitivas.

export function bakeSprite(rows, palette) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (!ch || ch === " " || ch === ".") continue;
      const col = palette[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return { canvas: c, w, h };
}

export function drawSprite(ctx, sprite, x, y, scale = 1, flip = false) {
  x = Math.round(x);
  y = Math.round(y);
  const w = sprite.w * scale;
  const h = sprite.h * scale;
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.save();
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite.canvas, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(sprite.canvas, x, y, w, h);
  }
  ctx.imageSmoothingEnabled = prev;
}

export function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(0, Math.round(w)), Math.max(0, Math.round(h)));
}

// Círculo relleno rasterizado a píxeles (sin antialias).
export function disc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  const r2 = r * r;
  for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) {
    const span = Math.floor(Math.sqrt(Math.max(0, r2 - y * y)));
    ctx.fillRect(Math.round(cx - span), Math.round(cy + y), span * 2 + 1, 1);
  }
}

export function radixDither(x, y, seed = 0) {
  const n = (x * 374761393 + y * 668265263 + seed * 2246822519) >>> 0;
  let h = (n ^ (n >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
