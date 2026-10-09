// Arranque: dimensiona el canvas, crea la escena y corre el loop.

import { Scene } from "./scene.js";
import { seedToInt } from "./rng.js";
import { setupUI } from "./ui.js";
import { BASE_H, DEFAULT_ASPECT, ratioFromString, widthForRatio } from "./viewport.js";
import { clampDt, shouldDraw } from "./loop.js";

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
const fps = Number.isFinite(targetFps) && targetFps >= 0 ? targetFps : 30;
const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
if (prefersReduced) {
  scene.autoScroll = false;
  scene.timeAuto = false;
}

function setAspect(ratio) {
  canvas.width = widthForRatio(ratio);
  canvas.height = BASE_H;
  scene.resize(canvas.width, canvas.height);
  canvas.getContext("2d").imageSmoothingEnabled = false;
  fit();
}

const ui = setupUI(scene, { setAspect });

let running = !document.hidden;
let lastDraw = performance.now();
document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  if (running) lastDraw = performance.now(); // evita un salto al volver
});

let loopFailed = false;
function frame(now) {
  requestAnimationFrame(frame);
  if (!running || !shouldDraw(now, lastDraw, fps)) return;
  const dt = clampDt((now - lastDraw) / 1000);
  lastDraw = now;
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
}
requestAnimationFrame(frame);
