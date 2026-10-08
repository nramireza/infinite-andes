import test from "node:test";
import assert from "node:assert/strict";
import {
  SEASON_IDS, SEASONS, seasonState, seasonSnowShift, seasonWeatherBias,
  applySeason, pickSeasonWeather, SEASON_DURATION,
} from "../src/seasons.js";
import { getPalette } from "../src/palette.js";
import { Scene } from "../src/scene.js";
import { seedToInt } from "../src/rng.js";
import { BASE_H, widthForRatio } from "../src/viewport.js";
import { makeFakeCtx } from "./helpers/fakeCtx.js";
import { golden, digest } from "./helpers/golden.js";

const W = widthForRatio(16 / 9);
const H = BASE_H;
const SEED = seedToInt("andes");
const SEASON_KEYS = new Set([
  "floraL", "floraD", "costaL", "costaD", "valleyL", "valleyD",
  "sand", "sandD", "skyHorizon", "skyMid", "snow", "snowD",
]);

test("hay cuatro estaciones y una duración positiva", () => {
  assert.equal(SEASON_IDS.length, 4);
  assert.ok(SEASON_DURATION > 0);
  for (const id of SEASON_IDS) assert.ok(SEASONS[id], `falta ${id}`);
});

test("seasonState fija una estación y cicla con meseta y crossfade", () => {
  const fijo = seasonState(1.3, "otono");
  assert.equal(fijo.index, 1);
  assert.equal(fijo.next, 1);
  assert.equal(fijo.t, 0);

  assert.deepEqual(seasonState(0), { index: 0, next: 1, t: 0 });
  assert.equal(seasonState(0.9).index, 0);
  assert.ok(seasonState(0.9).t > 0, "debería estar en crossfade");
  assert.equal(seasonState(1.0).index, 1);
  assert.equal(seasonState(1.0).t, 0);
  assert.equal(seasonState(3.9).index, 3);
  assert.equal(seasonState(3.9).next, 0, "la última estación enlaza con la primera");
  assert.equal(seasonState(4.0).index, 0);
});

test("el invierno baja la línea de nieve y el verano la sube", () => {
  const inv = seasonSnowShift(seasonState(0, "invierno"));
  const ver = seasonSnowShift(seasonState(0, "verano"));
  assert.ok(inv > 0 && ver < 0, `invierno=${inv} verano=${ver}`);
  assert.ok(inv > ver);
});

test("el sesgo de clima favorece la nieve en invierno", () => {
  const inv = seasonWeatherBias(seasonState(0, "invierno"));
  const ver = seasonWeatherBias(seasonState(0, "verano"));
  for (const k of Object.keys(inv)) assert.ok(inv[k] >= 0);
  assert.ok(inv.snow > ver.snow, "el invierno debería tener más nieve");
  assert.ok(ver.clear > inv.clear, "el verano debería tener más despejado");
});

test("pickSeasonWeather es determinista y respeta el sesgo", () => {
  const st = seasonState(0, "invierno");
  assert.equal(pickSeasonWeather(st, () => 0.1), pickSeasonWeather(st, () => 0.1));
  let snow = 0;
  let r = 0;
  for (let i = 0; i < 1000; i++) {
    if (pickSeasonWeather(st, () => ((r = (r + 0.37) % 1))) === "snow") snow++;
  }
  assert.ok(snow > 250, `se esperaba bastante nieve (fue ${snow}/1000)`);
});

test("applySeason no muta la base y solo toca claves de estación", () => {
  const base = getPalette(12, "clear");
  const before = { ...base };
  const out = applySeason(base, seasonState(0, "otono"), 0.5);
  assert.deepEqual(base, before, "applySeason mutó la paleta base");
  for (const k in out) {
    if (out[k] !== before[k]) assert.ok(SEASON_KEYS.has(k), `clave fuera de estación: ${k}`);
  }
  assert.equal(out.skyHorizon !== before.skyHorizon || out.floraL !== before.floraL, true);
});

test("applySeason con fuerza 0 o verano no cambia la paleta", () => {
  const base = getPalette(12, "clear");
  assert.deepEqual(applySeason(base, seasonState(0, "otono"), 0), base);
  assert.deepEqual(applySeason(base, seasonState(0, "verano"), 0.5), base);
});

test("el pipeline de estaciones no lanza y dibuja", () => {
  for (const id of ["auto", ...SEASON_IDS]) {
    const ctx = makeFakeCtx();
    const canvas = { width: W, height: H, getContext: () => ctx };
    const scene = new Scene(canvas, SEED);
    scene.weatherAuto = false;
    scene.setSeason(id);
    assert.doesNotThrow(() => scene.render(), `season=${id}`);
    assert.ok(ctx.calls.fillRect.length > 0, `sin dibujo: season=${id}`);
  }
});

test("el ciclo de estación avanza con el tiempo", () => {
  const ctx = makeFakeCtx();
  const canvas = { width: W, height: H, getContext: () => ctx };
  const scene = new Scene(canvas, SEED);
  scene.season = "auto";
  const p0 = scene.seasonPhase;
  scene.update(SEASON_DURATION);
  assert.ok(scene.seasonPhase > p0, "la fase de estación debería avanzar");
});

test("dorado de la paleta por estación", (t) => {
  for (const id of SEASON_IDS) {
    const pal = applySeason(getPalette(12, "clear"), seasonState(0, id), 0.5);
    const vals = [];
    for (const k of Object.keys(pal).sort()) vals.push(`${k}:${pal[k]}`);
    golden(t, `palette.season.${id}`, digest(vals));
  }
});
