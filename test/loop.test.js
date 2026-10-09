import test from "node:test";
import assert from "node:assert/strict";
import { frameBudget, shouldDraw, clampDt } from "../src/loop.js";

test("frameBudget traduce fps a milisegundos y no limita con 0", () => {
  assert.equal(frameBudget(30), 1000 / 30);
  assert.equal(frameBudget(60), 1000 / 60);
  assert.equal(frameBudget(0), 0);
  assert.equal(frameBudget(-5), 0);
  assert.equal(frameBudget("x"), 0);
});

test("shouldDraw respeta el presupuesto de FPS", () => {
  // a 30 fps el presupuesto es ~33.3 ms
  assert.equal(shouldDraw(1000, 1000, 30), false);
  assert.equal(shouldDraw(1016, 1000, 30), false);
  assert.equal(shouldDraw(1034, 1000, 30), true);
  // sin límite siempre dibuja
  assert.equal(shouldDraw(1000, 1000, 0), true);
});

test("clampDt acota y sanea el delta", () => {
  assert.equal(clampDt(0.02), 0.02);
  assert.equal(clampDt(2), 0.05);
  assert.equal(clampDt(-1), 0);
  assert.equal(clampDt(NaN), 0);
  assert.equal(clampDt(0.2, 0.1), 0.1);
});
