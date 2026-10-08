import test from "node:test";
import assert from "node:assert/strict";
import { mulberry32, hash1, hashInt, hashString, seedToInt } from "../src/rng.js";

test("mulberry32 es reproducible", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test("mulberry32 entrega valores en [0,1)", () => {
  const r = mulberry32(7);
  for (let i = 0; i < 1000; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1, `fuera de rango: ${v}`);
  }
});

test("mulberry32 con distinta semilla difiere", () => {
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test("hash1 es determinista, estable e independiente del orden de llamada", () => {
  assert.equal(hash1(123, 9), hash1(123, 9));
  assert.equal(hash1(5, 0), hash1(5, 0));
  for (let i = -50; i < 50; i++) {
    const v = hash1(i, 3);
    assert.ok(v >= 0 && v < 1, `fuera de rango: ${v}`);
  }
});

test("hashInt entrega enteros de 32 bits y siembra PRNGs distintos por chunk", () => {
  for (let i = -20; i < 20; i++) {
    const v = hashInt(i, 123);
    assert.ok(Number.isInteger(v) && v >= 0 && v < 4294967296, `fuera de rango: ${v}`);
  }
  assert.notEqual(hashInt(1, 0), hashInt(2, 0));
  assert.notEqual(mulberry32(hashInt(1, 0))(), mulberry32(hashInt(2, 0))());
});

test("hashString es estable", () => {
  assert.equal(hashString("andes"), hashString("andes"));
  assert.notEqual(hashString("andes"), hashString("pewen"));
});

test("seedToInt normaliza texto, número y vacío", () => {
  assert.equal(seedToInt("42"), 42);
  assert.equal(seedToInt(42), 42);
  assert.equal(seedToInt("pewen"), hashString("pewen"));
  assert.equal(seedToInt(""), 0);
  assert.equal(seedToInt("  "), 0);
});
