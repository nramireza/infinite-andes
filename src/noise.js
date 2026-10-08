// Ruido de valor 1D con interpolación suave + fBm.

import { hash1 } from "./rng.js";

function smooth(t) {
  return t * t * (3 - 2 * t);
}

export function valueNoise1(x, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash1(i, seed);
  const b = hash1(i + 1, seed);
  return a + (b - a) * smooth(f);
}

export function fbm1(x, seed = 0, octaves = 4, lacunarity = 2.0, gain = 0.5) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise1(x * freq, (seed + o * 1013) >>> 0);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

// Ruido "ridged": crestas afiladas, ideal para montañas.
export function ridged1(x, seed = 0, octaves = 4) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    const n = valueNoise1(x * freq, (seed + o * 7919) >>> 0);
    sum += amp * (1 - Math.abs(n * 2 - 1));
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum / norm;
}
