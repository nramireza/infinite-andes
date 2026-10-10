import test from "node:test";
import assert from "node:assert/strict";
import { momentEvents, momentSky, momentGround, drawText } from "../src/moments.js";
import { getPalette } from "../src/palette.js";
import { seedToInt } from "../src/rng.js";
import { BASE_H, widthForRatio } from "../src/viewport.js";
import { makeFakeCtx } from "./helpers/fakeCtx.js";

const W = widthForRatio(32 / 9);
const H = BASE_H;
const SEED = seedToInt("andes");
const pal = getPalette(12, "clear");

test("momentEvents es determinista", () => {
  assert.deepEqual(momentEvents(SEED, { x: 0 }, W), momentEvents(SEED, { x: 0 }, W));
});

test("modo 'none' no dibuja nada", () => {
  const ctx = makeFakeCtx();
  momentSky(ctx, pal, { x: 0 }, W, H, SEED, 2, "none");
  momentGround(ctx, pal, { x: 0 }, W, H, SEED, 2, "none");
  assert.equal(ctx.calls.fillRect.length, 0);
});

test("un personaje forzado se dibuja igual dos veces", () => {
  const a = makeFakeCtx();
  const b = makeFakeCtx();
  momentGround(a, pal, { x: 0 }, W, H, SEED, 2, "leorey");
  momentGround(b, pal, { x: 0 }, W, H, SEED, 2, "leorey");
  assert.ok(a.calls.fillRect.length > 0);
  assert.deepEqual(a.calls.fillRect, b.calls.fillRect);
});

test("kungleo dibuja personaje y destello", () => {
  const ctx = makeFakeCtx();
  momentGround(ctx, pal, { x: 0 }, W, H, SEED, 2, "kungleo");
  assert.ok(ctx.calls.fillRect.length > 0);
});

test("el 18sep pinta el cielo y los papelitos", () => {
  const ctx = makeFakeCtx();
  momentSky(ctx, pal, { x: 0 }, W, H, SEED, 2, "18sep");
  assert.ok(ctx.calls.fillRect.length > 0);
});

test("el vuelo de cóndor, la bandada y la manada dibujan", () => {
  const cases = [[momentSky, "condor"], [momentSky, "bandada"], [momentGround, "manada"]];
  for (const [fn, mode] of cases) {
    const ctx = makeFakeCtx();
    fn(ctx, pal, { x: 0 }, W, H, SEED, 2, mode);
    assert.ok(ctx.calls.fillRect.length > 0, `${mode} no dibujó`);
    const again = makeFakeCtx();
    fn(again, pal, { x: 0 }, W, H, SEED, 2, mode);
    assert.deepEqual(again.calls.fillRect, ctx.calls.fillRect, `${mode} no es determinista`);
  }
});

test("drawText dibuja píxeles de texto", () => {
  const ctx = makeFakeCtx();
  drawText(ctx, "MORTAL KUMBIA", 0, 0, "#ffffff", 1);
  assert.ok(ctx.calls.fillRect.length > 0);
});
