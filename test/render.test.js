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

test("drawSea refleja el astro cuando se pasa el estado celeste", () => {
  seedLayers(SEED);
  const pal = getPalette(6.7, "clear");
  const cel = { x: W / 2, y: 120, horizonY: 118, rising: true, visible: true, isSun: true, r: 4, depth: 0.2, u: 0.1 };
  const ctx = makeFakeCtx();
  drawSea(ctx, pal, { x: 0 }, W, H, 2, cel);
  const refl = ctx.calls.fillRect.filter(([x, y]) => Math.abs(x - W / 2) < 20 && y >= 242);
  assert.ok(refl.length > 0, "no se dibujó el reflejo del astro");
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
    for (const weather of ["clear", "snow", "rain", "fog", "wind", "storm"]) {
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

test("el pipeline de biomas (región y floración) no lanza y dibuja", () => {
  for (const biome of ["auto", "norte", "centro", "sur"]) {
    for (const bloom of ["auto", "on", "off"]) {
      const ctx = makeFakeCtx();
      const canvas = { width: W, height: H, getContext: () => ctx };
      const scene = new Scene(canvas, SEED);
      scene.weatherAuto = false;
      scene.setBiome(biome);
      scene.setBloom(bloom);
      assert.doesNotThrow(() => scene.render(), `biome=${biome} bloom=${bloom}`);
      assert.ok(ctx.calls.fillRect.length > 0, `sin dibujo: biome=${biome} bloom=${bloom}`);
    }
  }
});

test("la floración del norte dibuja flores (tipo flower)", () => {
  seedLayers(SEED);
  const layer = layerByName("valle");
  const ctx = makeFakeCtx();
  const canvas = { width: W, height: H, getContext: () => ctx };
  const scene = new Scene(canvas, SEED);
  scene.weatherAuto = false;
  scene.setBiome("norte");
  scene.setBloom("on");
  scene.render();
  // El desierto florido usa colores propios de flor; al menos uno debe aparecer.
  const flowerColors = new Set(["#e05a9a", "#f2c14e", "#f4f0e6", "#9a6ad0"]);
  const drew = ctx.calls.fillRect.some((c) => flowerColors.has(c[4]));
  assert.ok(drew, "no se dibujaron flores en el norte con floración");
});

test("los nuevos tipos de flora dibujan dentro del lienzo", () => {
  seedLayers(SEED);
  const pal = getPalette(12, "clear");
  const base = layerByName("valle");
  for (const type of ["cactus", "alerce", "nalca", "colihue", "palma", "flower", "coihue", "roble", "copihue", "michay"]) {
    const layer = { ...base, flora: { ...base.flora, types: [type] } };
    const ctx = makeFakeCtx();
    placeFlora(ctx, layer, pal, { x: 100 }, W, H, SEED, 0);
    assert.ok(ctx.calls.fillRect.length > 0, `${type} no dibujó`);
    assert.deepEqual(collectOutOfBounds(ctx, W, H, 64), [], `${type} dibujó fuera`);
  }
});

test("el reloj real mapea la paleta al sol y setClock cambia de modo", () => {
  const ctx = makeFakeCtx();
  const canvas = { width: W, height: H, getContext: () => ctx };
  const scene = new Scene(canvas, SEED);
  scene.weatherAuto = false;
  assert.equal(scene.clock, "real");
  const s = scene.solar();
  assert.ok(s && s.rise > 0 && s.set > s.rise, "sol del día inválido");
  scene.hour = 12; // mediodía real → debe caer dentro del día de la paleta
  const ph = scene.paletteHour();
  assert.ok(ph >= 6 && ph <= 18.25, `mediodía fuera del día: ${ph}`);
  scene.setClock("fast");
  assert.equal(scene.paletteHour(), 12, "en rápido la hora se usa tal cual");
  assert.doesNotThrow(() => scene.render());
});

test("el reloj rápido cuenta días y avanza la fase lunar", () => {
  const ctx = makeFakeCtx();
  const canvas = { width: W, height: H, getContext: () => ctx };
  const scene = new Scene(canvas, SEED);
  scene.weatherAuto = false;
  scene.setClock("fast");
  const p0 = scene.moonPhase();
  scene.update(24 / 0.125); // un día completo a 0.125 h/s
  assert.equal(scene.dayNum, 1);
  assert.notEqual(scene.moonPhase(), p0, "la fase lunar debería avanzar");
});
