// Snapshot dorado en JSON. Regenerar con: UPDATE_GOLDEN=1 npm test

import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hashString } from "../../src/rng.js";

const goldenPath = join(dirname(fileURLToPath(import.meta.url)), "..", "golden.json");

export function digest(values) {
  const parts = values.map((v) =>
    typeof v === "number" ? String(Math.round(v * 1000) / 1000) : String(v)
  );
  return hashString(parts.join(",")).toString(16).padStart(8, "0");
}

function load() {
  if (!existsSync(goldenPath)) return {};
  return JSON.parse(readFileSync(goldenPath, "utf8"));
}

export function golden(t, name, value) {
  const all = load();
  if (process.env.UPDATE_GOLDEN === "1") {
    all[name] = value;
    writeFileSync(goldenPath, JSON.stringify(all, null, 2) + "\n");
    t.diagnostic(`dorado actualizado: ${name} = ${value}`);
    return;
  }
  assert.ok(name in all, `falta el dorado "${name}". Corre UPDATE_GOLDEN=1 npm test.`);
  assert.equal(all[name], value, `el dorado "${name}" cambió`);
}
