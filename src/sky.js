// Cielo: gradiente, estrellas, aurora austral, astros (sol/luna) y nubes.
//
// Los astros siguen una trayectoria de FONDO a FRENTE: nacen tras los Andes,
// pasan fuera de pantalla a mediodía/medianoche, y se ponen sobre el mar.

import { mulberry32, hash1 } from "./rng.js";
import { disc } from "./pixel.js";

const RISE = 6.5; // hora de salida
const SET = 18.5; // hora de puesta
const BACK_HORIZON = 118;  // horizonte tras los Andes
const FRONT_HORIZON = 212; // línea del mar (frente)

const METEOR_PERIOD = 5.5; // segundos entre posibles estrellas fugaces
const METEOR_DUR = 0.7;    // duración del trazo

// Estrella fugaz determinista para un instante dado; null si no hay ninguna.
// Posición y dirección en fracciones de ancho/alto del cielo, así no depende de W/H.
export function meteorAt(seed, tSec) {
  if (!Number.isFinite(tSec) || tSec < 0) return null;
  const s = (seed ^ 0x7e70) >>> 0;
  const block = Math.floor(tSec / METEOR_PERIOD);
  if (hash1(block, s) > 0.55) return null;
  const t0 = tSec - block * METEOR_PERIOD;
  if (t0 > METEOR_DUR) return null;
  const p = t0 / METEOR_DUR; // 0..1
  const dir = hash1(block, s + 1) < 0.5 ? -1 : 1;
  const x0 = 0.12 + hash1(block, s + 2) * 0.76;
  const y0 = 0.04 + hash1(block, s + 3) * 0.34;
  const dx = dir * (0.05 + hash1(block, s + 4) * 0.07);
  const dy = 0.03 + hash1(block, s + 5) * 0.04;
  return { x: x0 + dx * p, y: y0 + dy * p, dx, dy, alpha: Math.sin(p * Math.PI) };
}

export class Sky {
  constructor(seed) {
    this.seed = seed;
    this.stars = [];
    const rng = mulberry32(hash1(1, (seed ^ 0x51ed) >>> 0));
    for (let i = 0; i < 110; i++) {
      this.stars.push({ x: rng(), y: rng() * 0.62, b: 0.3 + rng() * 0.7, p: rng() * Math.PI * 2 });
    }
    this.clouds = [];
    const r2 = mulberry32(hash1(2, (seed ^ 0x77aa) >>> 0));
    for (let i = 0; i < 14; i++) {
      this.clouds.push({ x: r2() * 4000, y: 18 + r2() * 90, w: 34 + r2() * 90, s: 0.5 + r2() * 0.7 });
    }
  }

  // Estado del astro para una hora dada. `depth` 0 = fondo (tras los Andes),
  // 1 = frente (sobre el mar).
  celestial(hour24, W, H) {
    const h = ((hour24 % 24) + 24) % 24;
    let u, isSun;
    if (h >= RISE && h < SET) {
      isSun = true;
      u = (h - RISE) / (SET - RISE);
    } else {
      isSun = false;
      const nh = h >= SET ? h - SET : h + 24 - SET; // 0..(24-SET+RISE)
      u = nh / (24 - SET + RISE);
    }
    const horizonY = BACK_HORIZON + u * (FRONT_HORIZON - BACK_HORIZON);
    const A = 245;
    const y = horizonY - A * Math.sin(u * Math.PI);
    const x = W * 0.5;
    const r = 3 + u * 4;
    // Solo se ve al SALIR (u < 0.5). Al ponerse queda tras la cámara.
    const rising = u < 0.5;
    const visible = rising && y > -26 && y < H + 26;
    return { isSun, u, x, y, r, depth: u, horizonY, rising, visible };
  }

  draw(ctx, W, H, pal, nightAmt, tSec, cel) {
    const horizon = Math.round(H * 0.56);
    const top = ctx.createLinearGradient(0, 0, 0, horizon);
    top.addColorStop(0, pal.skyTop);
    top.addColorStop(0.62, pal.skyMid);
    top.addColorStop(1, pal.skyHorizon);
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, horizon);
    ctx.fillStyle = pal.skyHorizon;
    ctx.fillRect(0, horizon, W, H - horizon);

    if (nightAmt > 0.15) this.drawMilkyWay(ctx, W, H, pal, nightAmt);
    if (nightAmt > 0.02) this.drawStars(ctx, W, H, pal, nightAmt, tSec);
    if (nightAmt > 0.35) this.drawAurora(ctx, W, nightAmt, tSec);
    this.drawShootingStars(ctx, W, H, pal, nightAmt, tSec);

    this.drawGlow(ctx, pal, cel, W, H);
  }

  // Estrella fugaz ocasional: cabeza brillante con cola que se desvanece.
  drawShootingStars(ctx, W, H, pal, nightAmt, tSec) {
    if (nightAmt <= 0.25) return;
    const m = meteorAt(this.seed, tSec);
    if (!m) return;
    const span = H * 0.56;
    const hx = m.x * W;
    const hy = m.y * span;
    const tx = hx - m.dx * W;
    const ty = hy - m.dy * span;
    const steps = 9;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = Math.round(hx + (tx - hx) * t);
      const y = Math.round(hy + (ty - hy) * t);
      if (x < 0 || x >= W || y < 0 || y > span) continue;
      ctx.globalAlpha = m.alpha * (1 - t) * nightAmt;
      ctx.fillStyle = i === 0 ? pal.snow : pal.star;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  // Resplandor cálido/frío cerca del horizonte según el astro esté bajo.
  drawGlow(ctx, pal, cel, W, H) {
    if (!cel || !cel.rising) return;
    const dy = Math.abs(cel.y - cel.horizonY);
    const low = Math.max(0, 1 - dy / 90);
    if (low <= 0.02) return;
    const gy = Math.max(-10, Math.min(H, cel.y));
    const base = cel.isSun ? 0.9 : 0.42;
    const layers = [
      [64, base * 0.05],
      [38, base * 0.1],
      [22, base * 0.2],
      [12, base * 0.34],
    ];
    for (const [r, a] of layers) {
      ctx.globalAlpha = a * low;
      disc(ctx, cel.x, gy, r, pal.sunGlow);
    }
    ctx.globalAlpha = 1;
  }

  // Cuerpo celeste (ocluido por las capas que se dibujen después).
  drawBody(ctx, cel, pal) {
    if (!cel || !cel.visible) return;
    const r = Math.round(cel.r);
    ctx.globalAlpha = 0.22;
    disc(ctx, cel.x, cel.y, r + 4, pal.sunGlow);
    ctx.globalAlpha = 1;
    disc(ctx, cel.x, cel.y, r, pal.sun);

    if (!cel.isSun) {
      ctx.fillStyle = pal.sunGlow;
      const cx = Math.round(cel.x);
      const cy = Math.round(cel.y);
      ctx.fillRect(cx - 2, cy - 1, 1, 1);
      ctx.fillRect(cx + 1, cy + 2, 2, 1);
      ctx.fillRect(cx - 1, cy + 3, 1, 1);
    } else {
      ctx.fillStyle = pal.sunGlow;
      const cx = Math.round(cel.x);
      const cy = Math.round(cel.y);
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }
  }

  // Vía Láctea: banda de polvo estelar inclinada y determinista, visible de noche.
  drawMilkyWay(ctx, W, H, pal, nightAmt) {
    const span = H * 0.56;
    const s = (this.seed ^ 0x9e37) >>> 0;
    const yTop = span * 0.60;
    const yBot = span * 0.08;
    const layers = [
      { off: 0.0, a: 0.075, col: pal.star },
      { off: 0.09, a: 0.05, col: pal.star },
      { off: -0.09, a: 0.045, col: pal.cloud },
    ];
    for (let li = 0; li < layers.length; li++) {
      const b = layers[li];
      for (let x = 0; x < W; x += 2) {
        const t = x / W;
        const axis = yTop + (yBot - yTop) * t + Math.sin(t * Math.PI) * span * 0.05;
        const cy = axis + b.off * span;
        if (hash1(x, s + 3000 + li) < 0.42) continue;
        const h = 2 + Math.floor(hash1(x, s + 6000 + li) * 3);
        ctx.globalAlpha = b.a * nightAmt * (0.45 + hash1(x, s + 9000 + li) * 0.9);
        ctx.fillStyle = b.col;
        ctx.fillRect(x, Math.round(cy), 2, h);
      }
    }
    // polvo brillante disperso sobre la banda
    for (let x = 0; x < W; x += 5) {
      if (hash1(x, s + 12000) < 0.82) continue;
      const t = x / W;
      const axis = yTop + (yBot - yTop) * t + Math.sin(t * Math.PI) * span * 0.05;
      const y = axis + (hash1(x, s + 13000) - 0.5) * span * 0.28;
      ctx.globalAlpha = 0.5 * nightAmt;
      ctx.fillStyle = pal.star;
      ctx.fillRect(x, Math.round(y), 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  drawStars(ctx, W, H, pal, nightAmt, tSec) {
    const span = H * 0.56;
    for (const s of this.stars) {
      const tw = 0.55 + 0.45 * Math.sin(tSec * 1.6 + s.p);
      const a = s.b * tw * nightAmt;
      if (a <= 0.04) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = pal.star;
      ctx.fillRect(Math.round(s.x * W), Math.round(s.y * span), 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  drawAurora(ctx, W, nightAmt, tSec) {
    const bands = [
      { yBase: 14, amp: 10, col: "rgba(64, 255, 170, ", alpha: 0.10 },
      { yBase: 26, amp: 13, col: "rgba(120, 220, 255, ", alpha: 0.07 },
      { yBase: 40, amp: 9, col: "rgba(150, 110, 255, ", alpha: 0.08 },
    ];
    const f = nightAmt;
    for (const b of bands) {
      for (let x = 0; x < W; x += 1) {
        const n = Math.sin(x * 0.03 + tSec * 0.4 + b.yBase) * b.amp;
        const top = b.yBase + n;
        const h = 26 + Math.sin(x * 0.02 + tSec * 0.3) * 12;
        ctx.fillStyle = b.col + b.alpha * f + ")";
        ctx.fillRect(x, Math.round(top), 1, Math.round(h));
      }
    }
    ctx.globalAlpha = 1;
  }

  drawClouds(ctx, W, pal, camera, tSec) {
    const period = W + 600;
    for (const c of this.clouds) {
      let sx = (c.x - camera.x * 0.04 - tSec * 3 * c.s) % period;
      if (sx < -300) sx += period;
      if (sx > W + 150) continue;
      this.puff(ctx, sx, c.y, c.w, pal.cloud, pal.cloudHi);
    }
  }

  puff(ctx, x, y, w, col, hi) {
    const parts = [
      [0, 0, w * 0.5, 6],
      [-w * 0.22, 1, w * 0.42, 5],
      [w * 0.22, 2, w * 0.38, 4],
    ];
    for (const [dx, dy, ww, hh] of parts) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(Math.round(x + dx), Math.round(y + dy), ww, hh, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = hi;
    ctx.beginPath();
    ctx.ellipse(Math.round(x - w * 0.1), Math.round(y - 2), w * 0.3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
