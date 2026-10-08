import test from "node:test";
import assert from "node:assert/strict";
import { getPalette, lerpColor } from "../src/palette.js";
import { LAYERS, seedLayers, drawLayer, drawSea, riverEvents } from "../src/terrain.js";
import { placeFlora } from "../src/flora.js";
import { Scene } from "../src/scene.js";
import { seedToInt } from "../src/rng.js";
import { BASE_H, widthForRatio } from "../src/viewport.js";
import { makeFakeCtx, collectOutOfBounds } from "./helpers/fakeCtx.js";

const W = widthForRatio(16 / 9);
const H = BASE_H;
const SEED = seedToInt("pewen");

function layerByName(name) {
  return LAYERS.find((l) => l.name === name);
}

test("drawLayer no falla y dibuja en las 6 capas", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  for (const layer of LAYERS) {
    if (layer.sea) continue;
    const ctx = makeFakeCtx();
    drawLayer(ctx, layer, pal, { x: 100 }, W, H);
    assert.ok(ctx.calls.fillRect.length > 0, `${layer.name} no dibujó nada`);
  }
});

test("drawLayer (con río) se mantiene dentro del lienzo", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  for (const layer of LAYERS) {
    if (layer.sea) continue;
    const ctx = makeFakeCtx();
    drawLayer(ctx, layer, pal, { x: 0 }, W, H);
    assert.deepEqual(collectOutOfBounds(ctx, W, H, 4), [], `${layer.name} dibujó fuera`);
  }
});

test("drawSea se mantiene dentro del lienzo", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  const ctx = makeFakeCtx();
  drawSea(ctx, pal, { x: 0 }, W, H, 3.5);
  assert.ok(ctx.calls.fillRect.length > 0);
  assert.deepEqual(collectOutOfBounds(ctx, W, H, 1), []);
});

test("placeFlora no falla y dibuja", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  const ctx = makeFakeCtx();
  for (const layer of LAYERS) {
    placeFlora(ctx, layer, pal, { x: 200 }, W, H, SEED, 1.25);
  }
  assert.ok(ctx.calls.fillRect.length > 0);
});

test("el pipeline con contexto falso no lanza en varias horas y climas", () => {
  seedLayers(SEED);
  for (const hour of [3, 7, 12, 18, 22]) {
    for (const weather of ["clear", "snow", "rain", "fog", "wind"]) {
      const pal = getPalette(hour, weather);
      const ctx = makeFakeCtx();
      for (const layer of LAYERS) {
        if (layer.sea) drawSea(ctx, pal, { x: 40 }, W, H, 0);
        else {
          drawLayer(ctx, layer, pal, { x: 40 }, W, H);
          placeFlora(ctx, layer, pal, { x: 40 }, W, H, SEED, 0);
        }
      }
      assert.ok(ctx.calls.fillRect.length > 0, `sin dibujo a las ${hour}h ${weather}`);
    }
  }
});

// Busca una posición de cámara donde la capa tenga un río en pantalla.
function cameraWithRiver(layer) {
  const p = layer.parallax;
  for (let cx = 0; cx < 30000; cx += 23) {
    for (const e of riverEvents(layer, { x: cx }, W)) {
      const sx = e.xc - cx * p;
      if (sx > 0 && sx < W) return cx;
    }
  }
  return null;
}

test("valle y costa dibujan el agua del canal", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  const agua = lerpColor(pal.sea, pal.seaHi, 0.3);
  for (const name of ["valle", "costa"]) {
    const layer = layerByName(name);
    const cx = cameraWithRiver(layer);
    assert.notEqual(cx, null, `${name}: no se halló río`);
    const ctx = makeFakeCtx();
    drawLayer(ctx, layer, pal, { x: cx }, W, H);
    const colors = new Set(ctx.calls.fillRect.map((c) => c[4]));
    assert.ok(colors.has(agua), `${name} no dibujó el agua del canal`);
  }
});

test("Scene.resize cambia el lienzo y sigue renderizando", () => {
  const ctx = makeFakeCtx();
  const canvas = { width: W, height: H, getContext: () => ctx };
  const scene = new Scene(canvas, SEED);
  scene.weatherAuto = false;
  scene.render();
  scene.resize(960, H);
  assert.equal(scene.W, 960);
  assert.equal(scene.weather.W, 960);
  assert.doesNotThrow(() => scene.render());
});
