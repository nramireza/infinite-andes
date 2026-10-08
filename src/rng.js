// PRNG determinista + hashing por chunk.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Hash determinista de un entero -> entero de 32 bits (para sembrar PRNGs).
export function hashInt(n, seed = 0) {
  let h = (n | 0) ^ Math.imul(seed | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

// Hash determinista de un entero -> [0,1). Independiente del orden.
export function hash1(n, seed = 0) {
  return hashInt(n, seed) / 4294967296;
}

// Semilla legible -> entero de 32 bits.
export function seedToInt(seed) {
  if (typeof seed === "number") return seed >>> 0;
  const s = String(seed).trim();
  if (s === "") return 0;
  const n = Number(s);
  if (Number.isFinite(n)) return n >>> 0;
  return hashString(s);
}
