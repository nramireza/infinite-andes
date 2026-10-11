// Busca referencias fotográficas PD/CC0 en Wikimedia Commons para cada especie
// (flora y fauna) y propone filas para el manifiesto. Herramienta de curaduría:
// no escribe nada por sí sola. Uso: `npm run refs:find`.
//
// Filtra por licencia (solo dominio público o CC0) y prioriza títulos que
// contienen el epíteto específico. La decisión final es humana.

import { FLORA } from "../src/flora.js";
import { SPECIES } from "../src/fauna.js";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "InfiniteAndes/1.0 (https://github.com/nramireza/infinite-andes; refs curation)";

function firstSci(sci) {
  return String(sci || "").split("/")[0].replace(/\bspp\.?\b/gi, "").trim();
}

async function api(params) {
  const url = new URL(API);
  for (const k in params) url.searchParams.set(k, params[k]);
  url.searchParams.set("format", "json");
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function licenseInfo(meta) {
  const short = meta?.LicenseShortName?.value || "";
  const terms = meta?.UsageTerms?.value || "";
  const url = meta?.LicenseUrl?.value || "";
  const s = `${short} ${terms} ${url}`;
  if (/cc0|zero|publicdomain\/zero/i.test(s)) return "CC0";
  if (/public domain|\bpd\b|pd-|pd_/i.test(s)) return "PD";
  return null;
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function imageInfo(titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40);
    const data = await api({
      action: "query",
      titles: chunk.join("|"),
      prop: "imageinfo",
      iiprop: "extmetadata|url|size",
      iiextmetadatafilter: "LicenseShortName|UsageTerms|LicenseUrl|Artist",
    });
    for (const page of Object.values(data.query?.pages || {})) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      out[page.title] = {
        title: page.title,
        license: licenseInfo(info.extmetadata),
        artist: stripHtml(info.extmetadata?.Artist?.value),
        url: info.descriptionurl,
        width: info.width,
        height: info.height,
      };
    }
  }
  return out;
}

async function search(query, limit = 20) {
  const data = await api({
    action: "query",
    list: "search",
    srsearch: query,
    srnamespace: 6,
    srlimit: limit,
  });
  return (data.query?.search || []).map((r) => r.title);
}

const species = [
  ...Object.entries(FLORA).filter(([, d]) => d.kind === "especie").map(([code, d]) => ({ code, kind: "flora", sci: d.sci, common: d.common })),
  ...Object.entries(SPECIES).map(([code, d]) => ({ code, kind: "fauna", sci: d.sci, common: d.common })),
];

// Modo consulta libre: `node scripts/find-refs.mjs q="Drimys winteri"` lista
// todos los resultados PD/CC0 (sin filtro de especie).
const rawArg = process.argv.find((a) => a.startsWith("q="));
if (rawArg) {
  const query = rawArg.slice(2);
  const titles = await search(query, 30);
  const info = await imageInfo(titles);
  const rows = Object.values(info).filter((r) => r.license).sort((a, b) => b.width * b.height - a.width * a.height);
  console.log(`### q="${query}" (${rows.length} PD/CC0)`);
  for (const r of rows.slice(0, 8)) {
    console.log(`  [${r.license}] ${r.title} — ${r.artist || "s/a"} — ${r.width}x${r.height}`);
    console.log(`        ${r.url}`);
  }
  process.exit(0);
}

// Modo categoría: `node scripts/find-refs.mjs cat="Lycalopex culpaeus"` lista los
// archivos PD/CC0 de una categoría de Commons.
const catArg = process.argv.find((a) => a.startsWith("cat="));
if (catArg) {
  const cat = catArg.slice(4);
  const data = await api({
    action: "query",
    generator: "categorymembers",
    gcmtitle: `Category:${cat}`,
    gcmtype: "file",
    gcmlimit: 100,
    prop: "imageinfo",
    iiprop: "extmetadata|url|size",
    iiextmetadatafilter: "LicenseShortName|UsageTerms|LicenseUrl|Artist",
  });
  const rows = Object.values(data.query?.pages || {})
    .map((p) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      return {
        title: p.title,
        license: licenseInfo(info.extmetadata),
        artist: stripHtml(info.extmetadata?.Artist?.value),
        url: info.descriptionurl,
        width: info.width,
        height: info.height,
      };
    })
    .filter((r) => r && r.license)
    .sort((a, b) => b.width * b.height - a.width * a.height);
  console.log(`### Category:${cat} (${rows.length} PD/CC0)`);
  for (const r of rows.slice(0, 10)) {
    console.log(`  [${r.license}] ${r.title} — ${r.artist || "s/a"} — ${r.width}x${r.height}`);
    console.log(`        ${r.url}`);
  }
  process.exit(0);
}

const only = process.argv[2];
for (const sp of species) {
  if (only && sp.code !== only) continue;
  const sci = firstSci(sp.sci);
  const genus = sci.split(" ")[0];
  const epithet = sci.split(" ")[1] || "";
  const titles = await search(`"${sci}"`, 25);
  const info = await imageInfo(titles);
  const rows = Object.values(info)
    .filter((r) => r.license)
    .filter((r) => {
      const t = r.title.toLowerCase();
      return (epithet && t.includes(epithet.toLowerCase())) || t.includes(genus.toLowerCase());
    })
    .sort((a, b) => b.width * b.height - a.width * a.height);
  console.log(`\n### ${sp.code} (${sp.kind}) · ${sp.sci}`);
  if (rows.length === 0) {
    console.log("  (sin PD/CC0)");
    continue;
  }
  for (const r of rows.slice(0, 3)) {
    console.log(`  [${r.license}] ${r.title} — ${r.artist || "s/a"} — ${r.width}x${r.height}`);
    console.log(`        ${r.url}`);
  }
}
