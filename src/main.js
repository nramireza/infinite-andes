// Arranque: dimensiona el canvas, crea la escena y corre el loop.

import { Scene } from "./scene.js";
import { seedToInt } from "./rng.js";
import { setupUI } from "./ui.js";
import { BASE_H, DEFAULT_ASPECT, ratioFromString, widthForRatio } from "./viewport.js";

const canvas = document.getElementById("scene");
const params = new URLSearchParams(window.location.search);

const initialRatio = ratioFromString(params.get("aspect")) || ratioFromString(DEFAULT_ASPECT);
canvas.width = widthForRatio(initialRatio);
canvas.height = BASE_H;

function fit() {
  const W = canvas.width;
  const H = canvas.height;
  const availW = window.innerWidth;
  const availH = window.innerHeight;
  let s = Math.min(availW / W, availH / H);
  if (s >= 1) s = Math.floor(s);
  canvas.style.width = Math.round(W * s) + "px";
  canvas.style.height = Math.round(H * s) + "px";
}
fit();
window.addEventListener("resize", fit);

const seed = seedToInt(params.get("seed") || "andes");
const scene = new Scene(canvas, seed);

function setAspect(ratio) {
  canvas.width = widthForRatio(ratio);
  canvas.height = BASE_H;
  scene.resize(canvas.width, canvas.height);
  canvas.getContext("2d").imageSmoothingEnabled = false;
  fit();
}

const ui = setupUI(scene, { setAspect });

let last = performance.now();
let loopFailed = false;
function frame(now) {
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
  last = now;
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
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
