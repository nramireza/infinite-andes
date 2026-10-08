import test from "node:test";
import assert from "node:assert/strict";
import { Sky } from "../src/sky.js";
import { getPalette, nightAmount } from "../src/palette.js";
import { seedToInt } from "../src/rng.js";
import { makeFakeCtx } from "./helpers/fakeCtx.js";

const W = 960;
const H = 270;

function draw(sky, ctx, hour) {
  const pal = getPalette(hour, "clear");
  sky.draw(ctx, W, H, pal, nightAmount(hour), 0, null);
  return ctx;
}

// Normaliza los fillRect: el degradado del cielo no es comparable por identidad.
function pixels(ctx) {
  return ctx.calls.fillRect.map(([x, y, w, h, c]) => [x, y, w, h, typeof c === "string" ? c : "gradient"]);
}

test("la Vía Láctea es determinista por semilla", () => {
  const seed = seedToInt("andes");
  const a = draw(new Sky(seed), makeFakeCtx(), 1);
  const b = draw(new Sky(seed), makeFakeCtx(), 1);
  assert.deepEqual(pixels(a), pixels(b));
});

test("semillas distintas producen cielo nocturno distinto", () => {
  const a = draw(new Sky(seedToInt("andes")), makeFakeCtx(), 1);
  const b = draw(new Sky(seedToInt("pewen")), makeFakeCtx(), 1);
  assert.notDeepEqual(pixels(a), pixels(b));
});

test("la Vía Láctea solo aparece de noche", () => {
  const sky = new Sky(seedToInt("andes"));
  const day = draw(sky, makeFakeCtx(), 12);
  const night = draw(sky, makeFakeCtx(), 1);
  // de noche hay muchos más píxeles (banda + estrellas + aurora)
  assert.ok(pixels(night).length > pixels(day).length * 3);
});
