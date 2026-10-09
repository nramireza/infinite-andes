import test from "node:test";
import assert from "node:assert/strict";
import { solarDeclination, solarTimes, solarClock, PAL_RISE, PAL_SET } from "../src/sun.js";

const LAT = -33.45; // Santiago
const LON = -70.66;

test("solarDeclination alcanza ±23.4 en los solsticios", () => {
  assert.ok(Math.abs(solarDeclination(355) + 23.44) < 0.6, "solsticio de diciembre");
  assert.ok(Math.abs(solarDeclination(172) - 23.44) < 0.6, "solsticio de junio");
});

test("en verano austral el día es largo y en invierno corto", () => {
  const verano = solarTimes(355, LAT, LON, -3);
  const invierno = solarTimes(172, LAT, LON, -4);
  assert.ok(verano.rise < 7, `amanecer de verano tarde: ${verano.rise}`);
  assert.ok(verano.set > 20, `atardecer de verano temprano: ${verano.set}`);
  assert.ok(invierno.rise > 7, `amanecer de invierno temprano: ${invierno.rise}`);
  assert.ok(invierno.set < 18, `atardecer de invierno tarde: ${invierno.set}`);
  assert.ok(verano.set - verano.rise > invierno.set - invierno.rise, "el verano debe durar más");
});

test("solarClock ancla amanecer/atardecer y es monótona", () => {
  const { rise, set } = solarTimes(355, LAT, LON, -3);
  assert.ok(Math.abs(solarClock(rise, rise, set) - PAL_RISE) < 1e-9);
  assert.ok(Math.abs(solarClock(set, rise, set) - PAL_SET) < 1e-9);
  // mediodía cae entre las anclas
  const mid = solarClock((rise + set) / 2, rise, set);
  assert.ok(mid > PAL_RISE && mid < PAL_SET, `mediodía fuera: ${mid}`);
  // monótona creciente (con salto de medianoche a la noche)
  let prev = solarClock(rise, rise, set);
  for (let h = rise + 0.25; h <= set; h += 0.25) {
    const v = solarClock(h, rise, set);
    assert.ok(v >= prev, `no monótona en h=${h}`);
    prev = v;
  }
  // continuidad alrededor del atardecer
  assert.ok(Math.abs(solarClock(set - 0.01, rise, set) - solarClock(set + 0.01, rise, set)) < 0.1);
});

test("solarClock no rompe con span inválido", () => {
  assert.equal(solarClock(12, 12, 12), 12);
});
