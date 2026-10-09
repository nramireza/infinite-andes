// Benchmark sin dependencias del costo de cómputo del paisaje.
// Usa un contexto 2D no-op para medir el trabajo de JS, no el dibujo real.
// Uso: npm run bench   (o: node scripts/bench.mjs [frames])

import { Scene } from "../src/scene.js";
import { LAYERS, seedLayers, drawLayer, drawSea, setBiomeGeometry } from "../src/terrain.js";
import { placeFlora } from "../src/flora.js";
import { placeFauna } from "../src/fauna.js";
import { getPalette } from "../src/palette.js";
import { modeWeights, biomeGeometry, biomeAt, biomeFloraPool, biomeFaunaPool, resolveBloom, bloomChanceMul } from "../src/biomes.js";
import { seedToInt } from "../src/rng.js";

const FRAMES = Number(process.argv[2]) || 300;
const noop = () => {};
const ctx = {
  fillStyle: "#000", globalAlpha: 1, imageSmoothingEnabled: false,
  createLinearGradient: () => ({ addColorStop: noop }),
  clearRect: noop, fillRect: noop, beginPath: noop, ellipse: noop, fill: noop, save: noop, restore: noop,
};
const W = 960;
const H = 270;
const SEED = seedToInt("andes");
seedLayers(SEED);
const cam = { x: 0 };
const pal = getPalette(12, "clear");

function bench(label, fn, n = FRAMES) {
  fn(0); // calentar
  const t = process.hrtime.bigint();
  for (let i = 0; i < n; i++) fn(i);
  const ms = Number(process.hrtime.bigint() - t) / 1e6 / n;
  console.log(label.padEnd(28) + ms.toFixed(3).padStart(8) + " ms/frame");
  return ms;
}

console.log(`Infinite Andes · bench (${W}x${H}, ${FRAMES} frames)\n`);

let total = 0;
total += bench("drawLayer", () => {
  setBiomeGeometry((wx) => biomeGeometry(modeWeights("auto", wx, SEED)));
  for (const l of LAYERS) {
    if (l.sea) continue;
    drawLayer(ctx, l, pal, cam, W, H);
  }
});
setBiomeGeometry(null);

total += bench("placeFlora", () => {
  for (const l of LAYERS) {
    if (!l.flora) continue;
    placeFlora(ctx, l, pal, cam, W, H, SEED, 2, (wx) => {
      const b = biomeAt(wx, SEED, "auto");
      return biomeFloraPool(l.name, b.weights, resolveBloom("auto", b), l.flora.types);
    });
  }
});

total += bench("placeFauna", () => {
  for (const l of LAYERS) {
    if (!l.fauna) continue;
    placeFauna(ctx, l, pal, cam, W, H, SEED, 12, 2,
      (wx) => {
        const b = biomeAt(wx, SEED, "auto");
        return biomeFaunaPool(l.name, b.weights, resolveBloom("auto", b), l.fauna.species);
      },
      (wx) => bloomChanceMul(resolveBloom("auto", biomeAt(wx, SEED, "auto"))));
  }
});

total += bench("drawSea", () => {
  for (const l of LAYERS) if (l.sea) drawSea(ctx, pal, cam, W, H, 2, null);
});

console.log("-".repeat(40));
console.log("suma por partes".padEnd(28) + total.toFixed(3).padStart(8) + " ms/frame");

const canvas = { width: W, height: H, getContext: () => ctx };
const scene = new Scene(canvas, SEED);
scene.weatherAuto = false;
bench("update()", (i) => { scene.camera.x += 1; scene.update(1 / 30); });
bench("render() completo", (i) => { scene.camera.x += 1; scene.render(); });
