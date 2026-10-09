import test from "node:test";
import assert from "node:assert/strict";
import { Sky, meteorAt } from "../src/sky.js";
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

test("meteorAt es determinista, acotado y ocasional", () => {
  let found = 0;
  for (let t = 0; t < 60; t += 0.1) {
    const a = meteorAt(12345, t);
    assert.deepEqual(a, meteorAt(12345, t));
    if (!a) continue;
    found++;
    assert.ok(a.x > 0 && a.x < 1.4);
    assert.ok(a.y > 0 && a.y < 0.6);
    assert.ok(a.alpha > 0 && a.alpha <= 1);
  }
  assert.ok(found > 0 && found < 600, `meteoros encontrados: ${found}`);
});

test("las estrellas fugaces solo se dibujan de noche", () => {
  const sky = new Sky(seedToInt("andes"));
  let t = 0;
  while (!meteorAt(sky.seed, t) && t < 200) t += 0.05;
  assert.ok(t < 200, "no se halló un instante con meteoro");
  const day = makeFakeCtx();
  sky.drawShootingStars(day, W, H, getPalette(12, "clear"), 0, t);
  assert.equal(day.calls.fillRect.length, 0);
  const night = makeFakeCtx();
  sky.drawShootingStars(night, W, H, getPalette(1, "clear"), 1, t);
  assert.ok(night.calls.fillRect.length > 0);
});

// Estado celeste de luna fabricado a mano (mismo contrato que `celestial`).
function moonCel(phase, r = 5) {
  return {
    isSun: false, u: 0.1, x: W / 2, y: 60, r, depth: 0.1,
    horizonY: 118, rising: true, visible: true,
    phase, illum: 1 - 2 * Math.abs(phase - 0.5),
  };
}

function litCount(ctx, color) {
  return ctx.calls.fillRect.filter((c) => c[4] === color).length;
}

test("la luna cambia de fase: nueva sin cara iluminada, llena completa", () => {
  const sky = new Sky(seedToInt("andes"));
  const pal = getPalette(1, "clear");
  const nueva = makeFakeCtx();
  sky.drawBody(nueva, moonCel(0), pal);
  assert.equal(litCount(nueva, pal.sun), 0, "luna nueva no debe tener cara iluminada");
  const llena = makeFakeCtx();
  sky.drawBody(llena, moonCel(0.5), pal);
  assert.ok(litCount(llena, pal.sun) > 5, "luna llena iluminada");
});

test("creciente y menguante iluminan lados opuestos", () => {
  const sky = new Sky(seedToInt("andes"));
  const pal = getPalette(1, "clear");
  const cx = W / 2;
  const lados = (phase) => {
    const ctx = makeFakeCtx();
    sky.drawBody(ctx, moonCel(phase), pal);
    let left = 0;
    let right = 0;
    for (const [x] of ctx.calls.fillRect.filter((c) => c[4] === pal.sun)) {
      if (x < cx) left++;
      else right++;
    }
    return [left, right];
  };
  const creciente = lados(0.25);
  const menguante = lados(0.75);
  assert.ok(creciente[1] > creciente[0], "creciente ilumina la derecha");
  assert.ok(menguante[0] > menguante[1], "menguante ilumina la izquierda");
});

test("la luna llena apaga las estrellas más débiles", () => {
  const sky = new Sky(seedToInt("andes"));
  const pal = getPalette(1, "clear");
  const sinLuna = makeFakeCtx();
  sky.drawStars(sinLuna, W, H, pal, 1, 0, 0);
  const conLuna = makeFakeCtx();
  sky.drawStars(conLuna, W, H, pal, 1, 0, 1);
  const brillo = (ctx) => ctx.calls.fillRect.reduce((t, c) => t + (c[5] || 0), 0);
  assert.ok(brillo(conLuna) < brillo(sinLuna), "con luna llena hay menos brillo de estrellas");
  assert.ok(conLuna.calls.fillRect.length > 0, "aún quedan estrellas");
});

test("el resplandor del astro se tiñe según la estación", () => {
  const sky = new Sky(seedToInt("andes"));
  const pal = getPalette(19.1, "clear");
  const cel = sky.celestial(19.1, W, H, undefined, undefined, 0.5);
  const base = makeFakeCtx();
  sky.drawGlow(base, pal, cel, W, H, null);
  assert.ok(litCount(base, pal.sunGlow) > 0, "el resplandor base usa sunGlow");
  const teñido = makeFakeCtx();
  sky.drawGlow(teñido, pal, cel, W, H, { color: "#ff0000", amount: 1 });
  assert.ok(litCount(teñido, "#ff0000") > 0, "no se tiñó el resplandor");
  assert.equal(litCount(teñido, pal.sunGlow), 0, "el tinte reemplaza el color base");
});
