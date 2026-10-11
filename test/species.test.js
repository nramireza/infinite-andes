// Validación del registro de especies: coherencia entre FLORA/SPECIES, sus
// zonas, los pools derivados y el dibujo. Fuente única = un solo sitio.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { FLORA, DRAWERS } from "../src/flora.js";
import { SPECIES, RIVER_SPECIES, BLOOM_SPECIES, RARITY_WEIGHT } from "../src/fauna.js";
import { BIOME_IDS, biomeFloraPool, biomeFaunaPool, modeWeights } from "../src/biomes.js";
import { LAYERS } from "../src/terrain.js";
import { seedToInt } from "../src/rng.js";
import { parseManifest, refsFor, validateRefs } from "../src/references.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MANIFEST = parseManifest(readFileSync(join(ROOT, "docs", "referencias", "manifiesto.csv"), "utf8"));

const SEED = seedToInt("andes");
const LAYER_NAMES = new Set(LAYERS.map((l) => l.name));
const KINDS = new Set(["especie", "generico", "efecto"]);

function checkZones(name, zones) {
  assert.ok(zones, `${name}: sin zones`);
  for (const biome in zones) {
    assert.ok(BIOME_IDS.includes(biome), `${name}: bioma inválido ${biome}`);
    for (const layer in zones[biome]) {
      assert.ok(LAYER_NAMES.has(layer), `${name}: capa inválida ${layer}`);
      assert.ok(zones[biome][layer] > 0, `${name}: peso no positivo en ${biome}/${layer}`);
    }
  }
}

function zoneCount(zones) {
  let n = 0;
  for (const b in zones || {}) for (const l in zones[b]) n++;
  return n;
}

test("FLORA y DRAWERS cubren exactamente los mismos tipos", () => {
  assert.deepEqual(Object.keys(DRAWERS).sort(), Object.keys(FLORA).sort());
});

test("cada entrada de FLORA es coherente", () => {
  for (const type in FLORA) {
    const d = FLORA[type];
    assert.ok(KINDS.has(d.kind), `${type}: kind inválido ${d.kind}`);
    if (d.kind === "especie") {
      assert.ok(d.common && d.sci, `${type}: especie sin common/sci`);
      assert.ok(d.heightM, `${type}: especie sin heightM (altura real)`);
    }
    assert.ok(typeof d.height === "number" && d.height > 0.3 && d.height < 2.5,
      `${type}: height fuera de rango (${d.height})`);
    if (d.zones) checkZones(type, d.zones);
    if (!d.bloomOnly && d.kind !== "efecto") {
      assert.ok(zoneCount(d.zones) > 0, `${type}: sin zonas`);
    }
  }
});

test("cada entrada de SPECIES es coherente", () => {
  for (const type in SPECIES) {
    const d = SPECIES[type];
    assert.ok(d.common && d.sci, `${type}: sin common/sci`);
    assert.ok(RARITY_WEIGHT[d.rarity] > 0, `${type}: rareza inválida ${d.rarity}`);
    checkZones(type, d.zones);
    assert.ok(zoneCount(d.zones) > 0, `${type}: sin zonas`);
    if (d.placement?.river) {
      const r = d.placement.river;
      assert.ok(r.chance > 0 && r.offset > 0 && Number.isFinite(r.seed), `${type}: river inválido`);
    }
    for (const frame of d.frames) {
      const w = Math.max(...frame.map((row) => row.length));
      for (const row of frame) assert.equal(row.length, w, `${type}: filas de ancho distinto`);
    }
  }
});

test("RIVER_SPECIES y BLOOM_SPECIES se derivan del registro", () => {
  assert.deepEqual(
    RIVER_SPECIES.map((r) => r.type).sort(),
    Object.keys(SPECIES).filter((t) => SPECIES[t].placement?.river).sort()
  );
  assert.deepEqual(BLOOM_SPECIES.sort(), ["chilla", "condor", "culpeo", "flamenco"]);
  assert.equal(SPECIES.rana.placement.chunk, false, "la rana no debe sembrarse por chunk");
});

test("los pools solo devuelven tipos del registro", () => {
  for (const id of BIOME_IDS) {
    const w = modeWeights(id, 0, SEED);
    for (const layer of LAYERS) {
      if (layer.flora) {
        const pool = biomeFloraPool(layer.name, w, 0);
        assert.ok(pool.length > 0, `${id}/${layer.name}: pool de flora vacío`);
        for (const e of pool) assert.ok(FLORA[e.type], `${id}/${layer.name}: tipo flora desconocido ${e.type}`);
      }
      if (layer.fauna) {
        const pool = biomeFaunaPool(layer.name, w, 0);
        assert.ok(pool.length > 0, `${id}/${layer.name}: pool de fauna vacío`);
        for (const e of pool) assert.ok(SPECIES[e.type], `${id}/${layer.name}: tipo fauna desconocido ${e.type}`);
      }
    }
  }
});

test("la floración añade la flor y las especies marcadas", () => {
  const w = modeWeights("norte", 0, SEED);
  const flora = biomeFloraPool("valle", w, 1);
  assert.ok(flora.some((e) => e.type === "flower"), "sin flor en la floración");
  const fauna = biomeFaunaPool("valle", w, 1);
  for (const type of BLOOM_SPECIES) assert.ok(fauna.some((e) => e.type === type), `sin ${type} en la floración`);
});

test("el manifiesto de referencias es válido", () => {
  assert.deepEqual(validateRefs(MANIFEST), []);
});

test("el parser tolera comas y comillas en CSV", () => {
  const csv = 'id,especie,sci,fuente,autor,licencia,encuadre,archivo\n' +
    'x-01,condor,Vultur gryphus,"https://a,b",Autor,"CC0",perfil,x-01.jpg\n';
  const rows = parseManifest(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].fuente, "https://a,b");
  assert.equal(rows[0].licencia, "CC0");
});

test("cada ref declarado existe en el manifiesto", () => {
  const defs = [
    ...Object.entries(FLORA).map(([k, d]) => [`flora:${k}`, d]),
    ...Object.entries(SPECIES).map(([k, d]) => [`fauna:${k}`, d]),
  ];
  for (const [name, d] of defs) {
    if (d.ref == null) continue;
    const ids = Array.isArray(d.ref) ? d.ref : [d.ref];
    assert.ok(ids.length > 0, `${name}: ref vacío`);
    for (const id of ids) {
      assert.equal(refsFor(MANIFEST, id).length, 1, `${name}: ref sin fila única en el manifiesto (${id})`);
    }
  }
});

