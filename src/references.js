// Manifiesto de referencias fotográficas (docs/referencias/manifiesto.csv).
//
// Material de edición para dibujar sprites con más fidelidad: nunca se carga en
// runtime (el sprite sigue siendo una matriz de píxeles en código). Puro, sin DOM
// ni Node, para poder validarlo en los tests (ver docs/18-referencias.md).

// Licencias admisibles (uso libre sin obligación de atribución).
export const REF_LICENSES = ["PD", "CC0"];

// Campos esperados por fila del manifiesto.
export const REF_FIELDS = ["id", "especie", "sci", "fuente", "autor", "licencia", "encuadre", "archivo"];

// Divide una línea CSV (soporta comillas dobles y comas escapadas).
function splitLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// CSV -> lista de filas (objetos). Ignora líneas vacías y la cabecera.
export function parseManifest(text) {
  const rows = [];
  let header = null;
  for (const line of String(text || "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = splitLine(line);
    if (!header) { header = cells; continue; }
    const row = {};
    header.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    if (row.id) rows.push(row);
  }
  return rows;
}

// Filas del manifiesto que corresponden a un id de referencia.
export function refsFor(rows, id) {
  return (rows || []).filter((r) => r.id === id);
}

// Errores de coherencia del manifiesto (vacío = todo correcto).
export function validateRefs(rows) {
  const errors = [];
  const ids = new Set();
  for (const r of rows || []) {
    if (!r.id) { errors.push("fila sin id"); continue; }
    if (ids.has(r.id)) errors.push(`id duplicado: ${r.id}`);
    ids.add(r.id);
    if (!REF_LICENSES.includes((r.licencia || "").toUpperCase())) {
      errors.push(`${r.id}: licencia inválida (${r.licencia || "—"})`);
    }
    if (!r.archivo) errors.push(`${r.id}: sin archivo`);
    if (!r.fuente) errors.push(`${r.id}: sin fuente`);
  }
  return errors;
}
