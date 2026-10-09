// Arranque: dimensiona el canvas, crea la escena y corre el loop.

import { Scene } from "./scene.js";
import { seedToInt } from "./rng.js";
import { setupUI } from "./ui.js";
import { BASE_H, DEFAULT_ASPECT, ratioFromString, widthForRatio } from "./viewport.js";
import { clampDt, shouldDraw, effectiveFps } from "./loop.js";

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
}

const ui = setupUI(scene, { setAspect });

// Pausa al ocultar la pestaña o al perder el foco de la ventana.
let running = !document.hidden;
let focused = true;
let lastDraw = performance.now();
function resume() {
  running = !document.hidden;
  if (running && focused) lastDraw = performance.now(); // evita un salto al volver
}
document.addEventListener("visibilitychange", resume);
window.addEventListener("focus", () => { focused = true; resume(); });
window.addEventListener("blur", () => { focused = false; });

let loopFailed = false;
let perfAcc = 0;
let perfFrames = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (!running || !focused) return;
  const weatherActive = scene.weather.type !== "clear" && scene.weather.strength > 0.01;
  const fps = effectiveFps(baseFps, { scrolling: scene.autoScroll, weather: weatherActive });
  if (!shouldDraw(now, lastDraw, fps)) return;
  const dt = clampDt((now - lastDraw) / 1000);
  lastDraw = now;
  const t0 = perfEl ? performance.now() : 0;
  try {
    scene.update(dt);
    scene.render();
    ui.updateHUD();
  } catch (err) {
    if (!loopFailed) {
      console.error("Error en el loop de render (se continúa):", err);
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
