import test from "node:test";
import assert from "node:assert/strict";
import { encodeView, decodeView, addView, removeView, parseViews } from "../src/views.js";

test("encodeView/decodeView hacen roundtrip del estado", () => {
  const state = {
    seed: "andes",
    x: 1234,
    hour: 6.75,
    weather: "snow",
    aspect: "21:9",
    moment: "leorey",
    season: "invierno",
    biome: "sur",
    bloom: "on",
  };
  assert.deepEqual(decodeView(encodeView(state)), state);
});

test("decodeView aplica defaults y descarta valores inválidos", () => {
  assert.deepEqual(decodeView(""), {});
  assert.deepEqual(decodeView("?seed=&weather=lava&aspect=0"), {});
  assert.equal(decodeView("?hour=99").hour, 3); // se envuelve a [0,24)
  const v = decodeView("?seed=pewen&x=abc&hour=-1");
  assert.equal(v.seed, "pewen");
  assert.equal(v.x, undefined);
  assert.equal(v.hour, 23);
});

test("encodeView redondea x y normaliza la hora", () => {
  assert.equal(encodeView({ x: 12.6, hour: 25.5 }), "x=13&hour=1.50");
});

test("encodeView omite campos ausentes", () => {
  assert.equal(encodeView({ seed: "andes" }), "seed=andes");
  assert.equal(encodeView({ weather: "clear" }), "weather=clear");
});

test("decodeView acepta URLSearchParams y objeto", () => {
  const p = new URLSearchParams("seed=x&biome=norte");
  assert.deepEqual(decodeView(p), { seed: "x", biome: "norte" });
  assert.deepEqual(decodeView({ seed: "y", bloom: "off" }), { seed: "y", bloom: "off" });
});

test("addView reemplaza por nombre y conserva el resto", () => {
  let list = [];
  list = addView(list, { seed: "a", x: 1 }, "costa");
  list = addView(list, { seed: "b", x: 2 }, "andes");
  list = addView(list, { seed: "c", x: 3 }, "costa");
  assert.equal(list.length, 2);
  assert.equal(list.find((e) => e.name === "costa").query, "seed=c&x=3");
  assert.equal(list[0].name, "andes");
});

test("removeView elimina por nombre", () => {
  const list = addView(addView([], { seed: "a" }, "uno"), { seed: "b" }, "dos");
  const out = removeView(list, "uno");
  assert.equal(out.length, 1);
  assert.equal(out[0].name, "dos");
});

test("parseViews tolera JSON corrupto o malformado", () => {
  assert.deepEqual(parseViews(null), []);
  assert.deepEqual(parseViews("{no json"), []);
  assert.deepEqual(parseViews('{"a":1}'), []);
  assert.deepEqual(parseViews('[{"name":"x"},{"name":"ok","query":"seed=z"}]'), [
    { name: "ok", query: "seed=z" },
  ]);
});
