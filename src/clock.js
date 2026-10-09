// Reloj real: hora local del equipo y estación del año según la fecha.
// Puro (recibe `Date`) para poder testearlo con fechas fijas.

import { SEASON_IDS } from "./seasons.js";

// Hora local como fracción de día (0..24), con minutos y segundos.
export function localHour(date) {
  return (
    date.getHours() +
    date.getMinutes() / 60 +
    date.getSeconds() / 3600 +
    date.getMilliseconds() / 3600000
  );
}

// Día del año (0 = 1 de enero), en fecha local.
export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / 86400000);
}

// Estación del hemisferio sur: verano dic–feb, otoño mar–may, invierno jun–ago, primavera sep–nov.
export function seasonForDate(date) {
  const m = date.getMonth(); // 0..11
  if (m === 11 || m <= 1) return "verano";
  if (m <= 4) return "otono";
  if (m <= 7) return "invierno";
  return "primavera";
}

function seasonStart(year, id) {
  if (id === "verano") return new Date(year, 11, 1); // 1 dic
  if (id === "otono") return new Date(year, 2, 1); // 1 mar
  if (id === "invierno") return new Date(year, 5, 1); // 1 jun
  return new Date(year, 8, 1); // 1 sep (primavera)
}

// Fase continua 0..4 alineada con `SEASON_IDS` (verano=0) para `seasonState`.
export function seasonPhaseForDate(date) {
  const id = seasonForDate(date);
  const index = SEASON_IDS.indexOf(id);
  let startYear = date.getFullYear();
  if (id === "verano" && date.getMonth() <= 1) startYear -= 1; // ene/feb: el verano empezó en diciembre previo
  const start = seasonStart(startYear, id);
  const nextId = SEASON_IDS[(index + 1) % 4];
  const nextStart = seasonStart(id === "verano" ? startYear + 1 : startYear, nextId);
  const progress = (date - start) / (nextStart - start);
  return index + Math.min(1, Math.max(0, progress));
}

// Fase lunar: 0 = luna nueva, 0.5 = llena, 1 = de vuelta a nueva.
// Ciclo sinódico aproximado (29.53 días) desde una época fija de luna nueva.

export const MOON_CYCLE = 29.530588;

function leapYearsBefore(y) {
  return Math.floor((y - 1) / 4) - Math.floor((y - 1) / 100) + Math.floor((y - 1) / 400);
}

// Días transcurridos desde el 1 de enero de 2000 (0 = ese día).
export function daysSince2000(year, dayOfYear) {
  const y = Number(year);
  return (y - 2000) * 365 + (leapYearsBefore(y) - leapYearsBefore(2000)) + Number(dayOfYear);
}

// Fase [0,1) para una cantidad de días desde la época de luna nueva (2000-01-06).
export function moonPhaseFromDays(days) {
  const d = ((Number(days) - 5) % MOON_CYCLE + MOON_CYCLE) % MOON_CYCLE;
  return d / MOON_CYCLE;
}

// Fase lunar para una fecha (año + día del año, 0 = 1 de enero).
export function moonPhaseForDate(year, dayOfYear) {
  return moonPhaseFromDays(daysSince2000(year, dayOfYear));
}
