import test from "node:test";
import assert from "node:assert/strict";
import { valueNoise1, fbm1, ridged1 } from "../src/noise.js";

test("valueNoise1 es determinista y continuo", () => {
  assert.equal(valueNoise1(3.7, 11), valueNoise1(3.7, 11));
  const a = valueNoise1(3.7, 11);
  const b = valueNoise1(3.7 + 0.001, 11);
  assert.ok(Math.abs(a - b) < 0.01, `salto grande: ${Math.abs(a - b)}`);
});

test("fbm1 y ridged1 quedan en [0,1]", () => {
  for (let x = -20; x < 20; x += 0.13) {
    const f = fbm1(x, 5, 4, 2, 0.5);
    const r = ridged1(x, 5, 3);
    assert.ok(f >= 0 && f <= 1, `fbm fuera de rango: ${f}`);
    assert.ok(r >= 0 && r <= 1, `ridged fuera de rango: ${r}`);
  }
});

test("fbm1 y ridged1 son deterministas", () => {
  assert.equal(fbm1(12.34, 99), fbm1(12.34, 99));
  assert.equal(ridged1(12.34, 99), ridged1(12.34, 99));
});
