// Genera las fichas de especies (docs/especies/) y las tablas de 05/06 a partir
// de los registros `FLORA` y `SPECIES` (fuente única). Uso: `npm run species`.

import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { FLORA } from "../src/flora.js";
import { SPECIES, RARITY_WEIGHT } from "../src/fauna.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "docs", "especies");
const TODAY = new Date().toISOString().slice(0, 10);

const BIOME_NAME = {
  altiplano: "Altiplano", norte: "Norte", centro: "Centro",
  sur: "Sur", patagonia: "Patagonia", austral: "Austral",
};
const LAYER_NAME = {
  andes: "Andes", precordillera: "Precordillera", valle: "Valle",
  costa: "Costa", playa: "Playa", mar: "Mar",
};
const ACTIVE = { day: "día", night: "noche", dusk: "crepúsculo" };
const RARITY = { abundante: "abundante", comun: "común", "poco-comun": "poco-común", rara: "rara", "muy-rara": "muy-rara" };

function zonesOf(def) {
  return def.zones || {};
}

function zoneLabel(def) {
  const zones = zonesOf(def);
  const biomes = Object.keys(zones);
  if (biomes.length === 0) return "—";
  const layers = new Set();
  for (const b of biomes) for (const l in zones[b]) layers.add(l);
  const bs = biomes.map((b) => BIOME_NAME[b] || b).join(", ");
  const ls = [...layers].map((l) => (LAYER_NAME[l] || l).toLowerCase()).join(", ");
  return `${bs} (${ls})`;
}

function layersOf(def) {
  const layers = new Set();
  for (const b in zonesOf(def)) for (const l in zonesOf(def)[b]) layers.add(l);
  return [...layers].map((l) => LAYER_NAME[l] || l).join(", ") || "—";
}

function sci(d) {
  return d.sci ? `*${d.sci}*` : "—";
}

// --- Tablas de docs ---------------------------------------------------------

function floraTable() {
  const rows = [
    "| Nombre común | Nombre científico | Endémica | Tipo en código | Zona/capa | Notas |",
    "|--------------|-------------------|----------|----------------|-----------|-------|",
  ];
  for (const type in FLORA) {
    const d = FLORA[type];
    rows.push(`| ${d.common || "—"} | ${sci(d)} | ${d.endemism || "—"} | \`${type}\` | ${zoneLabel(d)} | ${d.notes || "—"} |`);
  }
  return rows.join("\n");
}

function faunaImplementadoTable() {
  const rows = [
    "| Tipo en código | Nombre común | Capa(s) | Movimiento | Actividad |",
    "|----------------|--------------|---------|------------|-----------|",
  ];
  for (const type in SPECIES) {
    const d = SPECIES[type];
    const extra = d.placement?.river ? " (borde del cauce)" : "";
    rows.push(`| \`${type}\` | ${d.common} | ${layersOf(d)}${extra} | \`${d.movement}\` | ${ACTIVE[d.active] || d.active} |`);
  }
  return rows.join("\n");
}

function faunaDensidadTable() {
  const entries = Object.keys(SPECIES)
    .map((type) => ({ type, d: SPECIES[type], w: RARITY_WEIGHT[SPECIES[type].rarity] ?? 1 }))
    .sort((a, b) => b.w - a.w || a.d.common.localeCompare(b.d.common));
  return entries
    .map(({ d, w }) => `| ${d.common} | ${d.iucn || "—"} | ${d.chile || "—"} | ${RARITY[d.rarity] || d.rarity} | ${w} |`)
    .join("\n");
}

function faunaObjetivoTable() {
  const rows = [
    "| Nombre común | Nombre científico | Endémica | Capa/zona | Actividad | Comportamiento |",
    "|--------------|-------------------|----------|-----------|-----------|----------------|",
  ];
  for (const type in SPECIES) {
    const d = SPECIES[type];
    rows.push(`| ${d.common} | ${sci(d)} | ${d.endemism || "—"} | ${zoneLabel(d)} | ${ACTIVE[d.active] || d.active} | ${d.notes || "—"} |`);
  }
  return rows.join("\n");
}

// Reemplaza el contenido entre `<!-- BEGIN:tag -->` y `<!-- END:tag -->`.
function inject(file, tag, content) {
  const src = readFileSync(file, "utf8");
  const begin = `<!-- BEGIN:${tag}`;
  const end = `<!-- END:${tag} -->`;
  const i = src.indexOf(begin);
  const j = src.indexOf(end);
  if (i < 0 || j < 0 || j < i) throw new Error(`marcadores ${tag} no hallados en ${file}`);
  const beginLineEnd = src.indexOf("-->", i) + 3;
  const result = `${src.slice(0, i)}${src.slice(i, beginLineEnd)}\n${content}\n${src.slice(j)}`;
  writeFileSync(file, result);
}

// --- Fichas -----------------------------------------------------------------

function row(k, v) {
  return `| ${k} | ${v} |`;
}

function floraFicha(type) {
  const d = FLORA[type];
  return [
    `# ${d.common || type} (\`${type}\`)`,
    "",
    `> Ficha generada con \`npm run species\` · Actualizado: ${TODAY}`,
    "",
    "| Campo | Valor |",
    "|-------|-------|",
    row("Nombre común", d.common || "—"),
    row("Nombre científico", sci(d)),
    row("Endémica de Chile", d.endemism || "—"),
    row("Tipo en código", `\`${type}\` (flora)`),
    row("Zona / capa", zoneLabel(d)),
    "",
    "## Notas",
    "",
    d.notes || "—",
    "",
    "## Referencias",
    "",
    "- [05 · Flora](../../05-flora.md)",
    "- [`src/flora.js`](../../../src/flora.js)",
    "",
  ].join("\n");
}

function faunaFicha(type) {
  const d = SPECIES[type];
  const base = d.frames?.[0] || [];
  const w = base.length ? Math.max(...base.map((r) => r.length)) : 0;
  return [
    `# ${d.common} (\`${type}\`)`,
    "",
    `> Ficha generada con \`npm run species\` · Actualizado: ${TODAY}`,
    "",
    "| Campo | Valor |",
    "|-------|-------|",
    row("Nombre común", d.common),
    row("Nombre científico", sci(d)),
    row("Endémica de Chile", d.endemism || "—"),
    row("Estado UICN", d.iucn || "—"),
    row("Tipo en código", `\`${type}\` (fauna)`),
    row("Movimiento", `\`${d.movement}\``),
    row("Actividad", ACTIVE[d.active] || d.active),
    row("Rareza (juego)", RARITY[d.rarity] || d.rarity),
    row("Anclaje", d.anchor === "ground" ? "pies" : "centro"),
    row("Colocación", d.placement?.river ? "borde del cauce" : "por chunk"),
    row("Sprite", `${w}×${base.length} px · ${d.frames.length} frames`),
    "",
    "## Notas",
    "",
    d.notes || "—",
    "",
    "## Referencias",
    "",
    "- [06 · Fauna](../../06-fauna.md)",
    "- [`src/fauna.js`](../../../src/fauna.js)",
    "",
  ].join("\n");
}

// --- Salida -----------------------------------------------------------------

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const floraCodes = Object.keys(FLORA).filter((t) => FLORA[t].kind === "especie");
const faunaCodes = Object.keys(SPECIES);
for (const type of floraCodes) writeFileSync(join(OUT, `flora-${type}.md`), floraFicha(type));
for (const type of faunaCodes) writeFileSync(join(OUT, `fauna-${type}.md`), faunaFicha(type));

const index = [
  "# Especies",
  "",
  `> Fichas generadas con \`npm run species\` · Actualizado: ${TODAY}`,
  "",
  "Una ficha por especie (flora y fauna), generada desde los registros `FLORA` y `SPECIES`",
  "(fuente única de identidad, zonas y metadata). Plantilla en [`../templates/especimen.md`](../templates/especimen.md).",
  "",
  "## Flora",
  "",
  ...floraCodes.map((t) => `- [${FLORA[t].common}](flora-${t}.md)`),
  "",
  "## Fauna",
  "",
  ...faunaCodes.map((t) => `- [${SPECIES[t].common}](fauna-${t}.md)`),
  "",
].join("\n");
writeFileSync(join(OUT, "README.md"), index);

inject(join(ROOT, "docs", "05-flora.md"), "flora-tabla", floraTable());
inject(join(ROOT, "docs", "06-fauna.md"), "fauna-implementado", faunaImplementadoTable());
inject(join(ROOT, "docs", "06-fauna.md"), "fauna-densidad", faunaDensidadTable());
inject(join(ROOT, "docs", "06-fauna.md"), "fauna-objetivo", faunaObjetivoTable());

console.log(`Especies: ${floraCodes.length} flora + ${faunaCodes.length} fauna (fichas y tablas de 05/06)`);
