import test from "node:test";
import assert from "node:assert/strict";
import { Weather, windLevelFor } from "../src/weather.js";
import { getPalette, lerpPalettes } from "../src/palette.js";
import { makeFakeCtx } from "./helpers/fakeCtx.js";

const W = 320;
const H = 180;

// Clima "asentado": lo fija y avanza hasta que la fuerza llega ~1.
function settled(type) {
  const w = new Weather(W, H);
  w.setImmediate(type);
  for (let i = 0; i < 240; i++) w.update(0.05);
  return w;
}

test("el crossfade mantiene dos climas activos y desvanece el saliente", () => {
  const w = settled("snow");
  assert.ok(w.strength > 0.95);
  w.request("rain");
  assert.equal(w.type, "rain");
  assert.equal(w.prevType, "snow");
  assert.ok(w.prevStrength > 0.95, "el saliente debe arrancar con su fuerza actual");
  w.update(0.016);
  assert.ok(w.strength > 0, "el entrante sube en paralelo");
  assert.ok(w.prevStrength > 0 && w.prevStrength < 1, "el saliente sigue visible");
  let guard = 0;
  while (w.prevType !== null && guard++ < 10000) w.update(0.016);
  assert.equal(w.prevType, null, "el saliente debe llegar a cero");
  assert.ok(w.strength > 0.9, "el entrante queda en pleno");
});

test("request ignora el mismo clima sin transición en curso", () => {
  const w = settled("rain");
  w.request("rain");
  assert.equal(w.prevType, null);
  assert.equal(w.type, "rain");
  assert.ok(w.strength > 0.9);
});

test("setImmediate al mismo clima reinicia sin crear saliente", () => {
  const w = settled("snow");
  w.setImmediate("snow");
  assert.equal(w.prevType, null);
  assert.equal(w.strength, 0);
  assert.equal(w.transition, "in");
});

test("windLevelFor y effectiveWind reflejan tipo y crossfade", () => {
  assert.equal(windLevelFor("wind"), 1);
  assert.ok(windLevelFor("storm") > windLevelFor("rain"));
  const w = settled("snow");
  assert.ok(w.effectiveWind() > 0.3, "la nieve agita algo el mar");
  w.request("wind");
  w.update(0.016);
  assert.ok(w.effectiveWind() >= w.strength, "cuenta también el clima saliente");
});

test("la lluvia se dibuja inclinada por el viento (trazo por fila)", () => {
  const w = settled("rain");
  const ctx = makeFakeCtx();
  const pal = getPalette(12, "rain");
  w.draw(ctx, W, H, pal);
  const lenSum = w.particles.reduce((a, p) => a + p.len, 0);
  assert.equal(ctx.calls.fillRect.length, lenSum, "la lluvia inclinada dibuja un píxel por fila");
});

test("la tormenta genera relámpagos deterministas y los dibuja", () => {
  const w = new Weather(W, H);
  w.setImmediate("storm");
  w.update(0.016);
  assert.ok(w.particles.length > 0, "la tormenta trae lluvia densa");
  let guard = 0;
  while (w.lightFlash <= 0 && guard++ < 2000) w.update(0.1);
  assert.ok(w.lightFlash > 0, "no se disparó el relámpago");
  assert.ok(w.lightBolt.length > 5, "el rayo debe recorrer el cielo");
  const ctx = makeFakeCtx();
  const pal = getPalette(15, "storm");
  w.drawLightning(ctx, W, H, pal);
  assert.ok(ctx.calls.fillRect.length > 0, "el rayo no dibujó nada");
  const ctx2 = makeFakeCtx();
  w.draw(ctx2, W, H, pal);
  assert.ok(ctx2.calls.fillRect.length > 0, "la tormenta no dibujó partículas");
});

test("lerpPalettes interpola entre dos paletas de clima", () => {
  const a = getPalette(12, "rain", 1);
  const b = getPalette(12, "clear", 0);
  assert.deepEqual(lerpPalettes(a, b, 0), a);
  assert.deepEqual(lerpPalettes(a, b, 1), b);
  const mid = lerpPalettes(a, b, 0.5);
  assert.notEqual(mid.sea, a.sea);
  assert.notEqual(mid.sea, b.sea);
});
