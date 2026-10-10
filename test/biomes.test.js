import test from "node:test";
import assert from "node:assert/strict";
import {
  BIOME_IDS, BIOMES, BLOOM_FAUNA, biomeWeights, modeWeights, biomeAt,
  bloomAt, resolveBloom, biomeFloraPool, biomeFaunaPool, bloomChanceMul, biomeGeometry,
} from "../src/biomes.js";
import { applyBiome, getPalette } from "../src/palette.js";
import { pickWeighted } from "../src/fauna.js";
import { FLORA } from "../src/flora.js";
import { mulberry32, seedToInt } from "../src/rng.js";
import { LAYERS, seedLayers, bankHeight, setBiomeGeometry } from "../src/terrain.js";
import { golden, digest } from "./helpers/golden.js";

const SEED = seedToInt("andes");
const SKY_KEYS = new Set(["skyTop", "skyMid", "skyHorizon", "sun", "sunGlow", "cloud", "cloudHi", "star", "fog"]);
const GROUND_KEYS = new Set(["farL", "farD", "midL", "midD", "nearL", "nearD", "valleyL", "valleyD", "costaL", "costaD", "sand", "sandD", "rock", "rockD", "floraL", "floraD", "snow", "snowD", "ground", "groundHi"]);

function layerByName(name) {
  return LAYERS.find((l) => l.name === name);
}

test("biomeWeights es determinista y sus pesos suman 1", () => {
  for (let x = -5000; x <= 5000; x += 250) {
    const a = biomeWeights(x, SEED);
    const b = biomeWeights(x, SEED);
    assert.deepEqual(a, b);
    const total = BIOME_IDS.reduce((acc, id) => acc + a[id], 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `suma ${total} en x=${x}`);
    for (const id of BIOME_IDS) assert.ok(a[id] >= 0 && a[id] <= 1);
  }
});

test("cada bioma domina en algún tramo del recorrido", () => {
  const max = Object.fromEntries(BIOME_IDS.map((id) => [id, 0]));
  for (let x = 0; x < 300000; x += 250) {
    const w = biomeWeights(x, SEED);
    for (const id of BIOME_IDS) max[id] = Math.max(max[id], w[id]);
  }
  for (const id of BIOME_IDS) assert.ok(max[id] > 0.9, `${id} nunca domina (max ${max[id]})`);
});

test("modeWeights fija una región o cae al procedural", () => {
  for (const id of BIOME_IDS) {
    const w = modeWeights(id, 1234, SEED);
    for (const other of BIOME_IDS) assert.equal(w[other], other === id ? 1 : 0, `${id}:${other}`);
  }
  assert.deepEqual(modeWeights("auto", 1234, SEED), biomeWeights(1234, SEED));
});

test("centro fijo no tiñe ni florece (regresión pixel-idéntica)", () => {
  const b = biomeAt(1234, SEED, "centro");
  assert.equal(b.weights.centro, 1);
  assert.equal(b.amount, 0);
  assert.deepEqual(b.tint, {});
  assert.equal(b.bloom, 0);
});

test("el tinte de bioma solo toca claves de terreno (nunca cielo)", () => {
  for (const id of ["altiplano", "norte", "sur", "patagonia"]) {
    const b = biomeAt(0, SEED, id);
    for (const k of Object.keys(b.tint)) {
      assert.ok(GROUND_KEYS.has(k), `${id}: tinte de clave no terrestre ${k}`);
      assert.ok(!SKY_KEYS.has(k), `${id}: tinte de cielo ${k}`);
    }
  }
});

test("bloomAt solo florece donde hay norte y queda acotado", () => {
  const centro = { norte: 0, centro: 1, sur: 0 };
  for (let x = 0; x < 20000; x += 100) assert.equal(bloomAt(x, SEED, centro), 0);

  const norte = { norte: 1, centro: 0, sur: 0 };
  let positivos = 0;
  for (let x = 0; x < 200000; x += 100) {
    const v = bloomAt(x, SEED, norte);
    assert.ok(v >= 0 && v <= 1, `bloom fuera de rango: ${v}`);
    if (v > 0) positivos++;
  }
  assert.ok(positivos > 0, "nunca florece el norte");
});

test("el parche de floración es extenso (~22x) gracias a la puerta por bloque", () => {
  let maxRun = 0;
  let run = 0;
  for (let x = 0; x < 300000; x += 200) {
    if (biomeAt(x, SEED, "norte").bloom > 0) {
      run += 200;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 0;
    }
  }
  assert.ok(maxRun >= 30000, `parche demasiado corto: ${maxRun}px`);
});

test("resolveBloom respeta los modos auto/on/off", () => {
  const norte = biomeAt(0, SEED, "norte");
  assert.equal(resolveBloom("off", norte), 0);
  assert.equal(resolveBloom("on", norte), 1);
  const centro = biomeAt(0, SEED, "centro");
  assert.equal(resolveBloom("on", centro), 0); // sin norte no hay floración
});

test("el pool de flora de centro sale de las zonas del registro", () => {
  const w = modeWeights("centro", 0, SEED);
  for (const layer of LAYERS) {
    if (!layer.flora) continue;
    const pool = biomeFloraPool(layer.name, w, 0);
    const expected = Object.keys(FLORA).filter((t) => FLORA[t].zones?.centro?.[layer.name]);
    assert.deepEqual(pool.map((e) => e.type).sort(), expected.sort(), `${layer.name} difiere de las zonas`);
  }
});

test("el norte no tiene araucaria y la floración añade flower", () => {
  const w = modeWeights("norte", 0, SEED);
  const pool = biomeFloraPool("precordillera", w, 0, layerByName("precordillera").flora.types);
  assert.ok(!pool.some((e) => e.type === "araucaria"), "el norte no debe tener araucaria");

  const bloom = biomeFloraPool("valle", w, 0.8, layerByName("valle").flora.types);
  assert.ok(bloom.some((e) => e.type === "flower"), "la floración no añadió flower");
});

test("los pools de bioma incluyen la flora y fauna nuevas", () => {
  const norte = biomeFloraPool("precordillera", modeWeights("norte", 0, SEED), 0, layerByName("precordillera").flora.types);
  assert.ok(norte.some((e) => e.type === "cactus"), "el norte no tiene cactus");

  const centroValle = biomeFloraPool("valle", modeWeights("centro", 0, SEED), 0, layerByName("valle").flora.types);
  assert.ok(centroValle.some((e) => e.type === "quillay"), "el centro no tiene quillay");

  const sur = modeWeights("sur", 0, SEED);
  const surCosta = biomeFloraPool("costa", sur, 0, layerByName("costa").flora.types);
  for (const t of ["alerce", "nalca", "colihue", "chaura", "quillay", "manio", "canelo", "arrayan", "notro"]) {
    assert.ok(surCosta.some((e) => e.type === t), `el sur no tiene ${t}`);
  }
  const surValle = biomeFaunaPool("valle", sur, 0, layerByName("valle").fauna.species);
  assert.ok(surValle.some((e) => e.type === "rana"), "el sur no tiene rana");
});

test("altiplano y Patagonia aportan sus pools", () => {
  const alt = biomeFloraPool("valle", modeWeights("altiplano", 0, SEED), 0, layerByName("valle").flora.types);
  assert.ok(alt.some((e) => e.type === "grass"), "el altiplano no tiene pastizal");
  assert.ok(!alt.some((e) => e.type === "araucaria"), "el altiplano no debe tener araucaria");
  assert.ok(!alt.some((e) => e.type === "manio"), "el altiplano no debe tener mañío");

  const patFlora = biomeFloraPool("valle", modeWeights("patagonia", 0, SEED), 0, layerByName("valle").flora.types);
  for (const t of ["manio", "notro", "arrayan"]) assert.ok(patFlora.some((e) => e.type === t), `Patagonia sin ${t}`);
  const patFauna = biomeFaunaPool("valle", modeWeights("patagonia", 0, SEED), 0, layerByName("valle").fauna.species);
  for (const t of ["guanaco", "choique", "huemul"]) assert.ok(patFauna.some((e) => e.type === t), `Patagonia sin ${t}`);
});

test("austral aporta flora y fauna de fiordo", () => {
  const w = modeWeights("austral", 0, SEED);
  const flora = biomeFloraPool("costa", w, 0, layerByName("costa").flora.types);
  for (const t of ["manio", "canelo", "coihue"]) assert.ok(flora.some((e) => e.type === t), `austral sin ${t}`);
  const faunaCosta = biomeFaunaPool("costa", w, 0);
  for (const t of ["huillin", "chucao", "rana"]) assert.ok(faunaCosta.some((e) => e.type === t), `austral costa sin ${t}`);
  const faunaMar = biomeFaunaPool("mar", w, 0);
  for (const t of ["chungungo", "pinguino"]) assert.ok(faunaMar.some((e) => e.type === t), `austral mar sin ${t}`);
});

test("biomeGeometry mezcla amplitud, nieve y fiordos; centro no cambia", () => {
  assert.deepEqual(biomeGeometry(modeWeights("centro", 0, SEED)), { ampMul: 1, snowShift: 0, fjord: 0 });
  const norte = biomeGeometry(modeWeights("norte", 0, SEED));
  assert.ok(norte.ampMul < 1 && norte.snowShift > 0);
  const sur = biomeGeometry(modeWeights("sur", 0, SEED));
  assert.ok(sur.ampMul > 1 && sur.snowShift < 0);
  const altiplano = biomeGeometry(modeWeights("altiplano", 0, SEED));
  assert.ok(altiplano.ampMul > 1 && altiplano.snowShift < 0);
  const patagonia = biomeGeometry(modeWeights("patagonia", 0, SEED));
  assert.ok(patagonia.snowShift < -0.3, "Patagonia debe bajar más la nieve");
  const austral = biomeGeometry(modeWeights("austral", 0, SEED));
  assert.equal(austral.fjord, 1, "austral debe activar los fiordos");
  for (const id of BIOME_IDS) {
    if (id === "austral") continue;
    assert.equal(biomeGeometry(modeWeights(id, 0, SEED)).fjord, 0, `${id} no debe tener fiordos`);
  }
});

test("la geometría por bioma cambia la altura y es determinista", () => {
  seedLayers(SEED);
  const layer = layerByName("andes");
  const base = bankHeight(layer, 1234);
  setBiomeGeometry(() => biomeGeometry(modeWeights("sur", 0, SEED)));
  const a = bankHeight(layer, 1234);
  assert.equal(a, bankHeight(layer, 1234));
  assert.notEqual(a, base);
  setBiomeGeometry(null); // restaurar el estado global
  assert.equal(bankHeight(layer, 1234), base);
});

test("la floración añade aves y zorros al pool de fauna", () => {
  const w = modeWeights("norte", 0, SEED);
  const base = biomeFaunaPool("valle", w, 0, layerByName("valle").fauna.species);
  const bloom = biomeFaunaPool("valle", w, 1, layerByName("valle").fauna.species);
  for (const type of BLOOM_FAUNA) {
    assert.ok(bloom.some((e) => e.type === type), `falta ${type} en la floración`);
  }
  assert.ok(bloom.length > base.length);
  assert.ok(bloomChanceMul(1) > bloomChanceMul(0));
});

test("applyBiome no muta la base e ignora claves de cielo", () => {
  const base = getPalette(12, "clear");
  const before = { ...base };
  const b = biomeAt(0, SEED, "norte");
  const out = applyBiome(base, b.tint, b.amount, b.bloom);
  assert.deepEqual(base, before, "applyBiome mutó la paleta base");
  for (const k of SKY_KEYS) assert.equal(out[k], before[k], `el cielo cambió en ${k}`);
  assert.notEqual(out.sand, before.sand);
});

test("pickWeighted acepta pesos de bioma y favorece el mayor", () => {
  const pool = [{ type: "chilla", w: 10 }, { type: "chinchilla", w: 0.001 }];
  const a = pickWeighted(pool, mulberry32(12345));
  const b = pickWeighted(pool, mulberry32(12345));
  assert.equal(a, b);
  const rng = mulberry32(999);
  let chilla = 0;
  for (let i = 0; i < 2000; i++) if (pickWeighted(pool, rng) === "chilla") chilla++;
  assert.ok(chilla > 1900, `chilla debería dominar (fue ${chilla}/2000)`);
});

test("dorado de los pools de bioma", (t) => {
  for (const id of BIOME_IDS) {
    const vals = [];
    for (const layer of LAYERS) {
      const w = modeWeights(id, 0, SEED);
      if (layer.flora) for (const e of biomeFloraPool(layer.name, w, 0, layer.flora.types)) vals.push(`${layer.name}:f:${e.type}:${e.w}`);
      if (layer.fauna) for (const e of biomeFaunaPool(layer.name, w, 0, layer.fauna.species)) vals.push(`${layer.name}:a:${e.type}:${e.w}`);
    }
    golden(t, `biome.${id}`, digest(vals));
  }
});

test("modeWeights y biomeAt memoizan por píxel de mundo", () => {
  const a = modeWeights("auto", 1000.2, SEED);
  assert.equal(modeWeights("auto", 1000.4, SEED), a); // mismo píxel redondeado
  assert.notEqual(modeWeights("auto", 1000.9, SEED), a); // otro píxel
  const ba = biomeAt(1000.2, SEED, "auto");
  assert.equal(biomeAt(1000.4, SEED, "auto"), ba);
  assert.ok(ba.bloom >= 0 && ba.bloom <= 1);
  // Los modos fijos no dependen del píxel y siguen siendo válidos.
  const centro = biomeAt(1234, SEED, "centro");
  assert.equal(centro.weights.centro, 1);
});
