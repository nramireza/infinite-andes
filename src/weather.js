// Clima: partículas (nieve/lluvia/viento) y capas de niebla.
// Los cambios se hacen con fundido: el clima actual se desvanece y entra el nuevo.

import { mulberry32 } from "./rng.js";

const COUNTS = { snow: 230, rain: 260, wind: 90, fog: 0, clear: 0 };
const LEAF = ["#8a5a2a", "#b07a3a", "#6a7a3a", "#9a7a2a"];

export class Weather {
  constructor(W, H) {
    this.type = "clear";
    this.strength = 0;
    this.transition = "in";
    this.pending = null;
    this.particles = [];
    this.fogPhase = 0;
    this.W = W;
    this.H = H;
    this.rng = mulberry32(12345);
  }

  // Cambio inmediato (control manual / reinicio).
  setImmediate(type, W = this.W, H = this.H) {
    this.W = W;
    this.H = H;
    this.type = type;
    this.pending = null;
    this.build();
    this.strength = 0;
    this.transition = "in";
  }

  // Cambio con fundido (clima automático).
  request(type) {
    if (type === this.type && !this.pending && this.transition === "in") return;
    if (this.strength < 0.03) {
      this.setImmediate(type);
      return;
    }
    this.pending = type;
    this.transition = "out";
  }

  // Reajusta el tamaño de las partículas sin reiniciar el clima.
  resize(W, H) {
    this.W = W;
    this.H = H;
    this.build();
  }

  build() {
    const { W, H } = this;
    const n = COUNTS[this.type] || 0;
    this.particles = [];
    for (let i = 0; i < n; i++) this.particles.push(this.spawn(true));
  }

  spawn(anywhere) {
    const { W, H } = this;
    const r = this.rng;
    if (this.type === "snow") {
      return { x: r() * W, y: anywhere ? r() * H : -4, vy: 10 + r() * 22, vx: (r() - 0.5) * 8, s: r() < 0.35 ? 2 : 1, a: 0.5 + r() * 0.5 };
    }
    if (this.type === "rain") {
      return { x: r() * W, y: anywhere ? r() * H : -6, vy: 150 + r() * 120, len: 3 + Math.floor(r() * 4), a: 0.35 + r() * 0.4 };
    }
    return { x: anywhere ? r() * W : -10, y: r() * H, vx: 40 + r() * 90, vy: (r() - 0.5) * 12, len: 2 + Math.floor(r() * 4), leaf: r() < 0.3, color: LEAF[Math.floor(r() * LEAF.length)], a: 0.3 + r() * 0.5 };
  }

  windLevel() {
    if (this.type === "wind") return 1;
    if (this.type === "snow") return 0.4;
    if (this.type === "rain") return 0.25;
    if (this.type === "fog") return 0.1;
    return 0.05;
  }

  update(dt) {
    if (this.transition === "out") {
      this.strength -= dt * 1.6;
      if (this.strength <= 0) {
        this.strength = 0;
        if (this.pending) {
          this.type = this.pending;
          this.pending = null;
          this.build();
        }
        this.transition = "in";
      }
    } else {
      const target = this.type === "clear" ? 0 : 1;
      this.strength += (target - this.strength) * Math.min(1, dt * 1.1);
    }

    this.fogPhase += dt * (6 + this.windLevel() * 26);

    if (this.type === "fog" || this.type === "clear" || this.strength < 0.01) return;

    const { W, H } = this;
    const wind = this.windLevel();
    for (const p of this.particles) {
      if (this.type === "snow") {
        p.y += p.vy * dt;
        p.x += (p.vx + wind * 26) * dt;
        if (p.y > H + 4) { p.y = -4; p.x = this.rng() * W; }
      } else if (this.type === "rain") {
        p.y += p.vy * dt;
        p.x -= wind * 30 * dt;
        if (p.y > H + 6) { p.y = -6; p.x = this.rng() * W; }
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x > W + 12) { p.x = -12; p.y = this.rng() * H; }
      }
      if (p.x < -20) p.x += W + 40;
      if (p.x > W + 20) p.x -= W + 40;
    }
  }

  draw(ctx, W, H, pal) {
    if (this.strength < 0.01 || this.type === "clear") return;
    const s = this.strength;

    if (this.type === "fog") {
      ctx.globalAlpha = 0.16 * s;
      ctx.fillStyle = pal.fog;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.10 * s;
      for (let i = 0; i < 5; i++) {
        const y = (H * 0.45 + i * 26 + Math.sin(this.fogPhase * 0.02 + i) * 5) % (H + 40) - 20;
        ctx.fillRect(0, Math.round(y), W, 14);
      }
      ctx.globalAlpha = 1;
      return;
    }

    for (const p of this.particles) {
      ctx.globalAlpha = p.a * s;
      if (this.type === "snow") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      } else if (this.type === "rain") {
        ctx.fillStyle = "#c8dcea";
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, p.len);
      } else {
        ctx.fillStyle = p.leaf ? p.color : "rgba(220, 230, 210, 0.6)";
        if (p.leaf) ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 1);
        else ctx.fillRect(Math.round(p.x), Math.round(p.y), p.len, 1);
      }
    }
    ctx.globalAlpha = 1;
  }
}
