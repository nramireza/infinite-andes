// Sol real: amanecer/atardecer según el día del año y la latitud, y reasignación
// de la hora real a la curva de la paleta. Puro para poder testearlo con valores fijos.

const DEG = Math.PI / 180;

// Declinación solar aproximada (grados) para un día del año.
export function solarDeclination(dayOfYear) {
  return -23.44 * Math.cos(2 * Math.PI * ((dayOfYear + 10) / 365.25));
}

// Corrección por ecuación del tiempo (minutos).
function equationOfTime(dayOfYear) {
  const B = 2 * Math.PI * ((dayOfYear - 81) / 364);
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

// Salida/puesta del sol en hora local de reloj. `tzHours` al oeste es negativo (Chile).
export function solarTimes(dayOfYear, lat, longitude, tzHours = 0) {
  const decl = solarDeclination(dayOfYear) * DEG;
  const phi = lat * DEG;
  const cosH = Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(decl)));
  const halfDay = (Math.acos(cosH) / DEG) / 15; // horas de sol/2
  const noon = 12 - longitude / 15 + tzHours + equationOfTime(dayOfYear) / 60;
  return { rise: noon - halfDay, set: noon + halfDay, noon };
}

// Anclas de la curva de paleta/cielo (ver KEYS de palette.js y RISE/SET de sky.js).
export const PAL_RISE = 6.0;
export const PAL_SET = 18.25;

// Reasigna la hora real a la curva fija: amanecer->PAL_RISE, atardecer->PAL_SET,
// mediodía al centro, y la noche comprimida. Monótona y continua.
export function solarClock(hour, rise, set) {
  const span = set - rise;
  if (!(span > 0.1)) return hour; // seguridad en latitudes extremas
  if (hour >= rise && hour <= set) {
    return PAL_RISE + ((hour - rise) * (PAL_SET - PAL_RISE)) / span;
  }
  const h = hour >= set ? hour : hour + 24;
  const nightSpan = rise + 24 - set;
  const mapped = PAL_SET + ((h - set) * (PAL_RISE + 24 - PAL_SET)) / nightSpan;
  return mapped % 24;
}
