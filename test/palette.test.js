import test from "node:test";
import assert from "node:assert/strict";
import { lerpColor, shade, getPalette, nightAmount, hexToRgb, rgbToHex } from "../src/palette.js";

test("lerpColor respeta los extremos", () => {
  assert.equal(lerpColor("#000000", "#ffffff", 0), "#000000");
  assert.equal(lerpColor("#000000", "#ffffff", 1), "#ffffff");
  assert.equal(lerpColor("#123456", "#123456", 0.5), "#123456");
});

test("shade satura sin desbordar", () => {
  assert.equal(shade("#000000", -1), "#000000");
  assert.equal(shade("#ffffff", 1), "#ffffff");
  assert.equal(shade("#000000", 1), "#ffffff");
});

test("hexToRgb / rgbToHex son inversos", () => {
  assert.deepEqual(hexToRgb("#ff8000"), [255, 128, 0]);
  assert.equal(rgbToHex(255, 128, 0), "#ff8000");
});

test("getPalette entrega todas las claves esperadas a varias horas", () => {
  const keys = [
    "skyTop", "skyMid", "skyHorizon", "sun", "cloud", "star",
    "farL", "farD", "valleyL", "valleyD", "sand", "sandD", "sea", "seaD",
    "snow", "floraL", "floraD", "trunk", "rock", "rockD",
  ];
  for (const h of [0, 6, 12, 18, 23.9]) {
    const pal = getPalette(h, "clear");
    for (const k of keys) assert.ok(pal[k], `falta ${k} a las ${h}`);
  }
});

test("el clima modifica la paleta", () => {
  const clear = getPalette(12, "clear");
  assert.equal(getPalette(12, "snow").snow, "#ffffff");
  assert.notEqual(getPalette(12, "rain").sea, clear.sea);
  assert.notEqual(getPalette(12, "storm").sea, clear.sea, "la tormenta debe oscurecer");
  assert.notEqual(getPalette(12, "storm").skyTop, getPalette(12, "rain").skyTop);
});

test("nightAmount va de 0 (día) a 1 (noche)", () => {
  assert.equal(nightAmount(12), 0);
  assert.equal(nightAmount(0), 1);
  assert.equal(nightAmount(6), 0.5);
  assert.equal(nightAmount(19), 0.5);
  for (const h of [-3, 0, 5, 8, 15, 19, 24, 30]) {
    const v = nightAmount(h);
    assert.ok(v >= 0 && v <= 1, `nightAmount(${h}) = ${v}`);
  }
});
