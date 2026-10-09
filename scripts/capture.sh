#!/usr/bin/env bash
# Capturas versionadas del paisaje con Chrome headless.
# Uso: npm run shots   (PORT=8010 por defecto; CHROME=... para forzar el binario)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-8010}"
ASPECT="${ASPECT:-32:9}"
CHROME="${CHROME:-}"
if [ -z "$CHROME" ]; then
  for c in google-chrome-stable chromium chromium-browser google-chrome; do
    if command -v "$c" >/dev/null 2>&1; then CHROME="$c"; break; fi
  done
fi
if [ -z "$CHROME" ]; then
  echo "No se encontró Chrome. Define CHROME=/ruta/al/binario." >&2
  exit 1
fi

VERSION="$(node -p "require('./package.json').version")"
GIT="$(git rev-parse --short HEAD 2>/dev/null || true)"
SUFFIX="${GIT:-$(date +%Y-%m-%d)}"
TAG="v${VERSION}-${SUFFIX}"
SHOTROOT="$ROOT/screenshots"
OUTDIR="$SHOTROOT/$TAG"

# matriz: seed|hour|weather[|biome[|bloom[|season]]]
MATRIX=(
  "andes|6.7|clear"
  "andes|12|clear"
  "andes|18.2|clear"
  "andes|23|clear"
  "pewen|6.7|clear"
  "pewen|12|clear"
  "pewen|18.2|clear"
  "pewen|23|clear"
  "andes|12|snow"
  "andes|12|rain"
  "andes|12|fog"
  "andes|12|wind"
  "andes|12|storm"
  "andes|12|clear|norte"
  "andes|12|clear|sur"
  "andes|12|clear|norte|on"
  "andes|12|clear|auto"
  "andes|12|clear|||otono"
  "andes|12|clear|||invierno"
  "andes|12|clear|||primavera"
)

mkdir -p "$OUTDIR"

# Tamaño de ventana acorde a la relación (ancho fijo 1280, alto = 1280·b/a).
WINSIZE="$(ASPECT="$ASPECT" node -e '
const [a, b] = String(process.env.ASPECT || "32:9").split(/[:xX/]/).map(Number);
const h = a > 0 && b > 0 ? Math.round(1280 * b / a) : 720;
process.stdout.write(`1280,${h}`);
')"

echo "Servidor en :$PORT (raíz $ROOT) · aspecto $ASPECT ($WINSIZE)"
python3 -m http.server "$PORT" --directory "$ROOT" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 50); do
  if curl -sf -o /dev/null "http://localhost:$PORT/index.html"; then break; fi
  sleep 0.1
done

echo "Capturando $TAG ($CHROME)"
for entry in "${MATRIX[@]}"; do
  IFS='|' read -r seed hour weather biome bloom season <<< "$entry"
  suffix=""
  [ -n "${biome:-}" ] && suffix="${suffix}_${biome}"
  [ -n "${bloom:-}" ] && suffix="${suffix}_${bloom}"
  [ -n "${season:-}" ] && suffix="${suffix}_${season}"
  out="$OUTDIR/${seed}_h${hour}_${weather}${suffix}.png"
  url="http://localhost:${PORT}/?seed=${seed}&hour=${hour}&weather=${weather}&aspect=${ASPECT}"
  [ -n "${biome:-}" ] && url="${url}&biome=${biome}"
  [ -n "${bloom:-}" ] && url="${url}&bloom=${bloom}"
  [ -n "${season:-}" ] && url="${url}&season=${season}"
  "$CHROME" --headless=new --disable-gpu --no-sandbox \
    --window-size="$WINSIZE" --virtual-time-budget=2500 \
    --screenshot="$out" "$url" >/dev/null 2>&1
  echo "  -> $(basename "$out")"
done

# hoja de contactos (excluyendo la propia hoja)
if command -v montage >/dev/null 2>&1; then
  files=()
  for f in "$OUTDIR"/*.png; do
    [ "$(basename "$f")" = "contact-sheet.png" ] && continue
    files+=("$f")
  done
  montage "${files[@]}" -tile 3x -geometry 640x360+4+4 \
    -background '#111111' "$OUTDIR/contact-sheet.png"
  echo "  -> contact-sheet.png"
fi

# manifest de la tanda
MATRIX_STR="$(printf '%s\n' "${MATRIX[@]}")"
MATRIX_STR="$MATRIX_STR" VERSION="$VERSION" TAG="$TAG" CHROME="$CHROME" \
GIT="$GIT" ASPECT="$ASPECT" OUTDIR="$OUTDIR" node -e '
const fs = require("fs");
const shots = (process.env.MATRIX_STR || "").split("\n").filter(Boolean).map((s) => {
  const [seed, hour, weather, biome, bloom, season] = s.split("|");
  let suffix = "";
  if (biome) suffix += `_${biome}`;
  if (bloom) suffix += `_${bloom}`;
  if (season) suffix += `_${season}`;
  return { seed, hour, weather, biome: biome || null, bloom: bloom || null, season: season || null, file: `${seed}_h${hour}_${weather}${suffix}.png` };
});
const manifest = {
  version: process.env.VERSION,
  tag: process.env.TAG,
  generatedAt: new Date().toISOString(),
  aspect: process.env.ASPECT || null,
  chrome: process.env.CHROME,
  git: process.env.GIT || null,
  shots,
};
fs.writeFileSync(process.env.OUTDIR + "/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
'
echo "  -> manifest.json"

# índice de versiones capturadas
SHOTROOT="$SHOTROOT" node -e '
const fs = require("fs");
const path = require("path");
const root = process.env.SHOTROOT;
const dirs = fs.readdirSync(root)
  .filter((d) => d.startsWith("v") && fs.statSync(path.join(root, d)).isDirectory())
  .sort();
const rows = [];
for (const d of dirs) {
  const mf = path.join(root, d, "manifest.json");
  if (!fs.existsSync(mf)) continue;
  const m = JSON.parse(fs.readFileSync(mf, "utf8"));
  rows.push({
    tag: m.tag || d,
    date: (m.generatedAt || "").slice(0, 10),
    count: (m.shots || []).length,
    git: m.git || "—",
  });
}
let out = "# Capturas\n\n";
out += "Generadas con `npm run shots`. Cada carpeta es una versión (versión + hash de git o fecha).\n\n";
out += "| Versión | Fecha | Capturas | Git | Carpeta |\n|---|---|---|---|---|\n";
for (const r of rows) out += `| ${r.tag} | ${r.date} | ${r.count} | ${r.git} | \`${r.tag}/\` |\n`;
out += "\nCada carpeta incluye `manifest.json` (metadatos) y `contact-sheet.png` (todas juntas).\n";
fs.writeFileSync(path.join(root, "README.md"), out);
'
echo "Listo: screenshots/$TAG"
