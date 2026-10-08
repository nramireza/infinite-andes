import test from "node:test";
import assert from "node:assert/strict";
import {
  BASE_H, DEFAULT_ASPECT, ASPECT_PRESETS,
  widthForRatio, ratioFromString, labelForRatio,
} from "../src/viewport.js";

test("widthForRatio deriva el ancho de la relación con altura fija", () => {
  assert.equal(widthForRatio(16 / 9), 480);
  assert.equal(widthForRatio(21 / 9), 630);
  assert.equal(widthForRatio(32 / 9), 960);
  assert.equal(widthForRatio(NaN), 960); // cae al default
});

test("los presets cubren 16:9, 21:9 y 32:9 con el default correcto", () => {
  assert.equal(DEFAULT_ASPECT, "32:9");
  assert.deepEqual(ASPECT_PRESETS.map((p) => p.id), ["16:9", "21:9", "32:9"]);
  assert.equal(widthForRatio(ratioFromString(DEFAULT_ASPECT)), 960);
  assert.equal(BASE_H, 270);
});

test("ratioFromString acepta ':', 'x', '/' y decimales", () => {
  assert.ok(Math.abs(ratioFromString("32:9") - 32 / 9) < 1e-9);
  assert.ok(Math.abs(ratioFromString("21x9") - 21 / 9) < 1e-9);
  assert.ok(Math.abs(ratioFromString("16/9") - 16 / 9) < 1e-9);
  assert.equal(ratioFromString("2.4"), 2.4);
  assert.equal(ratioFromString("malo"), null);
  assert.equal(ratioFromString(""), null);
  assert.equal(ratioFromString(null), null);
});

test("labelForRatio reconoce presets y etiqueta decimales", () => {
  assert.equal(labelForRatio(32 / 9), "32:9");
  assert.equal(labelForRatio(16 / 9), "16:9");
  assert.equal(labelForRatio(2.4), "2.400:1");
});
