// Reactividad: mapeo de señales a multiplicador y sondeo con fallback.

import test from "node:test";
import assert from "node:assert/strict";
import { activityMultiplier, startActivityPolling, ACTIVITY_MIN, ACTIVITY_MAX } from "../src/activity.js";

const wait = (ms = 0) => new Promise((r) => setTimeout(r, ms));

test("sin señales el multiplicador es 1 (render actual intacto)", () => {
  assert.equal(activityMultiplier(undefined), 1);
  assert.equal(activityMultiplier(null), 1);
  assert.equal(activityMultiplier({}), 1);
  assert.equal(activityMultiplier({ cpu: "x", ram: null, temp: NaN }), 1);
});

test("carga alta sube la densidad y se respeta el máximo", () => {
  assert.ok(activityMultiplier({ cpu: 1, ram: 1, temp: 20, load: 0 }) > 1);
  assert.equal(activityMultiplier({ cpu: 1, ram: 1, temp: 0, load: 0 }), ACTIVITY_MAX);
});

test("temperatura y carga alta bajan la densidad con un mínimo", () => {
  assert.ok(activityMultiplier({ cpu: 0, ram: 0, temp: 100, load: 4 }) < 1);
  assert.equal(activityMultiplier({ cpu: 0, ram: 0, temp: 100, load: 4 }), ACTIVITY_MIN);
});

test("el multiplicador siempre queda acotado", () => {
  for (const s of [
    { cpu: 2, ram: 5, temp: -40, load: -3 },
    { cpu: -1, ram: -1, temp: 999, load: 99 },
  ]) {
    const m = activityMultiplier(s);
    assert.ok(m >= ACTIVITY_MIN && m <= ACTIVITY_MAX, `fuera de rango: ${m}`);
  }
});

test("sin URL no sondea y fija 1", () => {
  let v = null;
  const stop = startActivityPolling("", (m) => { v = m; });
  assert.equal(v, 1);
  assert.equal(typeof stop, "function");
  stop();
});

test("un puente caído degrada a 1 (sin errores)", async () => {
  const updates = [];
  const stop = startActivityPolling("http://localhost:9/activity", (m) => updates.push(m), {
    fetchImpl: async () => { throw new Error("sin conexión"); },
    interval: 1000,
  });
  await wait();
  assert.deepEqual(updates, [1]);
  stop();
});

test("un puente OK aplica el multiplicador", async () => {
  const updates = [];
  const stop = startActivityPolling("http://localhost:8787/activity", (m) => updates.push(m), {
    fetchImpl: async () => ({ ok: true, json: async () => ({ cpu: 1, ram: 1, temp: 20, load: 0 }) }),
    interval: 1000,
  });
  await wait();
  assert.deepEqual(updates, [ACTIVITY_MAX]);
  stop();
});
