// Genera las fichas de especies en `docs/especies/` a partir de los datos del
// código (`SPECIES` de fauna) y una tabla de metadatos (nombres científicos,
// endemismo, UICN, notas). Uso: `npm run specimens`.

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { SPECIES } from "../src/fauna.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "docs", "especies");
const TODAY = new Date().toISOString().slice(0, 10);

const ACTIVE = { day: "día", night: "noche", dusk: "crepúsculo" };
const MOVEMENT = {
  fly: "vuelo (planeo en el cielo de la capa)",
  flock: "bandada (vuelo en formación)",
  walk: "camina (sigue el banco, evita el cauce)",
  hop: "salta (sigue el banco, evita el cauce)",
  swim: "nada (vaivén sobre el agua)",
  sit: "estático (borde del cauce)",
};

// Flora: tipo en código -> metadatos. (flora.js no expone registro de especies)
const FLORA = {
  araucaria: { com: "Araucaria / Pehuén", sci: "Araucaria araucana", end: "Sí (Chile/Argentina)", zona: "Precordillera, valle, costa", notas: "Árbol emblema; silueta de paraguas; la copa se bambolea." },
  lenga: { com: "Lenga / Ñire", sci: "Nothofagus pumilio / N. antarctica", end: "No (Patagonia)", zona: "Costa, valle", notas: "Caducifolio: pierde hojas en otoño, queda desnudo en invierno y brota en primavera." },
  copihue: { com: "Copihue", sci: "Lapageria rosea", end: "Sí (Chile)", zona: "Costa, valle (sur)", notas: "Enredadera y flor nacional; campanas rojas en primavera/verano." },
  cactus: { com: "Copao / Cactus columnar", sci: "Eulychnia spp.", end: "No", zona: "Norte (precordillera, valle, costa)", notas: "Columna con brazos y espinas." },
  alerce: { com: "Alerce / Lahual", sci: "Fitzroya cupressoides", end: "Sí (Chile/Argentina)", zona: "Sur (precordillera, costa)", notas: "Conífera alta y estrecha; en peligro." },
  nalca: { com: "Nalca / Pangue", sci: "Gunnera tinctoria", end: "Sí (Chile/Argentina)", zona: "Sur (valle, costa)", notas: "Hojas gigantes junto al agua." },
  colihue: { com: "Colihue / Quila", sci: "Chusquea spp.", end: "No", zona: "Sur (valle, costa)", notas: "Cañaverales (bambú nativo)." },
  palma: { com: "Palma chilena", sci: "Jubaea chilensis", end: "Sí (Chile)", zona: "Centro (valle, costa)", notas: "Tronco esbelto y frondas; en peligro." },
  coihue: { com: "Coihue", sci: "Nothofagus dombeyi", end: "No (Patagonia)", zona: "Costa, valle (sur)", notas: "Copa ancha y redondeada; tronco recto." },
  roble: { com: "Roble", sci: "Nothofagus obliqua", end: "Sí (Chile/Argentina)", zona: "Costa, valle (sur)", notas: "Caducifolio; copa estrecha y erguida; pierde hojas en otoño." },
  michay: { com: "Michay", sci: "Berberis darwinii", end: "No (Patagonia)", zona: "Precordillera, valle, costa (sur)", notas: "Arbusto espinoso; flores naranjas en primavera/verano." },
  chaura: { com: "Chaura", sci: "Gaultheria mucronata", end: "No (Patagonia)", zona: "Costa (sur)", notas: "Arbusto achaparrado con bayas blanco-rosadas; perenne." },
  quillay: { com: "Quillay", sci: "Quillaja saponaria", end: "Sí (Chile)", zona: "Centro, sur (precordillera, valle, costa)", notas: "Esclerófilo; flores blancas en primavera/verano." },
  manio: { com: "Mañío", sci: "Podocarpus spp.", end: "No (Patagonia)", zona: "Sur, Patagonia, Austral (valle, costa)", notas: "Conífera austral oscura y estrecha; perenne." },
  canelo: { com: "Canelo", sci: "Drimys winteri", end: "No (Chile/Argentina)", zona: "Sur, Austral", notas: "Siempreverde de copa densa; flor blanca; árbol sagrado mapuche." },
  arrayan: { com: "Arrayán", sci: "Luma apiculata", end: "No (Chile/Argentina)", zona: "Sur, Austral", notas: "Tronco canela rojizo y copa menuda; flor blanca." },
  notro: { com: "Notro / Ciruelillo", sci: "Embothrium coccineum", end: "No (Chile/Argentina)", zona: "Sur, Patagonia, Austral", notas: "Ramilletes de flores rojas." },
};

// Fauna: metadatos por tipo en código.
const FAUNA = {
  condor: { com: "Cóndor", sci: "Vultur gryphus", end: "No (Andes)", iucn: "NT", notas: "Ave símbolo de los Andes; planea lento con aleteo ocasional." },
  huemul: { com: "Huemul", sci: "Hippocamelus bisulcus", end: "Sí (Chile/Argentina)", iucn: "EN", notas: "Ciervo andino en peligro; pastorea y deja huellas." },
  pudu: { com: "Pudú", sci: "Pudu puda", end: "Sí (Chile/Argentina)", iucn: "NT", notas: "Uno de los ciervos más pequeños; camina entre arbustos." },
  guina: { com: "Güiña / Kodkod", sci: "Leopardus guigna", end: "Sí (Chile/Argentina)", iucn: "LC", notas: "Felino esquivo; se desplaza a saltos de noche." },
  puma: { com: "Puma", sci: "Puma concolor", end: "No", iucn: "LC (NT nacional)", notas: "Depredador tope; raro y solitario; deja huellas." },
  culpeo: { com: "Zorro culpeo", sci: "Lycalopex culpaeus", end: "No (Sudamérica)", iucn: "LC", notas: "Zorro andino de cola rojiza; trota de día." },
  chilla: { com: "Zorro chilla", sci: "Lycalopex griseus", end: "No", iucn: "LC", notas: "Zorro gris, más pequeño; activo al crepúsculo." },
  guanaco: { com: "Guanaco", sci: "Lama guanicoe", end: "No", iucn: "LC", notas: "Camélido silvestre; tropillas en la estepa." },
  vicuna: { com: "Vicuña", sci: "Vicugna vicugna", end: "No", iucn: "LC", notas: "Camélido del altiplano; grupos muy ágiles." },
  chingue: { com: "Chingue", sci: "Conepatus chinga", end: "No", iucn: "LC", notas: "Mofeta de hocico al suelo; lento, de noche." },
  monito: { com: "Monito del monte", sci: "Dromiciops gliroides", end: "Sí (Chile/Argentina)", iucn: "NT", notas: "Marsupial, fósil viviente; diminuto, en el colihue." },
  chinchilla: { com: "Chinchilla de cola larga", sci: "Chinchilla lanigera", end: "Sí (Chile)", iucn: "EN", notas: "Roedor ágil de roqueríos andinos; casi extinto." },
  choroy: { com: "Choroy", sci: "Enicognathus leptorhynchus", end: "Sí (Chile)", iucn: "LC", notas: "Loro endémico; bandada ruidosa del bosque de la Costa." },
  cachana: { com: "Cachaña", sci: "Enicognathus ferrugineus", end: "No (Patagonia)", iucn: "LC", notas: "Loro austral; vuela en bandadas." },
  flamenco: { com: "Flamenco chileno", sci: "Phoenicopterus chilensis", end: "No", iucn: "NT", notas: "Filtra en lagunas y marismas costeras." },
  chungungo: { com: "Chungungo", sci: "Lontra felina", end: "Sí (Chile/Perú)", iucn: "EN", notas: "Nutria marina; nada y se asoma entre roqueríos." },
  pinguino: { com: "Pingüino de Humboldt", sci: "Spheniscus humboldti", end: "No", iucn: "VU", notas: "Pingüino del Pacífico sur; nada y emerge." },
  rana: { com: "Rana de Darwin", sci: "Rhinoderma darwinii", end: "Sí (Chile/Argentina)", iucn: "EN", notas: "Anfibio endémico estático en el borde del cauce." },
  choique: { com: "Choique / Ñandú petizo", sci: "Rhea pennata", end: "No", iucn: "NT", notas: "Ñandú de la estepa; camina y deja huellas." },
  chucao: { com: "Chucao", sci: "Scelorchilus rubecula", end: "No (Chile/Argentina)", iucn: "LC", notas: "Ave de sotobosque; pecho rojizo." },
  huillin: { com: "Huillín", sci: "Lontra provocax", end: "No (Chile/Argentina)", iucn: "EN", notas: "Nutria de río del sur; nada en el borde del cauce." },
};

function row(k, v) {
  return `| ${k} | ${v} |`;
}

function faunaFicha(code) {
  const sp = SPECIES[code];
  const m = FAUNA[code];
  const frames = Array.isArray(sp.frames) ? sp.frames.length : 0;
  const base = sp.frames?.[0] || [];
  const w = base.length ? Math.max(...base.map((r) => r.length)) : 0;
  return [
    `# ${m.com} (\`${code}\`)`,
    "",
    `> Ficha generada con \`npm run specimens\` · Actualizado: ${TODAY}`,
    "",
    "| Campo | Valor |",
    "|-------|-------|",
    row("Nombre común", m.com),
    row("Nombre científico", `*${m.sci}*`),
    row("Endémica de Chile", m.end),
    row("Estado UICN", m.iucn),
    row("Tipo en código", `\`${code}\` (fauna)`),
    row("Movimiento", MOVEMENT[sp.movement] || sp.movement),
    row("Actividad", ACTIVE[sp.active] || sp.active),
    row("Rareza (juego)", sp.rarity),
    row("Anclaje", sp.anchor === "ground" ? "pies" : "centro"),
    row("Sprite", `${w}×${base.length} px · ${frames} frames`),
    "",
    "## Notas",
    "",
    m.notas,
    "",
    "## Referencias",
    "",
    "- [06 · Fauna](../../06-fauna.md)",
    "- [`src/fauna.js`](../../../src/fauna.js)",
    "",
  ].join("\n");
}

function floraFicha(code) {
  const m = FLORA[code];
  return [
    `# ${m.com} (\`${code}\`)`,
    "",
    `> Ficha generada con \`npm run specimens\` · Actualizado: ${TODAY}`,
    "",
    "| Campo | Valor |",
    "|-------|-------|",
    row("Nombre común", m.com),
    row("Nombre científico", `*${m.sci}*`),
    row("Endémica de Chile", m.end),
    row("Tipo en código", `\`${code}\` (flora)`),
    row("Zona / capa", m.zona),
    "",
    "## Notas",
    "",
    m.notas,
    "",
    "## Referencias",
    "",
    "- [05 · Flora](../../05-flora.md)",
    "- [`src/flora.js`](../../../src/flora.js)",
    "",
  ].join("\n");
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const floraCodes = Object.keys(FLORA);
const faunaCodes = Object.keys(SPECIES).filter((c) => FAUNA[c]);
for (const code of floraCodes) writeFileSync(join(OUT, `flora-${code}.md`), floraFicha(code));
for (const code of faunaCodes) writeFileSync(join(OUT, `fauna-${code}.md`), faunaFicha(code));

const index = [
  "# Especies",
  "",
  `> Fichas generadas con \`npm run specimens\` · Actualizado: ${TODAY}`,
  "",
  "Una ficha por especie vegetal y animal (nombre científico, endemismo, zona y notas),",
  "basada en la plantilla [`../templates/especimen.md`](../templates/especimen.md).",
  "",
  "## Flora",
  "",
  ...floraCodes.map((c) => `- [${FLORA[c].com}](flora-${c}.md)`),
  "",
  "## Fauna",
  "",
  ...faunaCodes.map((c) => `- [${FAUNA[c].com}](fauna-${c}.md)`),
  "",
].join("\n");
writeFileSync(join(OUT, "README.md"), index);

console.log(`Fichas: ${floraCodes.length} flora + ${faunaCodes.length} fauna en docs/especies/`);
