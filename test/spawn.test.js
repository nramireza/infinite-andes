import test from "node:test";
import assert from "node:assert/strict";
import { LAYERS, seedLayers, riverInfluence, riverEvents, channelOffset, ridgeHeight, setFjordStrength } from "../src/terrain.js";
import { floraSpawns } from "../src/flora.js";
import { seedToInt } from "../src/rng.js";
import { BASE_H, widthForRatio } from "../src/viewport.js";

const W = widthForRatio(16 / 9);
const H = BASE_H;
const SEED = seedToInt("pewen");

function layerByName(name) {
  return LAYERS.find((l) => l.name === name);
}

test("riverEvents solo existe en capas con ríos", () => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    const ev = riverEvents(layer, { x: 0 }, W);
    if (layer.rivers) assert.ok(ev.length >= 0);
    else assert.equal(ev.length, 0);
  }
});

test("riverEvents es determinista e independiente de la cámara (parallax heredado)", () => {
  seedLayers(SEED);
  const layer = layerByName("valle");
  const a = riverEvents(layer, { x: 0 }, W * 4);
  const b = riverEvents(layer, { x: 500 }, W * 4);
  const byX = new Map(b.map((e) => [e.xc, e.seed]));
  let comunes = 0;
  for (const e of a) {
    if (!byX.has(e.xc)) continue;
    comunes++;
    assert.equal(byX.get(e.xc), e.seed, "misma posición de mundo debe dar misma semilla");
  }
  assert.ok(comunes > 0, "se esperaban eventos en la ventana común");
});

test("riverEvents respeta la ventana de pantalla con el parallax", () => {
  seedLayers(SEED);
  const layer = layerByName("valle");
  const camera = { x: 1200 };
  const p = layer.parallax;
  const V = layer.rivers.spacing;
  for (const e of riverEvents(layer, camera, W)) {
    const sx = e.xc - camera.x * p;
    assert.ok(sx > -80 - V && sx < W + 80 + V, `evento fuera de ventana: sx=${sx}`);
  }
});

test("el meandro del cauce es sutil y arranca centrado en el nacimiento", () => {
  seedLayers(SEED);
  for (const name of ["valle", "costa"]) {
    const layer = layerByName(name);
    const amp = layer.rivers.width * 0.55;
    for (let s = 0.05; s < 1; s += 0.13) {
      assert.equal(Math.abs(channelOffset(layer, s, 0)), 0, `${name}: el nacimiento no arranca centrado`);
      for (let u = 0; u <= 1.0001; u += 0.05) {
        const o = channelOffset(layer, s, u);
        assert.ok(Math.abs(o) <= amp + 1e-9, `${name}: meandro fuera de la holgura (${o})`);
      }
    }
  }
});

test("los fiordos tallan la costa solo con fuerza activa", () => {
  seedLayers(SEED);
  const layer = layerByName("costa");
  const sum = () => {
    let a = 0;
    for (let x = 0; x < 3000; x += 1) a += ridgeHeight(layer, x);
    return a;
  };
  const dry = sum();
  try {
    setFjordStrength(() => 1);
    const wet = sum();
    assert.ok(wet > dry + 500, `los fiordos deberían tallar más (dry ${dry}, wet ${wet})`);
  } finally {
    setFjordStrength(null); // restaurar el estado global
  }
  assert.equal(sum(), dry, "sin fiordos la costa debe ser idéntica");
});

test("floraSpawns es determinista", () => {
  seedLayers(SEED);
  const layer = layerByName("valle");
  const camera = { x: 300 };
  assert.deepEqual(
    floraSpawns(layer, camera, W, H, SEED),
    floraSpawns(layer, camera, W, H, SEED)
  );
});

test("floraSpawns hereda el parallax: misma posición de mundo, mismos atributos", () => {
  seedLayers(SEED);
  const layer = layerByName("costa");
  const a = floraSpawns(layer, { x: 0 }, W, H, SEED);
  const b = floraSpawns(layer, { x: 350 }, W, H, SEED);
  const byWx = new Map(b.map((s) => [s.wx, s]));
  let comunes = 0;
  for (const s of a) {
    const o = byWx.get(s.wx);
    if (!o) continue;
    comunes++;
    assert.equal(o.gy, s.gy);
    assert.equal(o.type, s.type);
    assert.equal(o.size, s.size);
    assert.equal(o.warm, s.warm);
  }
  assert.ok(comunes > 0, "se esperaban plantas en la ventana común");
});

test("floraSpawns no crece dentro del cauce", () => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    for (const s of floraSpawns(layer, { x: 0 }, W, H, SEED)) {
      assert.ok(riverInfluence(layer, s.wx) <= 0.25, `${layer.name} sembró dentro del cauce`);
    }
  }
});

test("floraSpawns devuelve vacío en capas sin flora", () => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    if (layer.flora) continue;
    assert.deepEqual(floraSpawns(layer, { x: 0 }, W, H, SEED), []);
  }
});

test("floraSpawns respeta los límites de pantalla del margen", () => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    for (const s of floraSpawns(layer, { x: 0 }, W, H, SEED)) {
      assert.ok(s.sx >= -48 && s.sx <= W + 48, `sx fuera de margen: ${s.sx}`);
    }
  }
});

test("las flores de floración se reparten hacia dentro de la banda", () => {
  seedLayers(SEED);
  const layer = layerByName("costa");
  const onlyFlower = () => [{ type: "flower", w: 1 }];
  const hits = floraSpawns(layer, { x: 0 }, W, H, SEED, onlyFlower);
  assert.ok(hits.length > 0, "sin flores en la ventana");
  assert.ok(hits.every((s) => s.type === "flower"));
  assert.ok(hits.some((s) => s.depth > 0), "ninguna flor se reparte hacia dentro");
  const maxD = Math.round((layer.amp || 12) * 1.3);
  for (const s of hits) {
    assert.ok(s.depth >= 0 && s.depth <= maxD, `depth fuera de rango: ${s.depth}`);
  }
});

test("sin floración los spawns no llevan depth (dorados intactos)", () => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    for (const s of floraSpawns(layer, { x: 0 }, W, H, SEED)) {
      assert.equal(s.depth, 0, `${layer.name} añadió depth sin floración`);
    }
  }
});
