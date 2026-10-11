// Rasterizador 2D mínimo para las galerías de arte (sin canvas ni navegador).
// Soporta `fillStyle` (hex) + `fillRect` + `globalAlpha`, que es todo lo que usan
// los `DRAWERS` de flora y las matrices de fauna.

export function parseHex(v) {
  const s = typeof v === "string" ? v.trim() : "";
  if (s[0] === "#") {
    if (s.length === 4) return [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16), 255];
    if (s.length === 7) return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 255];
  }
  return [255, 0, 255, 255];
}

export function fill(buf, W, H, color) {
  const [r, g, b, a] = parseHex(color);
  for (let o = 0; o < buf.length; o += 4) {
    buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = a;
  }
}

export function makeCtx(buf, W, H) {
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

export function blit(dst, dstW, src, srcW, srcH, dx, dy) {
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

// Escalado por vecino más cercano (entero) para revisar los sprites.
export function zoom(buf, W, H, Z) {
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
