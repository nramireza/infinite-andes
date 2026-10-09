// Arranque: dimensiona el canvas, crea la escena y corre el loop.

import { Scene } from "./scene.js";
import { seedToInt } from "./rng.js";
import { setupUI } from "./ui.js";
import { BASE_H, DEFAULT_ASPECT, ratioFromString, widthForRatio } from "./viewport.js";
import { clampDt, shouldDraw, effectiveFps, canRender } from "./loop.js";

const canvas = document.getElementById("scene");
const params = new URLSearchParams(window.location.search);

const initialRatio = ratioFromString(params.get("aspect")) || ratioFromString(DEFAULT_ASPECT);
canvas.width = widthForRatio(initialRatio);
canvas.height = BASE_H;

// Ajuste a pantalla: `cover` llena (recorta), `contain` encaja entero (defecto wallpaper).
const fitMode = (params.get("fit") || "cover").toLowerCase() === "contain" ? "contain" : "cover";

function fit() {
  const W = canvas.width;
  const H = canvas.height;
  const availW = window.innerWidth;
  const availH = window.innerHeight;
  let s;
  if (fitMode === "contain") {
    s = Math.min(availW / W, availH / H);
    if (s >= 1) s = Math.floor(s);
  } else {
    s = Math.max(availW / W, availH / H);
  }
  canvas.style.width = Math.round(W * s) + "px";
  canvas.style.height = Math.round(H * s) + "px";
}
fit();
window.addEventListener("resize", fit);

const seed = seedToInt(params.get("seed") || "andes");
const scene = new Scene(canvas, seed);

// Latitud del sol (por defecto Chile central, ajustable con ?lat=).
const latParam = parseFloat(params.get("lat"));
if (Number.isFinite(latParam)) scene.lat = latParam;

// Fondo de pantalla: menos potencia y respeto por "reduced motion".
const fpsParam = params.get("fps");
const targetFps = fpsParam === null ? 30 : Number(fpsParam);
const baseFps = Number.isFinite(targetFps) && targetFps >= 0 ? targetFps : 30;
const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
if (prefersReduced) {
  scene.autoScroll = false;
  scene.timeAuto = false;
}

// Overlay de rendimiento opcional (?perf=1).
const perfEl = params.get("perf") === "1" ? document.createElement("pre") : null;
if (perfEl) {
  perfEl.style.cssText = "position:fixed;top:8px;right:8px;z-index:30;margin:0;padding:4px 6px;" +
    "font:11px/1.3 monospace;color:#9fe3ff;background:rgba(8,14,24,.7);pointer-events:none;white-space:pre";
  document.body.appendChild(perfEl);
}

function setAspect(ratio) {
  canvas.width = widthForRatio(ratio);
  canvas.height = BASE_H;
  scene.resize(canvas.width, canvas.height);
  canvas.getContext("2d").imageSmoothingEnabled = false;
  fit();
  // El redimensionado limpia el canvas; repinta de inmediato para no quedar en
  // negro si el loop está pausado (sin foco / pestaña oculta).
  scene.render();
}

const ui = setupUI(scene, { setAspect });

// Pausa al ocultar la pestaña o al perder el foco de la ventana. El primer
// fotograma se pinta siempre (aunque no haya foco) para no quedar en negro.
let running = !document.hidden;
let focused = true;
let painted = false;
let lastDraw = performance.now();
function resume() {
  running = !document.hidden;
  if (running && focused) lastDraw = performance.now(); // evita un salto al volver
}
document.addEventListener("visibilitychange", resume);
window.addEventListener("focus", () => { focused = true; resume(); });
window.addEventListener("blur", () => { focused = false; });

// Si el loop falla, se muestra el error en pantalla (no un negro silencioso).
let errorEl = null;
function showError(err) {
  if (errorEl) return;
  errorEl = document.createElement("pre");
  errorEl.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:40;max-width:min(680px,90vw);margin:0;" +
    "padding:8px 10px;font:11px/1.35 monospace;color:#ffb4b4;background:rgba(30,6,10,.92);" +
    "border:1px solid #7a2b2b;border-radius:4px;white-space:pre-wrap;pointer-events:none";
  errorEl.textContent = "Infinite Andes · error en el render\n" + (err?.stack || err);
  document.body.appendChild(errorEl);
}

let loopFailed = false;
let perfAcc = 0;
let perfFrames = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (!canRender({ painted, running, focused })) return;
  const w = scene.weather;
  const weatherActive = (w.type !== "clear" && w.strength > 0.01) ||
    (w.prevType != null && w.prevStrength > 0.01);
  const fps = effectiveFps(baseFps, { scrolling: scene.autoScroll, weather: weatherActive });
  if (!shouldDraw(now, lastDraw, fps)) return;
  const dt = clampDt((now - lastDraw) / 1000);
  lastDraw = now;
  const t0 = perfEl ? performance.now() : 0;
  try {
    scene.update(dt);
    scene.render();
    ui.updateHUD();
    painted = true;
  } catch (err) {
    if (!loopFailed) {
      console.error("Error en el loop de render (se continúa):", err);
      showError(err);
      loopFailed = true;
    }
  }
  if (perfEl) {
    perfAcc += performance.now() - t0;
    perfFrames++;
    if (perfFrames >= 20) {
      perfEl.textContent = `${(perfAcc / perfFrames).toFixed(2)} ms/frame\n${fps ? Math.round(1000 / fps) : "∞"} fps objetivo`;
      perfAcc = 0;
      perfFrames = 0;
    }
  }
}
requestAnimationFrame(frame);
