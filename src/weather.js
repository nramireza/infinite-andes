// Clima: partículas (nieve/lluvia/viento), niebla y tormenta eléctrica.
// Los cambios se hacen con crossfade: el clima saliente se desvanece mientras
// el entrante sube en paralelo (dos climas visibles a la vez).

import { mulberry32 } from "./rng.js";

const COUNTS = { snow: 230, rain: 260, wind: 90, fog: 0, clear: 0, storm: 170 };
const LEAF = ["#8a5a2a", "#b07a3a", "#6a7a3a", "#9a7a2a"];
const RAIN = "#c8dcea";

export function windLevelFor(type) {
  if (type === "wind") return 1;
  if (type === "storm") return 0.7;
  if (type === "snow") return 0.4;
  if (type === "rain") return 0.25;
  if (type === "fog") return 0.1;
  return 0.05;
}

export class Weather {
  constructor(W, H) {
    this.type = "clear";
    this.strength = 0;
    this.transition = "in";
    this.pending = null;
    this.prevType = null;
    this.prevStrength = 0;
    this.prevParticles = [];
    this.particles = [];
    this.fogPhase = 0;
    this.lightTimer = 1.5;
    this.lightFlash = 0;
    this.lightX = 0;
    this.lightBolt = null;
    this.W = W;
    this.H = H;
    this.rng = mulberry32(12345);
  }

  // Cambio inmediato (control manual / reinicio).
  setImmediate(type, W = this.W, H = this.H) {
    this.W = W;
    this.H = H;
    if (type === this.type && this.prevType === null) {
      this.build();
      this.strength = 0;
      this.transition = "in";
      return;
    }
    this.swap(type);
  }

  // Cambio con fundido (clima automático).
  request(type) {
    if (type === this.type && this.prevType === null && this.transition === "in") return;
    this.swap(type);
  }

  // Deja el clima actual como saliente (crossfade) y arranca el nuevo.
  swap(type) {
    this.prevType = this.type;
    this.prevStrength = this.strength;
    this.prevParticles = this.particles;
    this.type = type;
    this.pending = null;
    this.build();
    this.strength = 0;
    this.transition = "in";
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
    if (this.type === "storm") {
      return { x: r() * W, y: anywhere ? r() * H : -8, vy: 200 + r() * 160, len: 4 + Math.floor(r() * 4), a: 0.45 + r() * 0.4 };
    }
    return { x: anywhere ? r() * W : -10, y: r() * H, vx: 40 + r() * 90, vy: (r() - 0.5) * 12, len: 2 + Math.floor(r() * 4), leaf: r() < 0.3, color: LEAF[Math.floor(r() * LEAF.length)], a: 0.3 + r() * 0.5 };
  }

  windLevel() {
    return windLevelFor(this.type);
  }

  // Viento efectivo (0..1) contando el crossfade; lo usa el mar para agitarse.
  effectiveWind() {
    let w = windLevelFor(this.type) * this.strength;
    if (this.prevType) w += windLevelFor(this.prevType) * this.prevStrength;
    return Math.min(1, w);
  }

  stepParticles(type, arr, dt) {
    if (type === "fog" || type === "clear") return;
    const { W, H } = this;
    const wind = windLevelFor(type);
    for (const p of arr) {
      if (type === "snow") {
        p.y += p.vy * dt;
        p.x += (p.vx + wind * 26) * dt;
        if (p.y > H + 4) { p.y = -4; p.x = this.rng() * W; }
      } else if (type === "rain" || type === "storm") {
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

  // Relámpagos de la tormenta: temporizador y flash deterministas por semilla fija.
  updateLightning(dt) {
    this.lightFlash = Math.max(0, this.lightFlash - dt * 1.2);
    this.lightTimer -= dt;
    if (this.lightTimer <= 0) {
      this.lightTimer = 1.5 + this.rng() * 5;
      this.lightFlash = 0.18 + this.rng() * 0.16;
      this.lightX = this.W * (0.15 + this.rng() * 0.7);
      this.lightBolt = this.makeBolt();
    }
  }

  makeBolt() {
    const rows = [];
    const end = Math.round(this.H * 0.66);
    let x = this.lightX;
    for (let y = 0; y <= end; y++) {
      const r = this.rng();
      if (r < 0.2) x += r < 0.1 ? -2 : 2;
      else if (r < 0.45) x += r < 0.275 ? -1 : 1;
      rows.push([Math.round(x), y]);
      if (y > 4 && this.rng() < 0.05) rows.push([Math.round(x) + 3, y]);
    }
    return rows;
  }

  update(dt) {
    // Crossfade simétrico: entrante y saliente avanzan a la misma tasa.
    const k = Math.min(1, dt * 1.6);
    const target = this.type === "clear" ? 0 : 1;
    this.strength += (target - this.strength) * k;
    if (this.prevType !== null) {
      this.prevStrength += (0 - this.prevStrength) * k;
      if (this.prevStrength <= 0.02) {
        this.prevStrength = 0;
        this.prevType = null;
        this.prevParticles = [];
      }
    }

    this.fogPhase += dt * (6 + this.windLevel() * 26);

    if (this.strength >= 0.01) this.stepParticles(this.type, this.particles, dt);
    if (this.prevType !== null && this.prevStrength >= 0.01) {
      this.stepParticles(this.prevType, this.prevParticles, dt);
    }

    if (this.type === "storm" || this.prevType === "storm") this.updateLightning(dt);
  }

  drawParticles(ctx, type, particles, s, pal) {
    if (s < 0.01 || type === "clear") return;

    if (type === "fog") {
      ctx.globalAlpha = 0.16 * s;
      ctx.fillStyle = pal.fog;
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.globalAlpha = 0.10 * s;
      for (let i = 0; i < 5; i++) {
        const y = (this.H * 0.45 + i * 26 + Math.sin(this.fogPhase * 0.02 + i) * 5) % (this.H + 40) - 20;
        ctx.fillRect(0, Math.round(y), this.W, 14);
      }
      ctx.globalAlpha = 1;
      return;
    }

    const wind = windLevelFor(type);
    for (const p of particles) {
      ctx.globalAlpha = p.a * s;
      if (type === "snow") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      } else if (type === "rain" || type === "storm") {
        // Trazo inclinado por el viento (deriva visual del chorro).
        ctx.fillStyle = RAIN;
        const slant = wind * 1.6;
        for (let i = 0; i < p.len; i++) {
          ctx.fillRect(Math.round(p.x - i * slant), Math.round(p.y + i), 1, 1);
        }
      } else {
        ctx.fillStyle = p.leaf ? p.color : "rgba(220, 230, 210, 0.6)";
        if (p.leaf) ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 1);
        else ctx.fillRect(Math.round(p.x), Math.round(p.y), p.len, 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  draw(ctx, W, H, pal) {
    this.drawParticles(ctx, this.type, this.particles, this.strength, pal);
    if (this.prevType !== null) {
      this.drawParticles(ctx, this.prevType, this.prevParticles, this.prevStrength, pal);
    }
  }

  // El rayo se dibuja detrás del terreno (lo llama la escena antes de las capas).
  drawLightning(ctx, W, H, pal) {
    if (this.lightFlash <= 0 || !this.lightBolt) return;
    const a = Math.min(1, this.lightFlash);
    ctx.globalAlpha = 0.5 * a;
    ctx.fillStyle = pal.cloudHi;
    for (const [x, y] of this.lightBolt) ctx.fillRect(x - 1, y, 3, 1);
    ctx.globalAlpha = Math.min(1, a * 3);
    ctx.fillStyle = "#ffffff";
    for (const [x, y] of this.lightBolt) ctx.fillRect(x, y, 1, 1);
    ctx.globalAlpha = 0.09 * a;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}
