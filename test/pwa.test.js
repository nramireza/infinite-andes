// PWA: coherencia del manifest, íconos y service worker.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function pngSize(buf) {
  assert.equal(buf.slice(0, 8).toString("hex"), "89504e470d0a1a0a", "firma PNG inválida");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test("el manifest es JSON válido con los campos requeridos", () => {
  const m = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
  assert.equal(m.name, "Infinite Andes");
  assert.ok(m.short_name, "sin short_name");
  assert.ok(m.start_url.startsWith("."), "start_url debe ser relativo");
  assert.ok(m.scope.startsWith("."), "scope debe ser relativo");
  assert.ok(["fullscreen", "standalone"].includes(m.display), "display inválido");
  assert.match(m.background_color, /^#[0-9a-f]{6}$/i);
  assert.match(m.theme_color, /^#[0-9a-f]{6}$/i);
  assert.ok(Array.isArray(m.icons) && m.icons.length >= 2, "faltan íconos");
});

test("los íconos declarados existen y son PNG del tamaño indicado", () => {
  const m = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
  for (const icon of m.icons) {
    const size = Number(icon.sizes.split("x")[0]);
    const file = join(ROOT, icon.src);
    assert.ok(existsSync(file), `ícono ausente: ${icon.src}`);
    const { width, height } = pngSize(readFileSync(file));
    assert.equal(width, size, `${icon.src}: ancho`);
    assert.equal(height, size, `${icon.src}: alto`);
    assert.match(icon.purpose || "any", /maskable|any/);
  }
});

test("el service worker solo referencia archivos existentes", () => {
  const src = readFileSync(join(ROOT, "sw.js"), "utf8");
  const block = src.match(/const SHELL = \[([\s\S]*?)\];/);
  assert.ok(block, "no se halló SHELL en sw.js");
  const files = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(files.length > 0, "SHELL vacío");
  for (const rel of files) {
    const path = rel === "./" ? join(ROOT, "index.html") : join(ROOT, rel);
    assert.ok(existsSync(path), `sw.js referencia un archivo ausente: ${rel}`);
  }
});
