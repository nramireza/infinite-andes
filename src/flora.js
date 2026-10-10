// Flora andina en pixel art: araucaria (pehuén), lenga/ñire, arbustos, rocas y pasto.

import { mulberry32, hashInt, hash1 } from "./rng.js";
import { bankHeight, riverInfluence } from "./terrain.js";
import { shade, lerpColor } from "./palette.js";

const FLOWER_COLORS = ["#e05a9a", "#f2c14e", "#f4f0e6", "#9a6ad0"];

// Registro de flora: una entrada por tipo dibujable. Es la **fuente única** de
// los pools: `zones[bioma][capa]` da el peso con que la especie aparece ahí.
// `kind` distingue especies con ficha ("especie") de genéricos y efectos; los
// campos `common/sci/endemism/notes` alimentan las fichas y las tablas de docs.
export const FLORA = {
  araucaria: {
    kind: "especie", common: "Araucaria / Pehuén", sci: "Araucaria araucana",
    endemism: "Sí (Chile/Argentina)", notes: "Árbol emblema; silueta de paraguas; la copa se bambolea.",
    zones: { centro: { precordillera: 1, valle: 1, costa: 1 }, sur: { precordillera: 1, valle: 1, costa: 1 } },
  },
  lenga: {
    kind: "especie", common: "Lenga / Ñire", sci: "Nothofagus pumilio / N. antarctica",
    endemism: "No (Patagonia)", notes: "Caducifolio: pierde hojas en otoño, queda desnudo en invierno y brota en primavera.",
    zones: { centro: { costa: 2 }, sur: { precordillera: 1, valle: 1, costa: 1 }, patagonia: { precordillera: 1, valle: 1, costa: 1 }, austral: { valle: 1 } },
  },
  copihue: {
    kind: "especie", common: "Copihue", sci: "Lapageria rosea",
    endemism: "Sí (Chile)", notes: "Enredadera y flor nacional; campanas rojas en primavera/verano.",
    zones: { centro: { costa: 1 }, sur: { valle: 1, costa: 1 } },
  },
  cactus: {
    kind: "especie", common: "Copao / Cactus columnar", sci: "Eulychnia spp.",
    endemism: "No", notes: "Columna con brazos y espinas.",
    zones: { altiplano: { precordillera: 1, valle: 1, costa: 1 }, norte: { precordillera: 1, valle: 1, costa: 1 } },
  },
  alerce: {
    kind: "especie", common: "Alerce / Lahual", sci: "Fitzroya cupressoides",
    endemism: "Sí (Chile/Argentina)", notes: "Conífera alta y estrecha; en peligro.",
    zones: { sur: { precordillera: 1, costa: 1 }, austral: { precordillera: 1, costa: 1 } },
  },
  nalca: {
    kind: "especie", common: "Nalca / Pangue", sci: "Gunnera tinctoria",
    endemism: "Sí (Chile/Argentina)", notes: "Hojas gigantes junto al agua.",
    zones: { sur: { valle: 1, costa: 1 }, austral: { valle: 1, costa: 1 } },
  },
  colihue: {
    kind: "especie", common: "Colihue / Quila", sci: "Chusquea spp.",
    endemism: "No", notes: "Cañaverales (bambú nativo).",
    zones: { sur: { valle: 1, costa: 1 }, patagonia: { valle: 1, costa: 1 }, austral: { valle: 1, costa: 1 } },
  },
  palma: {
    kind: "especie", common: "Palma chilena", sci: "Jubaea chilensis",
    endemism: "Sí (Chile)", notes: "Tronco esbelto y frondas; en peligro.",
    zones: { centro: { valle: 1, costa: 1 } },
  },
  coihue: {
    kind: "especie", common: "Coihue", sci: "Nothofagus dombeyi",
    endemism: "No (Patagonia)", notes: "Copa ancha y redondeada; tronco recto.",
    zones: { centro: { valle: 1, costa: 1 }, sur: { precordillera: 1, valle: 1, costa: 1 }, patagonia: { precordillera: 1, costa: 1 }, austral: { precordillera: 1, valle: 1, costa: 1 } },
  },
  roble: {
    kind: "especie", common: "Roble", sci: "Nothofagus obliqua",
    endemism: "Sí (Chile/Argentina)", notes: "Caducifolio; copa estrecha y erguida; pierde hojas en otoño.",
    zones: { centro: { valle: 1, costa: 1 }, sur: { valle: 1, costa: 1 } },
  },
  michay: {
    kind: "especie", common: "Michay", sci: "Berberis darwinii",
    endemism: "No (Patagonia)", notes: "Arbusto espinoso; flores naranjas en primavera/verano.",
    zones: { centro: { valle: 1, costa: 1 }, sur: { precordillera: 1, valle: 1, costa: 1 }, patagonia: { precordillera: 1, valle: 1, costa: 1 } },
  },
  chaura: {
    kind: "especie", common: "Chaura", sci: "Gaultheria mucronata",
    endemism: "No (Patagonia)", notes: "Arbusto achaparrado con bayas blanco-rosadas; perenne.",
    zones: { centro: { costa: 1 }, sur: { costa: 1 }, patagonia: { valle: 1, costa: 1 }, austral: { costa: 1 } },
  },
  quillay: {
    kind: "especie", common: "Quillay", sci: "Quillaja saponaria",
    endemism: "Sí (Chile)", notes: "Esclerófilo; flores blancas en primavera/verano.",
    zones: { centro: { precordillera: 1, valle: 1, costa: 1 }, sur: { valle: 1, costa: 1 } },
  },
  manio: {
    kind: "especie", common: "Mañío", sci: "Podocarpus spp.",
    endemism: "No (Patagonia)", notes: "Conífera austral oscura y estrecha; perenne.",
    zones: { sur: { valle: 1, costa: 1 }, patagonia: { valle: 1, costa: 1 }, austral: { precordillera: 1, valle: 1, costa: 1 } },
  },
  canelo: {
    kind: "especie", common: "Canelo", sci: "Drimys winteri",
    endemism: "No (Chile/Argentina)", notes: "Siempreverde de copa densa; flor blanca; árbol sagrado mapuche.",
    zones: { sur: { valle: 1, costa: 1 }, patagonia: { costa: 1 }, austral: { precordillera: 1, valle: 1, costa: 1 } },
  },
  arrayan: {
    kind: "especie", common: "Arrayán", sci: "Luma apiculata",
    endemism: "No (Chile/Argentina)", notes: "Tronco canela rojizo y copa menuda; flor blanca.",
    zones: { sur: { valle: 1, costa: 1 }, patagonia: { valle: 1, costa: 1 }, austral: { valle: 1, costa: 1 } },
  },
  notro: {
    kind: "especie", common: "Notro / Ciruelillo", sci: "Embothrium coccineum",
    endemism: "No (Chile/Argentina)", notes: "Ramilletes de flores rojas.",
    zones: { sur: { valle: 1, costa: 1 }, patagonia: { valle: 1, costa: 1 }, austral: { valle: 1, costa: 1 } },
  },
  bush: {
    kind: "generico", common: "Arbusto genérico", notes: "Bulto verde redondeado.",
    zones: {
      altiplano: { precordillera: 1, valle: 1, costa: 1 }, norte: { precordillera: 1, valle: 1, costa: 1 },
      centro: { valle: 1, costa: 1 }, sur: { precordillera: 1, valle: 1, costa: 1 },
      patagonia: { precordillera: 1, valle: 1, costa: 1 }, austral: { precordillera: 1, valle: 1, costa: 1 },
    },
  },
  crop: {
    kind: "generico", common: "Cultivos / campos", notes: "Hileras de cultivo; refuerza el valle agrícola.",
    zones: { norte: { valle: 1 }, centro: { valle: 2 } },
  },
  grass: {
    kind: "generico", common: "Pasto / duna", notes: "Matas pequeñas de pasto.",
    zones: {
      altiplano: { precordillera: 1, valle: 2, costa: 1, playa: 1 }, norte: { valle: 1, playa: 1 },
      centro: { valle: 1, playa: 2 }, sur: { playa: 1 }, patagonia: { valle: 1, playa: 1 }, austral: { playa: 1 },
    },
  },
  rock: {
    kind: "generico", common: "Rocas", notes: "Pedreros sueltos.",
    zones: {
      altiplano: { precordillera: 1, valle: 1, costa: 1, playa: 1 }, norte: { precordillera: 1, valle: 1, costa: 1, playa: 1 },
      centro: { playa: 1 }, sur: { playa: 1 }, patagonia: { precordillera: 1, playa: 1 }, austral: { playa: 1 },
    },
  },
  flower: {
    kind: "efecto", common: "Flor del desierto", bloomOnly: true, notes: "Parche del desierto florido; entra solo con la floración.",
  },
};

// Pools de centro derivados de las zonas (fallback de `floraSpawns` sin `poolAt`).
const CENTRO_FLORA = {};
for (const type in FLORA) {
  const z = FLORA[type].zones?.centro;
  if (!z) continue;
  for (const layerName in z) (CENTRO_FLORA[layerName] ||= []).push({ type, w: z[layerName] });
}
function centroFloraPool(layerName) {
  return CENTRO_FLORA[layerName] || null;
}

const DEFAULT_FLORA_POOL = [{ type: "grass", w: 1 }];

function drawAraucaria(ctx, x, baseY, size, pal, sway) {
  x = Math.round(x);
  baseY = Math.round(baseY);

  const trunkH = Math.max(3, Math.round(size * 0.6));
  const trunkW = Math.max(1, Math.round(size * 0.08));
  const trunkTop = baseY - trunkH;

  // tronco
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - (trunkW >> 1), trunkTop, trunkW, trunkH);

  // copa: paraguas de ramas punzantes (silueta de araucaria), por pisos
  const crownH = Math.max(4, Math.round(size * 0.64));
  const crownTop = baseY - size;
  const halfMax = Math.max(2, Math.round(size * 0.44));
  const rim = shade(pal.trunk, -0.1);

  for (let i = 0; i < crownH; i++) {
    const t = i / crownH; // 0 arriba, 1 abajo
    // copa de paraguas: más ancha al centro, redondeada arriba y al pie
    const profile = 0.3 + 0.7 * Math.sin(Math.min(1, t) * Math.PI * 0.95);
    let half = Math.max(1, Math.round(halfMax * profile));
    if (i % 3 === 0) half = Math.max(1, half - 1); // separación entre pisos
    const yy = crownTop + i;
    const off = Math.round(sway * (crownH - i) * 0.15);
    const cx = x + off;

    // borde iluminado arriba / a la izquierda
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(cx - half, yy, half * 2 + 1, 1);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(cx - half + 1, yy, Math.max(1, half * 2 - (t < 0.4 ? 0 : 1)), 1);

    // "púas" laterales de las ramas, más largas hacia abajo
    if (i % 2 === 0) {
      ctx.fillStyle = pal.floraD;
      const spike = t > 0.4 ? 2 : 1;
      ctx.fillRect(cx - half - spike, yy, spike, 1);
      ctx.fillRect(cx + half + 1, yy, spike, 1);
    }
    // sombra interna ocasional
    if (i % 4 === 2) {
      ctx.fillStyle = rim;
      ctx.fillRect(cx - Math.max(1, half - 2), yy, Math.max(1, half - 1), 1);
    }
  }

  // remate superior
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, crownTop - 1, 2, 1);
}

// Ramas desnudas (invierno): tallos diagonales desde la punta del tronco.
function drawBareBranches(ctx, x, top, h, pal) {
  ctx.fillStyle = pal.trunk;
  for (const [dir, len, wave] of [[-1, 0.8, 0.5], [0, 1.0, 0], [1, 0.7, -0.5]]) {
    const steps = Math.max(2, Math.round(h * len));
    let bx = x;
    for (let i = 0; i < steps; i++) {
      const yy = top + steps - i;
      bx = x + Math.round(dir * (i * 0.35 + (i % 2) * wave));
      ctx.fillRect(bx, yy, 1, 1);
    }
    if (dir !== 0 && steps > 3) ctx.fillRect(bx + dir, top + Math.round(steps * 0.4), 1, 1);
  }
}

function drawLenga(ctx, x, baseY, size, pal, warm, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(4, Math.round(size * 0.9));
  const w = Math.max(3, Math.round(size * 0.85));
  const trunkH = Math.max(2, Math.round(size * 0.25));
  const trunkTop = baseY - trunkH;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, trunkTop, 2, trunkH);

  const top = baseY - h;
  const cx = x;
  const cy = top + (h - trunkH) / 2;
  const rx = w / 2;
  const ry = (h - trunkH) / 2;
  const light = warm ? pal.sun : pal.floraL;
  const dark = warm ? pal.sunGlow : pal.floraD;

  if (season === 2) {
    // Invierno: copa desnuda, solo ramas.
    drawBareBranches(ctx, x, top, h - trunkH, pal);
    return;
  }

  for (let dy = -ry; dy <= ry; dy++) {
    // Otoño: hojas que se caen (huecos deterministas en la copa).
    if (season === 1 && hash1(Math.floor(x) * 7 + Math.round(dy) + 0x1e, 0xa7e) < 0.32) continue;
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    ctx.fillStyle = dark;
    ctx.fillRect(cx - span, Math.round(cy + dy), span * 2 + 1, 1);
    ctx.fillStyle = light;
    ctx.fillRect(cx - span, Math.round(cy + dy), span * 2 + 1, 1);
    ctx.fillStyle = dark;
    ctx.fillRect(cx - span + Math.max(1, span >> 1), Math.round(cy + dy), Math.max(1, span), 1);
  }

  if (season === 3) {
    // Primavera: brotes claros en la punta de la copa.
    ctx.fillStyle = light;
    ctx.fillRect(cx - 2, Math.round(cy - ry), 1, 1);
    ctx.fillRect(cx + 1, Math.round(cy - ry) + 1, 1, 1);
  }
}

function drawBush(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.72));
  const h = Math.max(2, Math.round(size * 0.44));
  for (let r = 0; r < h; r++) {
    const t = (r + 1) / (h + 1);
    const half = Math.max(1, Math.round((w / 2) * Math.sin(t * Math.PI * 0.9) + w * 0.08));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0 || r === h - 1) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
}

function drawGrass(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const n = 2 + Math.floor(size * 0.4);
  for (let i = 0; i < n; i++) {
    const gx = x + i - (n >> 1);
    const gh = 1 + ((i * 7 + Math.floor(x)) % 2);
    ctx.fillStyle = i % 2 ? pal.floraL : pal.floraD;
    ctx.fillRect(gx, baseY - gh, 1, gh);
  }
}

function drawCrop(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(4, Math.round(size * 0.9));
  const h = Math.max(1, Math.round(size * 0.32));
  ctx.fillStyle = pal.valleyD;
  ctx.fillRect(x - (w >> 1), baseY - h, w, h);
  for (let i = 0; i < w; i += 2) {
    ctx.fillStyle = i % 4 === 0 ? pal.valleyL : pal.costaL;
    ctx.fillRect(x - (w >> 1) + i, baseY - h - 1, 1, 1);
  }
}

function drawRock(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.55));
  const h = Math.max(2, Math.round(size * 0.32));
  const profile = [0.45, 0.75, 1, 0.95, 0.7];
  for (let r = 0; r < h; r++) {
    const f = profile[Math.min(r, profile.length - 1)];
    const half = Math.max(1, Math.round((w / 2) * f));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.rockD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0) {
      ctx.fillStyle = pal.rock;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
}

// Dispatch de dibujo por tipo. Las funciones se declaran más abajo (hoisting);
// cada una recibe un `env` uniforme { sway, warm, season, night }.
export const DRAWERS = {
  araucaria: (ctx, x, y, s, pal, e) => drawAraucaria(ctx, x, y, s, pal, e.sway),
  lenga: (ctx, x, y, s, pal, e) => drawLenga(ctx, x, y, s, pal, e.warm, e.season),
  bush: (ctx, x, y, s, pal) => drawBush(ctx, x, y, s, pal),
  grass: (ctx, x, y, s, pal) => drawGrass(ctx, x, y, s, pal),
  crop: (ctx, x, y, s, pal) => drawCrop(ctx, x, y, s, pal),
  rock: (ctx, x, y, s, pal) => drawRock(ctx, x, y, s, pal),
  flower: (ctx, x, y, s, pal, e) => drawFlower(ctx, x, y, s, pal, e.sway, e.night),
  cactus: (ctx, x, y, s, pal) => drawCactus(ctx, x, y, s, pal),
  alerce: (ctx, x, y, s, pal) => drawAlerce(ctx, x, y, s, pal),
  nalca: (ctx, x, y, s, pal) => drawNalca(ctx, x, y, s, pal),
  colihue: (ctx, x, y, s, pal) => drawColihue(ctx, x, y, s, pal),
  palma: (ctx, x, y, s, pal) => drawPalma(ctx, x, y, s, pal),
  coihue: (ctx, x, y, s, pal) => drawCoihue(ctx, x, y, s, pal),
  roble: (ctx, x, y, s, pal, e) => drawRoble(ctx, x, y, s, pal, e.season),
  copihue: (ctx, x, y, s, pal, e) => drawCopihue(ctx, x, y, s, pal, e.season),
  michay: (ctx, x, y, s, pal, e) => drawMichay(ctx, x, y, s, pal, e.season),
  chaura: (ctx, x, y, s, pal) => drawChaura(ctx, x, y, s, pal),
  quillay: (ctx, x, y, s, pal, e) => drawQuillay(ctx, x, y, s, pal, e.season),
  manio: (ctx, x, y, s, pal) => drawManio(ctx, x, y, s, pal),
  canelo: (ctx, x, y, s, pal, e) => drawCanelo(ctx, x, y, s, pal, e.season),
  arrayan: (ctx, x, y, s, pal, e) => drawArrayan(ctx, x, y, s, pal, e.season),
  notro: (ctx, x, y, s, pal, e) => drawNotro(ctx, x, y, s, pal, e.season),
};

export function drawPlant(ctx, x, baseY, size, type, pal, sway, warm, season = 0, night = 0) {
  const fn = DRAWERS[type] || DRAWERS.grass;
  fn(ctx, x, baseY, size, pal, { sway, warm, season, night });
}

// Copao / cactus columnar (norte árido): tronco con costillas, brazo en
// candelabro y espinas. Más alto y macizo que antes.
function drawCactus(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 1.0));
  const top = baseY - h;
  const w = h > 11 ? 3 : 2;
  const half = w >> 1;

  // tronco con costilla iluminada a la izquierda
  ctx.fillStyle = pal.floraD;
  ctx.fillRect(x - half, top, w, h);
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - half, top, 1, h);

  // brazo en candelabro (sube en ángulo recto)
  const dir = hash1(x, 0xcac) < 0.5 ? -1 : 1;
  const armY = top + Math.round(h * 0.42);
  const armH = Math.max(2, Math.round(h * 0.3));
  ctx.fillStyle = pal.floraD;
  ctx.fillRect(x + dir * (half + 1), armY, 2, 1);
  ctx.fillRect(x + dir * (half + 2), armY - armH, 1, armH + 1);
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x + dir * (half + 2), armY - armH, 1, 1);

  // espinas laterales
  ctx.fillStyle = pal.sandD;
  for (let i = 2; i < h; i += 3) {
    ctx.fillRect(x - half - 1, top + i, 1, 1);
    ctx.fillRect(x + half + 1, top + i + 1, 1, 1);
  }

  // flor apical ocasional
  if (hash1(x, 0xcaf) < 0.5) {
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x, top - 1, 1, 1);
  }
}

// Alerce: conífera austral alta y estrecha.
function drawAlerce(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(8, Math.round(size * 1.05));
  const trunkH = Math.max(2, Math.round(size * 0.2));
  const top = baseY - h;
  const halfMax = Math.max(2, Math.round(size * 0.32));

  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  for (let i = 0; i < h - trunkH; i++) {
    const t = i / (h - trunkH);
    const half = Math.max(1, Math.round(halfMax * Math.pow(t, 0.68)));
    const yy = top + i;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    if (i % 2 === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    }
    // ramas colgantes: puntas que caen una fila por debajo
    if (i % 3 === 1) {
      ctx.fillStyle = pal.floraD;
      ctx.fillRect(x - half - 1, yy + 1, 1, 1);
      ctx.fillRect(x + half + 1, yy + 1, 1, 1);
    }
  }
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, top - 1, 2, 1);
}

// Nalca / pangue (Gunnera): roseta de hojas gigantes de borde dentado sobre
// pecíolos largos, con nervadura central marcada.
function drawNalca(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const n = 3 + Math.floor(size * 0.12);
  for (let i = 0; i < n; i++) {
    const h = hash1(i * 13 + x, 0xaa11);
    const lx = x + Math.round((h - 0.5) * size * 0.9);
    const stemH = Math.max(2, Math.round(size * (0.32 + h * 0.35)));
    const top = baseY - stemH;
    ctx.fillStyle = pal.trunk;
    ctx.fillRect(lx, top, 1, stemH);

    const r = Math.max(2, Math.round(size * 0.24));
    for (let dy = -r; dy <= r; dy++) {
      const span = Math.floor(r * Math.sqrt(Math.max(0, 1 - (dy / r) ** 2)));
      if (span <= 0) continue;
      const dent = hash1(i * 31 + lx + dy, 0xaa12) < 0.5 ? 1 : 0; // borde irregular
      ctx.fillStyle = pal.floraD;
      ctx.fillRect(lx - span - dent, top + dy, span * 2 + 1 + dent, 1);
    }
    // nervadura central + borde superior iluminado
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(lx, top - r, 1, r * 2 + 1);
    ctx.fillRect(lx - r, top - r, r * 2 + 1, 1);
  }
}

// Colihue / quila: cañaveral de tallos finos con hojas.
function drawColihue(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const n = 3 + Math.floor(size * 0.2);
  for (let i = 0; i < n; i++) {
    const h = hash1(i * 17 + x, 0xc01);
    const cxp = x + i - (n >> 1);
    const ch = Math.max(4, Math.round(size * (0.7 + h * 0.5)));
    ctx.fillStyle = pal.trunk;
    ctx.fillRect(cxp, baseY - ch, 1, ch);
    // nudos de la caña
    ctx.fillStyle = pal.floraD;
    for (let k = 2; k < ch; k += 3) ctx.fillRect(cxp, baseY - ch + k, 1, 1);
    ctx.fillStyle = i % 2 ? pal.floraL : pal.floraD;
    for (let j = 0; j < 4; j++) {
      const ly = baseY - ch + 1 + j * 2;
      const dir = (j + i) % 2 ? 1 : -1;
      ctx.fillRect(cxp + dir, ly, 1, 1);
      ctx.fillRect(cxp + dir * 2, ly + 1, 1, 1);
    }
  }
}

// Palma chilena (Jubaea): tronco alto con anillos y corona de frondas arqueadas
// (hacia arriba y hacia abajo), con cogollo central.
function drawPalma(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const trunkH = Math.max(4, Math.round(size * 0.46));
  const top = baseY - trunkH;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, top, 2, trunkH);
  ctx.fillStyle = shade(pal.trunk, -0.2);
  for (let i = 3; i < trunkH; i += 3) ctx.fillRect(x - 1, top + i, 2, 1);

  // frondas: radios que escalan con el tamaño (arqueadas hacia abajo)
  const r = Math.max(3, Math.round(size * 0.26));
  const dirs = [
    [0, -1], [-0.6, -0.85], [0.6, -0.85], [-0.9, -0.4], [0.9, -0.4],
    [-1, 0.15], [1, 0.15], [-0.8, 0.6], [0.8, 0.6],
  ];
  ctx.fillStyle = pal.floraD;
  for (const [ux, uy] of dirs) {
    for (let k = 1; k <= r; k++) {
      ctx.fillRect(x + Math.round(ux * k), top + Math.round(uy * k), 1, 1);
    }
  }
  ctx.fillStyle = pal.floraL;
  for (const [ux, uy] of [[0, -1], [-1, 0.15], [1, 0.15], [-0.8, 0.6], [0.8, 0.6]]) {
    ctx.fillRect(x + Math.round(ux * r), top + Math.round(uy * r), 1, 1);
  }
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x, top - 1, 1, 2);
}

// Coihue: copa ancha y redondeada sobre tronco recto.
function drawCoihue(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 1.1));
  const trunkH = Math.max(3, Math.round(size * 0.38));
  const top = baseY - h;
  // tronco recto y ramas que abren hacia la copa
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  ctx.fillRect(x - 2, baseY - trunkH - 2, 1, 2);
  ctx.fillRect(x + 2, baseY - trunkH - 2, 1, 2);
  ctx.fillRect(x - 3, baseY - trunkH - 4, 1, 2);
  ctx.fillRect(x + 3, baseY - trunkH - 4, 1, 2);

  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.48));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const t = dy / ry;
    let span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - t * t)));
    if (hash1(Math.floor(x) * 7 + Math.round(dy), 0xc01) < 0.35) span -= 1; // borde irregular
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x + 1, yy, span, 1);
  }
}

// Roble: copa más estrecha y erguida. Caducifolio: en invierno queda desnudo y
// en otoño pierde hojas (huecos deterministas).
function drawRoble(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 1.15));
  const trunkH = Math.max(2, Math.round(size * 0.28));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  const crownH = h - trunkH;
  if (season === 2) {
    drawBareBranches(ctx, x, top, crownH, pal);
    return;
  }
  // ramas ascendentes que sostienen la copa estrecha
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 2, baseY - trunkH - 2, 1, 2);
  ctx.fillRect(x + 2, baseY - trunkH - 2, 1, 2);

  const halfMax = Math.max(2, Math.round(size * 0.32));
  for (let i = 0; i < crownH; i++) {
    if (season === 1 && hash1(Math.floor(x) * 11 + i + 0x2f, 0xb3e) < 0.3) continue;
    const t = i / crownH;
    let half = Math.max(1, Math.round(halfMax * Math.sin((0.25 + 0.75 * t) * Math.PI)));
    if (hash1(Math.floor(x) * 13 + i, 0xb0b) < 0.3) half = Math.max(1, half - 1); // copa irregular
    const yy = top + i;
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x + 1, yy, half, 1);
  }
  if (season === 3) {
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - 2, top - 1, 1, 1);
    ctx.fillRect(x + 1, top - 2, 1, 1);
  }
}

// Copihue: enredadera con tallo ondulado y campanas rojas colgantes.
// Las campanas florecen en verano y primavera; en otoño/invierno solo queda la enredadera.
function drawCopihue(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.95));
  const top = baseY - h;
  for (let i = 0; i < h; i++) {
    const yy = baseY - i;
    const off = Math.round(Math.sin(i * 0.6) * 1.5);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x + off, yy, 1, 1);
    if (i % 3 === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x + off + (i % 2 ? 1 : -1), yy, 1, 1);
    }
  }
  if (season !== 0 && season !== 3) return;
  const n = 2 + Math.floor(size * 0.12);
  for (let i = 0; i < n; i++) {
    const yy = top + Math.round(((i + 1) / (n + 1)) * h);
    const off = Math.round(Math.sin((baseY - yy) * 0.6) * 1.5);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x + off, yy, 1, 1);
    ctx.fillStyle = "#d94f6a";
    ctx.fillRect(x + off, yy + 1, 1, 2);
    ctx.fillRect(x + off - 1, yy + 2, 1, 1);
    ctx.fillRect(x + off + 1, yy + 2, 1, 1);
  }
}

// Michay: arbusto espinoso con flores naranjas en primavera y verano.
function drawMichay(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.7));
  const h = Math.max(3, Math.round(size * 0.5));
  for (let r = 0; r < h; r++) {
    const t = (r + 1) / (h + 1);
    const half = Math.max(1, Math.round((w / 2) * Math.sin(t * Math.PI * 0.9) + w * 0.08));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
  ctx.fillStyle = pal.floraD;
  ctx.fillRect(x - (w >> 1) - 1, baseY - h + 1, 1, 1);
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.12);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 23 + x, 0xb011);
    const fx = x + Math.round((hh - 0.5) * w * 0.9);
    const fy = baseY - h - 1 - (i % 2);
    ctx.fillStyle = "#e8912a";
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(fx, fy + 1, 1, 1);
  }
}

// Chaura (Gaultheria mucronata): arbusto achaparrado del sotobosque con bayas
// blanco-rosadas, perenne todo el año.
function drawChaura(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = Math.max(3, Math.round(size * 0.6));
  const h = Math.max(2, Math.round(size * 0.42));
  for (let r = 0; r < h; r++) {
    const t = (r + 1) / (h + 1);
    const half = Math.max(1, Math.round((w / 2) * Math.sin(t * Math.PI * 0.9) + w * 0.08));
    const yy = baseY - h + r;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2, 1);
    if (r === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2, 1);
    }
  }
  const n = 1 + Math.floor(size * 0.14);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 29 + x, 0x0c4);
    const fx = x + Math.round((hh - 0.5) * w * 0.9);
    const fy = baseY - h - 1 - (i % 2);
    ctx.fillStyle = "#f2d8e8";
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillStyle = "#d97a9a";
    ctx.fillRect(fx, fy - 1, 1, 1);
  }
}

// Quillay (Quillaja saponaria): árbol esclerófilo de copa redondeada; florece
// (motas blancas) en primavera y verano.
function drawQuillay(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.85));
  const trunkH = Math.max(2, Math.round(size * 0.22));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);

  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.4));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    if (hash1(Math.floor(x) * 5 + yy, 0x9111) < 0.4) {
      ctx.fillStyle = pal.floraD;
      ctx.fillRect(x + 1, yy, span, 1);
    }
  }
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.1);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 37 + x, 0x9112);
    const fy = top + 1 + Math.round(((i + 1) / (n + 1)) * crownH);
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(x + Math.round((hh - 0.5) * rx * 1.6), fy, 1, 1);
  }
}

// Mañío (Podocarpus): conífera austral de copa estrecha, oscura y colgante.
function drawManio(ctx, x, baseY, size, pal) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(7, Math.round(size * 1.0));
  const trunkH = Math.max(2, Math.round(size * 0.18));
  const top = baseY - h;
  const halfMax = Math.max(2, Math.round(size * 0.3));
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  for (let i = 0; i < h - trunkH; i++) {
    const t = i / (h - trunkH);
    const half = Math.max(1, Math.round(halfMax * (0.35 + 0.65 * Math.sin(t * Math.PI))));
    const yy = top + i;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    if (i % 3 === 0 || t < 0.18) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half, yy, half * 2 + 1, 1);
    }
    if (i % 2 === 1) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - half - 1, yy, 1, 1);
      ctx.fillRect(x + half + 1, yy, 1, 1);
    }
  }
  ctx.fillStyle = pal.floraL;
  ctx.fillRect(x - 1, top - 1, 2, 1);
}

// Canelo (Drimys winteri): siempreverde de copa densa; flor blanca en primavera/verano.
function drawCanelo(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(6, Math.round(size * 0.95));
  const trunkH = Math.max(2, Math.round(size * 0.24));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.36));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    // brillo de hoja lustrosa
    if ((yy + span) % 3 === 0) {
      ctx.fillStyle = pal.floraL;
      ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    }
  }
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.1);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 41 + x, 0xc0e);
    ctx.fillStyle = "#f6f2e6";
    ctx.fillRect(x + Math.round((hh - 0.5) * rx * 1.7), top + 1 + (i % Math.max(1, crownH)), 1, 1);
  }
}

// Arrayán (Luma apiculata): tronco canela rojizo y copa menuda; flor blanca.
function drawArrayan(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.8));
  const trunkH = Math.max(3, Math.round(size * 0.34));
  const top = baseY - h;
  ctx.fillStyle = "#8a4a3a";
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  const crownH = h - trunkH;
  const ry = crownH / 2;
  const rx = Math.max(2, Math.round(size * 0.32));
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    const yy = Math.round(cy + dy);
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, yy, span * 2 + 1, 1);
    ctx.fillStyle = pal.floraL;
    ctx.fillRect(x - span, yy, Math.max(1, span), 1);
  }
  if (season !== 0 && season !== 3) return;
  const n = 1 + Math.floor(size * 0.1);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 43 + x, 0xa77a);
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(x + Math.round((hh - 0.5) * rx * 1.6), top + 1 + (i % 3), 1, 1);
  }
}

// Notro / ciruelillo (Embothrium coccineum): ramilletes de flores rojas.
function drawNotro(ctx, x, baseY, size, pal, season = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const h = Math.max(5, Math.round(size * 0.85));
  const trunkH = Math.max(2, Math.round(size * 0.26));
  const top = baseY - h;
  ctx.fillStyle = pal.trunk;
  ctx.fillRect(x - 1, baseY - trunkH, 2, trunkH);
  const crownH = h - trunkH;
  const rx = Math.max(2, Math.round(size * 0.34));
  const ry = crownH / 2;
  const cy = top + ry;
  for (let dy = -ry; dy <= ry; dy++) {
    const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (span <= 0) continue;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(x - span, Math.round(cy + dy), span * 2 + 1, 1);
  }
  if (season !== 0 && season !== 3) return;
  const n = 2 + Math.floor(size * 0.14);
  for (let i = 0; i < n; i++) {
    const hh = hash1(i * 47 + x, 0x07e0);
    const fx = x + Math.round((hh - 0.5) * rx * 1.8);
    const fy = baseY - Math.round(2 + hh * crownH);
    ctx.fillStyle = "#d1401e";
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillStyle = "#f26a2a";
    ctx.fillRect(fx + 1, fy - (i % 2), 1, 1);
  }
}

// Parche de flores del desierto florido: manto amplio (~10x el área del racimo
// original) de tallos cortos con corola de 3 px, en dos filas de profundidad.
// De noche (`night` 0..1) las corolas se apagan hacia el cielo nocturno.
function drawFlower(ctx, x, baseY, size, pal, sway, night = 0) {
  x = Math.round(x);
  baseY = Math.round(baseY);
  const w = size * 2.6;
  const n = 6 + Math.floor(size * 0.7);
  const dim = Math.min(1, Math.max(0, night)) * 0.85;
  for (let i = 0; i < n; i++) {
    const h = hash1(i * 31 + x, 0xf10e);
    const back = hash1(i * 53 + x, 0xf10f) < 0.45 ? 1 : 0; // fila de fondo
    const fx = x + Math.round((h - 0.5) * w + sway) - back;
    const stemH = 1 + Math.floor(h * 4);
    const base = FLOWER_COLORS[Math.floor(hash1(i * 7 + x, 0xf1a) * FLOWER_COLORS.length)];
    const col = dim > 0 ? lerpColor(base, pal.skyTop, dim) : base;
    const yy = baseY - back;
    ctx.fillStyle = pal.floraD;
    ctx.fillRect(fx, yy - stemH, 1, stemH);
    ctx.fillStyle = col;
    ctx.fillRect(fx, yy - stemH - 1, 1, 1);
    ctx.fillRect(fx - 1, yy - stemH, 1, 1);
    ctx.fillRect(fx + 1, yy - stemH, 1, 1);
  }
}

// Sorteo ponderado de tipo (consume un único `rng()`, como la elección uniforme).
function pickType(pool, rng) {
  let total = 0;
  for (const e of pool) total += e.w;
  if (total <= 0) return pool[0].type;
  let r = rng() * total;
  for (const e of pool) {
    r -= e.w;
    if (r < 0) return e.type;
  }
  return pool[pool.length - 1].type;
}

// Posiciones deterministas de flora por chunk (sin dibujar). El parallax ya está
// aplicado (`sx` es pantalla, `wx` mundo). No depende del tiempo, así es testeable.
export function floraSpawns(layer, camera, W, H, seed, poolAt) {
  const f = layer.flora;
  if (!f) return [];
  const p = layer.parallax;
  const chunkW = f.chunkW || 56;
  const startC = Math.floor((camera.x * p - 80) / chunkW);
  const endC = Math.floor((camera.x * p + W + 80) / chunkW);
  const out = [];

  for (let c = startC; c <= endC; c++) {
    const rng = mulberry32(hashInt(c, (seed + layer.seed * 7) >>> 0));
    const count = Math.floor(rng() * f.maxPer) + (rng() < f.minChance ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const wx = (c + rng()) * chunkW;
      const sx = wx - camera.x * p;
      if (sx < -48 || sx > W + 48) continue;

      if (riverInfluence(layer, wx) > 0.25) continue; // fuera del cauce
      const gy = Math.round(bankHeight(layer, wx));
      if (gy > H + 4) continue;
      const size = f.minSize + rng() * (f.maxSize - f.minSize);
      const pool = poolAt ? poolAt(wx) : null;
      const list = pool && pool.length ? pool : centroFloraPool(layer.name);
      const type = pickType(list && list.length ? list : DEFAULT_FLORA_POOL, rng);
      const warm = rng() < 0.4;
      // Las flores de la floración se reparten hacia el interior de la banda
      // visible de la capa (no solo en el contorno). El hash no consume rng.
      let depth = 0;
      if (type === "flower") {
        const d = hash1(Math.floor(wx * 0.5), 0xf100);
        depth = Math.round(d * (layer.amp || 12) * 1.3);
      }
      out.push({ wx, sx, gy, size, type, warm, depth });
    }
  }
  return out;
}

// `season` (opcional) = índice de estación para las variantes (hojas, brotes, flores);
// `night` (opcional) = 0..1 para apagar las corolas del desierto de noche.
// El spawn no cambia: solo varía el dibujo, así los dorados de flora quedan intactos.
export function placeFlora(ctx, layer, pal, camera, W, H, seed, tSec, poolAt, season, night) {
  if (!layer.flora) return;
  if (layer.darken) {
    pal = {
      ...pal,
      floraL: shade(pal.floraL, -layer.darken),
      floraD: shade(pal.floraD, -layer.darken),
      trunk: shade(pal.trunk, -layer.darken),
      rock: shade(pal.rock, -layer.darken),
      rockD: shade(pal.rockD, -layer.darken),
      sun: shade(pal.sun, -layer.darken * 0.5),
      sunGlow: shade(pal.sunGlow, -layer.darken * 0.5),
    };
  }
  const seasonIdx = Number.isInteger(season) ? season : 0;
  const nightAmt = Number.isFinite(night) ? Math.min(1, Math.max(0, night)) : 0;
  for (const s of floraSpawns(layer, camera, W, H, seed, poolAt)) {
    const sway = Math.sin(tSec * 0.9 + s.wx * 0.05);
    const gy = s.depth ? Math.min(H - 2, s.gy + s.depth) : s.gy;
    drawPlant(ctx, s.sx, gy, s.size, s.type, pal, sway, s.warm, seasonIdx, nightAmt);
  }
}
