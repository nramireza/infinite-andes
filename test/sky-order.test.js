import test from "node:test";
import assert from "node:assert/strict";
import { Scene } from "../src/scene.js";
import { getPalette } from "../src/palette.js";
import { seedToInt } from "../src/rng.js";
import { makeFakeCtx } from "./helpers/fakeCtx.js";

function fakeCanvas(ctx, W = 480, H = 270) {
  return { width: W, height: H, getContext: () => ctx };
}

test("el astro se dibuja antes que las nubes, y las nubes antes del terreno", () => {
  const ctx = makeFakeCtx();
  const scene = new Scene(fakeCanvas(ctx), seedToInt("andes"));
  scene.hour = 7; // sol bajo y visible
  scene.weatherAuto = false;
  scene.setBiome("centro"); // sin tinte, para comparar con getPalette directo
  scene.render();

  const pal = getPalette(7, "clear");
  const primerSol = ctx.ops.findIndex((o) => o.op === "fillRect" && o.color === pal.sun);
  const primeraNube = ctx.ops.findIndex((o) => o.op === "ellipse");
  const primerTerreno = ctx.ops.findIndex((o) => o.op === "fillRect" && o.color === pal.valleyD);

  assert.ok(primerSol >= 0, "no se dibujó el astro");
  assert.ok(primeraNube >= 0, "no se dibujaron nubes");
  assert.ok(primerTerreno >= 0, "no se dibujó el terreno");
  assert.ok(primerSol < primeraNube, "las nubes deben tapar al astro (nube después del sol)");
  assert.ok(primeraNube < primerTerreno, "el terreno debe tapar a las nubes");
});
