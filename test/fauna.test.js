import test from "node:test";
import assert from "node:assert/strict";
import { LAYERS, seedLayers, riverInfluence } from "../src/terrain.js";
import { faunaSpawns, placeFauna, isActive, SPECIES } from "../src/fauna.js";
import { seedToInt } from "../src/rng.js";
import { getPalette } from "../src/palette.js";
import { BASE_H, widthForRatio } from "../src/viewport.js";
import { makeFakeCtx, collectOutOfBounds } from "./helpers/fakeCtx.js";

const W = widthForRatio(16 / 9);
const H = BASE_H;
const SEED = seedToInt("pewen");

function layerByName(name) {
  return LAYERS.find((l) => l.name === name);
}

function faunaLayers() {
  return LAYERS.filter((l) => l.fauna);
}

test("isActive respeta las franjas horarias", () => {
  assert.equal(isActive(SPECIES.condor, 12), true);
  assert.equal(isActive(SPECIES.condor, 2), false);
  assert.equal(isActive(SPECIES.guina, 23), true);
  assert.equal(isActive(SPECIES.guina, 12), false);
  assert.equal(isActive(SPECIES.pudu, 18), true);
  assert.equal(isActive(SPECIES.pudu, 8), true); // 5..8
  assert.equal(isActive(SPECIES.pudu, 12), false);
});

test("faunaSpawns es determinista", () => {
  seedLayers(SEED);
  const layer = layerByName("valle");
  assert.deepEqual(
    faunaSpawns(layer, { x: 300 }, W, H, SEED, 12),
    faunaSpawns(layer, { x: 300 }, W, H, SEED, 12)
  );
});

test("la hora no altera la identidad, solo filtra actividad", () => {
  seedLayers(SEED);
  const layer = layerByName("valle");
  const day = faunaSpawns(layer, { x: 300 }, W, H, SEED, 12);
  const night = faunaSpawns(layer, { x: 300 }, W, H, SEED, 20);
  for (const s of day) assert.ok(isActive(SPECIES[s.type], 12));
  for (const s of night) assert.ok(isActive(SPECIES[s.type], 20));
  // la actividad divide el mismo conjunto de candidatos: ninguna posición de día
  // que también sea de noche puede cambiar de atributos.
  const byWx = new Map(night.map((s) => [s.wx, s]));
  for (const s of day) {
    const o = byWx.get(s.wx);
    if (!o) continue;
    assert.equal(o.type, s.type);
    assert.equal(o.phase, s.phase);
    assert.equal(o.dir, s.dir);
  }
});

test("faunaSpawns hereda el parallax: misma posición de mundo, mismos atributos", () => {
  seedLayers(SEED);
  const layer = layerByName("valle");
  const a = faunaSpawns(layer, { x: 0 }, W * 4, H, SEED, 12);
  const b = faunaSpawns(layer, { x: 500 }, W * 4, H, SEED, 12);
  const byWx = new Map(b.map((s) => [s.wx, s]));
  let comunes = 0;
  for (const s of a) {
    const o = byWx.get(s.wx);
    if (!o) continue;
    comunes++;
    assert.equal(o.type, s.type);
    assert.equal(o.phase, s.phase);
    assert.equal(o.dir, s.dir);
  }
  assert.ok(comunes > 0, "se esperaban animales en la ventana común");
});

test("los animales terrestres no nacen dentro del cauce", () => {
  seedLayers(SEED);
  for (const layer of faunaLayers()) {
    for (const h of [0, 12, 20]) {
      for (const s of faunaSpawns(layer, { x: 0 }, W, H, SEED, h)) {
        if (s.gy === null) continue; // volador
        assert.ok(riverInfluence(layer, s.wx) <= 0.25, `${layer.name} sembró en el cauce`);
      }
    }
  }
});

test("faunaSpawns respeta la ventana de pantalla", () => {
  seedLayers(SEED);
  for (const layer of faunaLayers()) {
    for (const cam of [0, 1200, 5000]) {
      for (const s of faunaSpawns(layer, { x: cam }, W, H, SEED, 20)) {
        assert.ok(s.sx >= -60 && s.sx <= W + 60, `sx fuera de margen: ${s.sx}`);
      }
    }
  }
});

test("faunaSpawns devuelve vacío en capas sin fauna", () => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    if (layer.fauna) continue;
    assert.deepEqual(faunaSpawns(layer, { x: 0 }, W, H, SEED, 12), []);
  }
});

test("placeFauna es robusto ante tSec negativo o no finito", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  const layer = layerByName("andes");
  let cam = null;
  for (let x = 0; x < 20000; x += 37) {
    if (faunaSpawns(layer, { x }, W, H, SEED, 12).length) { cam = x; break; }
  }
  assert.notEqual(cam, null, "no se halló fauna para el caso de regresión");
  for (const t of [-0.05, -3.7, NaN, Infinity]) {
    const ctx = makeFakeCtx();
    assert.doesNotThrow(
      () => placeFauna(ctx, layer, pal, { x: cam }, W, H, SEED, 12, t),
      `tSec=${t} lanzó`
    );
    assert.ok(ctx.calls.fillRect.length > 0, `no dibujó con tSec=${t}`);
  }
});

test("los sprites usan solo caracteres mapeados y claves de paleta válidas", () => {
  const pal = getPalette(12, "clear");
  for (const [name, sp] of Object.entries(SPECIES)) {
    for (const ch in sp.palette) {
      const key = sp.palette[ch];
      assert.ok(key.startsWith("#") || key in pal, `${name}: clave de paleta inválida ${key}`);
    }
    for (const frame of sp.frames) {
      const w = Math.max(...frame.map((r) => r.length));
      for (const row of frame) {
        assert.equal(row.length, w, `${name}: filas de ancho distinto`);
        for (const ch of row) {
          if (ch === "." || ch === " ") continue;
          assert.ok(sp.palette[ch], `${name}: carácter ${ch} sin mapear`);
        }
      }
    }
  }
});

test("la fauna marina se dibuja sobre el mar", () => {
  seedLayers(SEED);
  const layer = LAYERS.find((l) => l.sea);
  let found = false;
  for (let x = 0; x < 30000 && !found; x += 41) {
    const ctx = makeFakeCtx();
    placeFauna(ctx, layer, getPalette(12, "clear"), { x }, W, H, SEED, 12, 2);
    if (ctx.calls.fillRect.length) found = true;
  }
  assert.ok(found, "no se dibujó fauna marina");
});

test("placeFauna no falla y dibuja en la ventana", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  let drawn = 0;
  for (const hour of [0, 12, 20]) {
    for (const layer of faunaLayers()) {
      const ctx = makeFakeCtx();
      placeFauna(ctx, layer, pal, { x: 0 }, W, H, SEED, hour, 2.5);
      drawn += ctx.calls.fillRect.length;
      assert.deepEqual(collectOutOfBounds(ctx, W, H, 72), [], `${layer.name} dibujó fuera`);
    }
  }
  assert.ok(drawn > 0, "no se dibujó fauna");
});
