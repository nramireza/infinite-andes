// Fauna endémica en pixel art: matrices de píxeles + fantasma por capa.
// Determinista por chunk; la hora solo filtra actividad. La `rarity` (rareza en
// Chile, según UICN/clasificación nacional) pondera el sorteo de especies.

import { mulberry32, hashInt, hash1 } from "./rng.js";
import { bankHeight, riverInfluence, riverEvents } from "./terrain.js";
import { px } from "./pixel.js";

const BAND = {
  day: (h) => h >= 7 && h <= 19,
  night: (h) => h >= 20 || h <= 6,
  dusk: (h) => (h >= 17 && h <= 21) || (h >= 5 && h <= 8),
};

// Peso relativo de cada clase de rareza (más alto = más probable).
export const RARITY_WEIGHT = {
  abundante: 6,
  comun: 3,
  "poco-comun": 1.2,
  rara: 0.5,
  "muy-rara": 0.12,
};

// `active`: franja horaria · `movement`: fly/walk/hop/swim/flock · `speed` y `range`: vaivén.
// `rarity`: clase de rareza (ver RARITY_WEIGHT) · `palette`: carácter -> clave de getPalette.
export const SPECIES = {
  condor: {
    movement: "fly", active: "day", speed: 0.35, range: 26, fps: 3, anchor: "center", rarity: "comun",
    palette: { b: "trunk", w: "snow" },
    frames: [
      [
        "..bb........bb..",
        "..bbb......bbb..",
        "...bbbbbbbbbb...",
        "...wbbbbbbbbw...",
        ".....bbbbbb.....",
        "......bbbb......",
      ],
      [
        "......bbbb......",
        ".....bbbbbb.....",
        "...wbbbbbbbbw...",
        "...bbbbbbbbbb...",
        "..bbb......bbb..",
        "..bb........bb..",
      ],
    ],
  },
  huemul: {
    movement: "walk", active: "day", speed: 0.9, range: 9, fps: 2, anchor: "ground", rarity: "muy-rara",
    palette: { d: "trunk", l: "sandD" },
    frames: [
      [
        "..d.d..",
        "..ddd..",
        "..ddd..",
        ".ddddd.",
        ".ddddd.",
        "..lll..",
        "..d.d..",
        "..d.d..",
      ],
      [
        "..d.d..",
        "..ddd..",
        "..ddd..",
        ".ddddd.",
        ".ddddd.",
        "..lll..",
        ".d...d.",
        ".d...d.",
      ],
    ],
  },
  pudu: {
    movement: "walk", active: "dusk", speed: 0.8, range: 6, fps: 2, anchor: "ground", rarity: "poco-comun",
    palette: { d: "trunk", l: "sandD" },
    frames: [
      [
        ".d.d..",
        ".ddd..",
        ".dddd.",
        "..ll..",
        "..d.d.",
        "..d.d.",
      ],
      [
        ".d.d..",
        ".ddd..",
        ".dddd.",
        "..ll..",
        ".d...d",
        ".d...d",
      ],
    ],
  },
  guina: {
    movement: "hop", active: "night", speed: 1.1, range: 7, fps: 3, anchor: "ground", rarity: "comun",
    palette: { d: "trunk", s: "sandD" },
    frames: [
      [
        "..d..d.",
        ".ddddd.",
        "ddddddd",
        ".d...d.",
      ],
      [
        "..d..d.",
        ".ddddd.",
        "ddsdddd",
        "d.....d",
      ],
    ],
  },
  puma: {
    movement: "walk", active: "dusk", speed: 0.7, range: 10, fps: 2, anchor: "ground", rarity: "poco-comun",
    palette: { d: "sandD", l: "sand", k: "trunk" },
    frames: [
      [
        "..k...k..",
        ".ddddddd.",
        ".dllllld.",
        "..d.d.d..",
      ],
      [
        "..k...k..",
        ".ddddddd.",
        ".dllllld.",
        ".d..d..d.",
      ],
    ],
  },
  culpeo: {
    movement: "walk", active: "day", speed: 1.0, range: 8, fps: 3, anchor: "ground", rarity: "abundante",
    palette: { d: "sandD", l: "sand", t: "sandD" },
    frames: [
      [
        ".dddd.tt",
        ".dllldd.",
        ".d..d...",
        "........",
      ],
      [
        ".dddd.tt",
        ".dllldd.",
        "..d..d..",
        "........",
      ],
    ],
  },
  chilla: {
    movement: "walk", active: "dusk", speed: 1.1, range: 7, fps: 3, anchor: "ground", rarity: "abundante",
    palette: { d: "sandD", l: "sand" },
    frames: [
      [
        ".dd..dd",
        "dllllld",
        "ddddddd",
        ".d...d.",
      ],
      [
        ".dd..dd",
        "dllllld",
        "ddddddd",
        "..d.d..",
      ],
    ],
  },
  guanaco: {
    movement: "walk", active: "day", speed: 0.6, range: 12, fps: 2, anchor: "ground", rarity: "poco-comun",
    palette: { d: "sandD", l: "sand" },
    frames: [
      [
        "..dl...",
        "..dd...",
        "..dd...",
        ".dddd..",
        "dddddd.",
        ".d..d..",
        ".d..d..",
      ],
      [
        "..dl...",
        "..dd...",
        "..dd...",
        ".dddd..",
        "dddddd.",
        ".d..d..",
        "..d.d..",
      ],
    ],
  },
  vicuna: {
    movement: "walk", active: "day", speed: 0.7, range: 10, fps: 2, anchor: "ground", rarity: "poco-comun",
    palette: { d: "sand", l: "sandD" },
    frames: [
      [
        "..dl..",
        "..dd..",
        "..dd..",
        ".ddd..",
        "ddddd.",
        ".d.d..",
        ".d.d..",
      ],
      [
        "..dl..",
        "..dd..",
        "..dd..",
        ".ddd..",
        "ddddd.",
        ".d.d..",
        "..dd..",
      ],
    ],
  },
  chingue: {
    movement: "walk", active: "night", speed: 0.5, range: 6, fps: 2, anchor: "ground", rarity: "abundante",
    palette: { d: "trunk", w: "snow" },
    frames: [
      [
        ".ww.ww..",
        "dddddddd",
        ".d....d.",
      ],
      [
        ".ww.ww..",
        "dddddddd",
        "..d..d..",
      ],
    ],
  },
  monito: {
    movement: "hop", active: "night", speed: 0.8, range: 5, fps: 3, anchor: "ground", rarity: "poco-comun",
    palette: { d: "trunk", l: "sandD" },
    frames: [
      [
        ".d..d.",
        ".dddd.",
        "ddllld",
        ".dddd.",
        ".d..d.",
      ],
      [
        ".d..d.",
        ".dddd.",
        "ddllld",
        ".dddd.",
        "d....d",
      ],
    ],
  },
  chinchilla: {
    movement: "hop", active: "night", speed: 1.2, range: 5, fps: 3, anchor: "ground", rarity: "muy-rara",
    palette: { d: "rock", l: "snowD" },
    frames: [
      [
        ".d..d.",
        ".dddd.",
        "ddlldd",
        ".dddd.",
        "d....d",
      ],
      [
        ".d..d.",
        ".dddd.",
        "ddlldd",
        ".dddd.",
        ".d..d.",
      ],
    ],
  },
  choroy: {
    movement: "flock", active: "day", speed: 0.55, range: 30, fps: 4, anchor: "center", rarity: "comun",
    palette: { g: "floraL", d: "trunk" },
    frames: [
      [
        "...gg...",
        "..gggg..",
        ".gggggg.",
        "..g..g..",
      ],
      [
        "..gg....",
        ".gggg.g.",
        "gggg.gg.",
        "...g....",
      ],
    ],
  },
  cachana: {
    movement: "flock", active: "day", speed: 0.5, range: 30, fps: 4, anchor: "center", rarity: "comun",
    palette: { g: "sandD", d: "trunk" },
    frames: [
      [
        "...gg...",
        "..gggg..",
        ".gggggg.",
        "..g..g..",
      ],
      [
        "..gg....",
        ".gggg.g.",
        "gggg.gg.",
        "...g....",
      ],
    ],
  },
  flamenco: {
    movement: "walk", active: "day", speed: 0.3, range: 4, fps: 1, anchor: "ground", rarity: "poco-comun",
    palette: { p: "#f2a0b8", w: "snow", k: "trunk" },
    frames: [
      [
        "..pp..",
        "..pp..",
        "...p..",
        "..pp..",
        ".pppp.",
        "..pp..",
        "..pp..",
        "..p.p.",
        "..p.p.",
      ],
      [
        "..pp..",
        "..pp..",
        "...p..",
        "..pp..",
        ".pppp.",
        "..pp..",
        "..pp..",
        ".p...p",
        ".p...p",
      ],
    ],
  },
  chungungo: {
    movement: "swim", active: "day", speed: 0.6, range: 7, fps: 2, anchor: "ground", rarity: "muy-rara",
    palette: { d: "trunk", l: "sand" },
    frames: [
      [
        "......dd.",
        ".ddddddd.",
        "ddllllldd",
        "..d....d.",
      ],
      [
        ".....dd..",
        ".ddddddd.",
        "ddllllldd",
        ".d.....d.",
      ],
    ],
  },
  pinguino: {
    movement: "swim", active: "day", speed: 0.5, range: 6, fps: 2, anchor: "ground", rarity: "rara",
    palette: { k: "#1b1b22", w: "snow", o: "#f5a623" },
    frames: [
      [
        ".kkkk.",
        ".kwwk.",
        ".kwwk.",
        "kkwwkk",
        "kwwwwk",
        "kkkkkk",
        ".k..k.",
        ".o..o.",
      ],
      [
        ".kkkk.",
        ".kwwk.",
        ".kwwk.",
        "kkwwkk",
        "kwwwwk",
        "kkkkkk",
        ".k..k.",
        "..oo..",
      ],
    ],
  },
  rana: {
    movement: "sit", active: "day", speed: 0, range: 0, fps: 1, anchor: "ground", rarity: "muy-rara",
    palette: { d: "floraD", l: "sandD", e: "trunk" },
    frames: [
      [
        ".dd...",
        "dddd..",
        "dlddd.",
        ".d.d..",
      ],
      [
        ".dd...",
        "dddd..",
        "dlddd.",
        "..d.d.",
      ],
    ],
  },
};

export function isActive(species, hour) {
  const band = BAND[species.active];
  return band ? band(((hour % 24) + 24) % 24) : true;
}

function spriteColors(species, pal) {
  const out = {};
  for (const ch in species.palette) {
    const key = species.palette[ch];
    out[ch] = key.startsWith("#") ? key : pal[key] || "#000000";
  }
  return out;
}

function drawMatrix(ctx, rows, colors, left, top, flip) {
  const w = Math.max(...rows.map((r) => r.length));
  for (let ry = 0; ry < rows.length; ry++) {
    const row = rows[ry];
    for (let rx = 0; rx < row.length; rx++) {
      const ch = row[rx];
      if (ch === "." || ch === " ") continue;
      const col = colors[ch];
      if (!col) continue;
      const dx = flip ? w - 1 - rx : rx;
      px(ctx, left + dx, top + ry, col);
    }
  }
}

// Peso de sorteo de una especie según su rareza (mayor = más probable).
export function speciesWeight(type) {
  const sp = SPECIES[type];
  if (!sp) return 0;
  return RARITY_WEIGHT[sp.rarity] ?? 1;
}

// Sorteo ponderado por rareza × peso de bioma. Consume un único `rng()`, igual que
// la elección uniforme anterior, así el resto de la secuencia determinista no se altera.
// Cada entrada puede ser un nombre (`"pudu"`) o `{ type, w }` (peso de bioma).
export function pickWeighted(list, rng) {
  let total = 0;
  for (const e of list) total += entryWeight(e);
  if (total <= 0) return entryType(list[0]);
  let r = rng() * total;
  for (const e of list) {
    r -= entryWeight(e);
    if (r < 0) return entryType(e);
  }
  return entryType(list[list.length - 1]);
}

function entryType(entry) {
  return typeof entry === "string" ? entry : entry.type;
}

function entryWeight(entry) {
  const base = speciesWeight(entryType(entry));
  const extra = typeof entry === "object" && entry.w != null ? entry.w : 1;
  return base * extra;
}

// Posiciones deterministas de fauna por chunk (sin dibujar). El parallax ya está
// aplicado (`sx` pantalla, `wx` mundo). La hora NO altera la identidad del candidato,
// solo filtra si está activo, así el mismo sitio+hora reproduce los mismos animales.
export function faunaSpawns(layer, camera, W, H, seed, hour, poolAt, chanceAt) {
  const f = layer.fauna;
  if (!f) return [];
  const p = layer.parallax;
  const chunkW = f.chunkW || 160;
  const chunkSeed = (seed + layer.seed * 13 + 40503) >>> 0;
  const startC = Math.floor((camera.x * p - 120) / chunkW);
  const endC = Math.floor((camera.x * p + W + 120) / chunkW);
  const out = [];

  for (let c = startC; c <= endC; c++) {
    const wx0 = c * chunkW;
    const chanceMul = chanceAt ? chanceAt(wx0) : 1;
    const rng = mulberry32(hashInt(c, chunkSeed));
    if (rng() > (f.chance ?? 0.5) * chanceMul) continue;
    const pool = poolAt ? poolAt(wx0) : null;
    // La rana se coloca aparte, en el borde del cauce (ver más abajo).
    const generic = (pool && pool.length ? pool : f.species).filter((e) => entryType(e) !== "rana");
    if (generic.length === 0) continue;
    const type = pickWeighted(generic, rng);
    const sp = SPECIES[type];
    if (!sp) continue;

    const wx = (c + rng()) * chunkW;
    const sx = wx - camera.x * p;
    const phase = rng() * Math.PI * 2;
    const dir = rng() < 0.5 ? -1 : 1;
    if (sx < -60 || sx > W + 60) continue;

    let gy = null;
    let flightY = null;
    if (sp.movement === "fly" || sp.movement === "flock") {
      flightY = layer.baseY - layer.amp * 0.55 - hash1(c, chunkSeed + 77) * layer.amp * 0.22;
    } else {
      if (riverInfluence(layer, wx) > 0.25) continue; // fuera del cauce
      gy = bankHeight(layer, wx);
      if (gy > H + 4) continue;
    }

    if (!isActive(sp, hour)) continue;
    out.push({ wx, sx, gy, flightY, type, phase, dir });
  }

  // Rana de Darwin: en el borde del cauce, si el bioma la incluye.
  if (layer.rivers) {
    const sp = SPECIES.rana;
    for (const ev of riverEvents(layer, camera, W)) {
      const rng = mulberry32(hashInt(Math.floor(ev.xc), (chunkSeed + 0x5a1a) >>> 0));
      if (rng() > 0.3) continue;
      const side = rng() < 0.5 ? -1 : 1;
      const wx = ev.xc + side * layer.rivers.width * 2.4;
      const sx = wx - camera.x * p;
      if (sx < -60 || sx > W + 60) continue;
      const pool = poolAt ? poolAt(wx) : null;
      const list = pool && pool.length ? pool : f.species;
      if (!list.some((e) => entryType(e) === "rana")) continue;
      if (!isActive(sp, hour)) continue;
      const gy = bankHeight(layer, wx);
      if (gy > H + 4) continue;
      const phase = rng() * Math.PI * 2;
      const dir = rng() < 0.5 ? -1 : 1;
      out.push({ wx, sx, gy, flightY: null, type: "rana", phase, dir });
    }
  }
  return out;
}

function drawFauna(ctx, layer, pal, camera, s, tSec) {
  if (!Number.isFinite(tSec)) tSec = 0;
  const sp = SPECIES[s.type];
  const p = layer.parallax;
  const osc = Math.sin(tSec * sp.speed + s.phase);
  const wx = s.wx + osc * sp.range;
  const left = Math.round(wx - camera.x * p);
  const colors = spriteColors(sp, pal);
  const base = sp.frames[0];
  const w = Math.max(...base.map((r) => r.length));
  const h = base.length;

  let top;
  if (sp.movement === "fly" || sp.movement === "flock") {
    top = Math.round(s.flightY + Math.sin(tSec * sp.speed * 0.7 + s.phase * 1.7) * 3 - h / 2);
  } else {
    let ground = bankHeight(layer, wx);
    if (sp.movement === "hop") ground -= Math.abs(Math.sin(tSec * sp.speed * 2 + s.phase)) * 2;
    if (sp.movement === "swim") ground += Math.sin(tSec * sp.speed * 1.3 + s.phase) * 1.5;
    top = Math.round(ground - h);
  }

  const nFrames = sp.frames.length;
  const framePos = Math.floor(tSec * sp.fps + s.phase / (Math.PI * 2));
  const fi = ((framePos % nFrames) + nFrames) % nFrames; // seguro ante tSec negativo
  const rows = sp.frames[fi] || sp.frames[0];
  drawMatrix(ctx, rows, colors, Math.round(left - w / 2), top, s.dir < 0);

  // Bandada: dos compañeros en formación determinista.
  if (sp.movement === "flock") {
    for (let i = 1; i <= 2; i++) {
      const dx = Math.round(i * 7 * s.dir);
      const dy = Math.round(Math.sin(tSec * sp.speed + s.phase + i * 1.3) * 1.5) - i * 2;
      drawMatrix(ctx, rows, colors, Math.round(left - w / 2) + dx, top + dy, s.dir < 0);
    }
  }
}

export function placeFauna(ctx, layer, pal, camera, W, H, seed, hour, tSec, poolAt, chanceAt) {
  if (!layer.fauna) return;
  for (const s of faunaSpawns(layer, camera, W, H, seed, hour, poolAt, chanceAt)) {
    drawFauna(ctx, layer, pal, camera, s, tSec);
  }
}
