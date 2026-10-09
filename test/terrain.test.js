import test from "node:test";
import assert from "node:assert/strict";
import {
  LAYERS,
  seedLayers,
  bankHeight,
  ridgeHeight,
  riverInfluence,
  drawLayer,
  clearColumnCaches,
} from "../src/terrain.js";
import { seedToInt } from "../src/rng.js";
import { getPalette } from "../src/palette.js";
import { makeFakeCtx } from "./helpers/fakeCtx.js";

test("seedLayers mezcla la semilla en cada capa", () => {
  seedLayers(seedToInt("andes"));
  const a = LAYERS.map((l) => l._seed);
  seedLayers(seedToInt("andes"));
  assert.deepEqual(LAYERS.map((l) => l._seed), a);
  seedLayers(seedToInt("pewen"));
  assert.notDeepEqual(LAYERS.map((l) => l._seed), a);
});

test("las alturas son deterministas por semilla", () => {
  seedLayers(seedToInt("andes"));
  const h1 = LAYERS.map((l) => bankHeight(l, 1234.5));
  seedLayers(seedToInt("andes"));
  const h2 = LAYERS.map((l) => bankHeight(l, 1234.5));
  assert.deepEqual(h1, h2);
});

test("distinta semilla produce distinto terreno", () => {
  seedLayers(seedToInt("andes"));
  const a = bankHeight(LAYERS[0], 9876);
  seedLayers(seedToInt("otra"));
  const b = bankHeight(LAYERS[0], 9876);
  assert.notEqual(a, b);
});

test("ridgeHeight nunca queda por encima de bankHeight (el cauce solo talla)", () => {
  seedLayers(seedToInt("pewen"));
  for (const layer of LAYERS) {
    for (let wx = -2000; wx < 2000; wx += 17.3) {
      assert.ok(ridgeHeight(layer, wx) >= bankHeight(layer, wx) - 1e-9);
    }
  }
});

test("riverInfluence queda en [0,1] y es 0 sin ríos", () => {
  seedLayers(seedToInt("pewen"));
  for (const layer of LAYERS) {
    const hasRivers = !!layer.rivers;
    let maxInfl = 0;
    for (let wx = -2000; wx < 4000; wx += 3.1) {
      const v = riverInfluence(layer, wx);
      assert.ok(v >= 0 && v <= 1, `${layer.name}: ${v}`);
      maxInfl = Math.max(maxInfl, v);
    }
    if (!hasRivers) assert.equal(maxInfl, 0, `${layer.name} no debería tener río`);
    else assert.ok(maxInfl > 0, `${layer.name} debería tener río`);
  }
});

test("no hay ríos en playa ni mar", () => {
  const playa = LAYERS.find((l) => l.name === "playa");
  const mar = LAYERS.find((l) => l.name === "mar");
  assert.equal(playa.rivers, undefined);
  assert.equal(mar.rivers, undefined);
});

test("el caché de columnas no altera el dibujo", () => {
  seedLayers(seedToInt("andes"));
  const pal = getPalette(12, "clear");
  const layer = LAYERS.find((l) => l.name === "andes");
  const cam = { x: 12345 };
  const draw = () => {
    const ctx = makeFakeCtx();
    drawLayer(ctx, layer, pal, cam, 480, 270);
    return ctx.calls.fillRect.map((c) => c.join(","));
  };
  const first = draw(); // todo falla de caché
  const cached = draw(); // todo acierta
  assert.deepEqual(cached, first);
  clearColumnCaches();
  assert.deepEqual(draw(), first); // recomputar da lo mismo
  cam.x += 0.3; // la tolerancia de ≤1 px no debe romper
  assert.doesNotThrow(() => draw());
});
