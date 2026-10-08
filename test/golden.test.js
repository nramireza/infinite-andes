// Regresión dorada: fija el terreno, los ríos, la flora y la paleta.
// Regenerar tras un cambio intencional: UPDATE_GOLDEN=1 npm test

import test from "node:test";
import { LAYERS, seedLayers, bankHeight, ridgeHeight, riverEvents } from "../src/terrain.js";
import { floraSpawns } from "../src/flora.js";
import { faunaSpawns } from "../src/fauna.js";
import { getPalette } from "../src/palette.js";
import { seedToInt } from "../src/rng.js";
import { BASE_H, widthForRatio } from "../src/viewport.js";
import { golden, digest } from "./helpers/golden.js";

const SEED = seedToInt("andes");
const W = widthForRatio(16 / 9);
const H = BASE_H;

test("dorado del terreno", (t) => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    const vals = [];
    for (let wx = -1200; wx <= 2400; wx += 50) {
      vals.push(bankHeight(layer, wx), ridgeHeight(layer, wx));
    }
    golden(t, `terrain.${layer.name}`, digest(vals));
  }
});

test("dorado de los ríos", (t) => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    if (!layer.rivers) continue;
    const map = new Map();
    for (const cam of [-20000, -10000, 0, 10000, 20000]) {
      for (const e of riverEvents(layer, { x: cam }, 12000)) map.set(e.xc, e.seed);
    }
    const vals = [];
    for (const [xc, seed] of [...map.entries()].sort((a, b) => a[0] - b[0])) {
      vals.push(xc, seed);
    }
    golden(t, `rivers.${layer.name}`, digest(vals));
  }
});

test("dorado de la flora", (t) => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    if (!layer.flora) continue;
    const vals = [];
    for (const s of floraSpawns(layer, { x: 0 }, W, H, SEED)) {
      vals.push(s.wx, s.gy, s.type, s.size, s.warm);
    }
    golden(t, `flora.${layer.name}`, digest(vals));
  }
});

test("dorado de la fauna", (t) => {
  seedLayers(SEED);
  for (const layer of LAYERS) {
    if (!layer.fauna) continue;
    const map = new Map();
    for (const hour of [0, 12, 20]) {
      for (const cam of [-4000, 0, 4000, 8000, 12000]) {
        for (const s of faunaSpawns(layer, { x: cam }, W, H, SEED, hour)) {
          map.set(`${hour}:${s.wx}`, [s.wx, s.gy, s.flightY, s.type, s.phase, s.dir]);
        }
      }
    }
    const vals = [];
    for (const key of [...map.keys()].sort()) vals.push(...map.get(key));
    golden(t, `fauna.${layer.name}`, digest(vals));
  }
});

test("dorado de la paleta", (t) => {
  const vals = [];
  for (const h of [0, 6, 12, 18]) {
    const pal = getPalette(h, "clear");
    for (const k of Object.keys(pal).sort()) vals.push(`${k}:${pal[k]}`);
  }
  golden(t, "palette.clear", digest(vals));
});
