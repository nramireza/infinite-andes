// Reactividad: mapeo de señales a multiplicador y sondeo con fallback.

import test from "node:test";
import assert from "node:assert/strict";
import {
  activityMultiplier, startActivityPolling, createActivityController, activityConfigFrom,
  ACTIVITY_MIN, ACTIVITY_MAX, ACTIVITY_URL_DEFAULT,
} from "../src/activity.js";

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

test("activityConfigFrom: precedencia URL > preferencia > off", () => {
  assert.deepEqual(activityConfigFrom({ param: "off", stored: "1" }), { enabled: false, url: ACTIVITY_URL_DEFAULT });
  assert.deepEqual(activityConfigFrom({ param: "1", stored: "0" }), { enabled: true, url: ACTIVITY_URL_DEFAULT });
  assert.deepEqual(activityConfigFrom({ param: "http://x/a", stored: "0" }), { enabled: true, url: "http://x/a" });
  assert.deepEqual(activityConfigFrom({ param: null, stored: "1" }), { enabled: true, url: ACTIVITY_URL_DEFAULT });
  assert.deepEqual(activityConfigFrom({ param: null, stored: null }), { enabled: false, url: ACTIVITY_URL_DEFAULT });
});

test("el controlador arranca apagado y no sondea", () => {
  let calls = 0;
  const c = createActivityController({
    url: ACTIVITY_URL_DEFAULT,
    fetchImpl: async () => { calls++; return { ok: true, json: async () => ({}) }; },
  });
  assert.deepEqual(c.getState(), { enabled: false, online: null, mul: 1 });
  assert.equal(c.isEnabled(), false);
  assert.equal(calls, 0);
});

test("enable consulta el puente y disable vuelve a 1", async () => {
  const states = [];
  const c = createActivityController({
    url: ACTIVITY_URL_DEFAULT,
    onUpdate: (st) => states.push(st),
    fetchImpl: async () => ({ ok: true, json: async () => ({ cpu: 1, ram: 1, temp: 20, load: 0 }) }),
    interval: 1000,
  });
  c.enable();
  await wait();
  assert.equal(c.isEnabled(), true);
  assert.deepEqual(c.getState(), { enabled: true, online: true, mul: ACTIVITY_MAX });
  c.disable();
  assert.deepEqual(c.getState(), { enabled: false, online: null, mul: 1 });
  assert.equal(c.isEnabled(), false);
  assert.ok(states.length >= 3, "onUpdate debería recibir cada cambio");
});

test("enable con el puente caído deja mul en 1 y online false", async () => {
  const c = createActivityController({
    url: ACTIVITY_URL_DEFAULT,
    fetchImpl: async () => { throw new Error("caído"); },
    interval: 1000,
  });
  c.enable();
  await wait();
  assert.deepEqual(c.getState(), { enabled: true, online: false, mul: 1 });
  c.disable();
});

test("disable detiene los sondeos periódicos", async () => {
  let calls = 0;
  const c = createActivityController({
    url: ACTIVITY_URL_DEFAULT,
    fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ cpu: 0 }) }; },
    interval: 10,
  });
  c.enable();
  await wait(35);
  const before = calls;
  assert.ok(before >= 2, `esperaba varios sondeos, hubo ${before}`);
  c.disable();
  await wait(35);
  assert.equal(calls, before, "no debe sondear tras apagar");
});
