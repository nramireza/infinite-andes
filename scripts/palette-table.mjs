// Genera la tabla de la paleta maestra (una columna por franja horaria).
// Uso: node scripts/palette-table.mjs > docs/14-paleta-maestra.md

import { FIELDS, KEYS } from "../src/palette.js";

const keys = KEYS.slice(0, -1); // la última duplica la medianoche

function hourLabel(t) {
  const total = Math.round(t * 24 * 60);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const out = [];
out.push("# 14 · Paleta maestra");
out.push("");
out.push("> Estado: estable · Actualizado: 2026-10-08");
out.push("");
out.push("Valores de `getPalette` por franja horaria (sin clima). **Generado** desde");
out.push("`src/palette.js` con `npm run palette`; no editar a mano.");
out.push("");
out.push(`| Campo | ${keys.map((k) => hourLabel(k.t)).join(" | ")} |`);
out.push(`|-------|${keys.map(() => "------").join("|")}|`);
for (const f of FIELDS) {
  out.push(`| \`${f}\` | ${keys.map((k) => k.p[f]).join(" | ")} |`);
}
out.push("");
console.log(out.join("\n"));
