import test from "node:test";
import assert from "node:assert/strict";
import { localHour, dayOfYear, seasonForDate, seasonPhaseForDate } from "../src/clock.js";

test("localHour devuelve la hora local con fracción", () => {
  assert.equal(localHour(new Date(2026, 0, 15, 20, 30, 0)), 20.5);
  assert.equal(localHour(new Date(2026, 0, 15, 0, 0, 0)), 0);
  assert.equal(localHour(new Date(2026, 0, 15, 23, 15, 0)), 23.25);
});

test("dayOfYear cuenta desde el 1 de enero", () => {
  assert.equal(dayOfYear(new Date(2026, 0, 1)), 0);
  assert.equal(dayOfYear(new Date(2026, 1, 1)), 31);
  assert.equal(dayOfYear(new Date(2026, 11, 31)), 364);
});

test("seasonForDate usa el hemisferio sur", () => {
  assert.equal(seasonForDate(new Date(2026, 0, 15)), "verano");
  assert.equal(seasonForDate(new Date(2026, 11, 15)), "verano");
  assert.equal(seasonForDate(new Date(2026, 3, 10)), "otono");
  assert.equal(seasonForDate(new Date(2026, 6, 10)), "invierno");
  assert.equal(seasonForDate(new Date(2026, 9, 10)), "primavera");
});

test("seasonPhaseForDate es continua y con fase exacta en los inicios", () => {
  assert.equal(seasonPhaseForDate(new Date(2026, 11, 1)), 0); // verano
  assert.equal(seasonPhaseForDate(new Date(2026, 2, 1)), 1); // otoño
  assert.equal(seasonPhaseForDate(new Date(2026, 5, 1)), 2); // invierno
  assert.equal(seasonPhaseForDate(new Date(2026, 8, 1)), 3); // primavera
  // mediados de verano cae dentro de [0,1)
  const mid = seasonPhaseForDate(new Date(2026, 0, 15));
  assert.ok(mid > 0.3 && mid < 0.7, `fase de verano fuera de rango: ${mid}`);
});
