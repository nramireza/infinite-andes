// Interfaz: controles enlazados a la escena + semilla en la URL.

import { seedToInt } from "./rng.js";
import { ASPECT_PRESETS, DEFAULT_ASPECT, ratioFromString } from "./viewport.js";

const WEATHER_LABEL = {
  clear: "despejado", snow: "nieve", rain: "lluvia", fog: "niebla", wind: "viento",
};

export function setupUI(scene, hooks = {}) {
  const $ = (id) => document.getElementById(id);
  const seedInput = $("seedInput");
  const btnGenerate = $("btnGenerate");
  const btnPrev = $("btnPrev");
  const btnNext = $("btnNext");
  const chkAuto = $("chkAuto");
  const speed = $("speed");
  const aspectSel = $("aspectSel");
  const aspectCustom = $("aspectCustom");
  const timeRange = $("timeRange");
  const chkTimeAuto = $("chkTimeAuto");
  const timeLabel = $("timeLabel");
  const weatherSel = $("weatherSel");
  const momentSel = $("momentSel");
  const btnExport = $("btnExport");
  const btnCopy = $("btnCopy");
  const hud = $("hud");
  const panelToggle = $("panelToggle");
  const panel = $("panel");

  let draggingTime = false;
  let aspectLabel = DEFAULT_ASPECT;

  function updateURL() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("seed", seedInput.value);
      url.searchParams.set("hour", scene.hour.toFixed(2));
      url.searchParams.set("weather", weatherSel.value);
      url.searchParams.set("aspect", aspectLabel);
      url.searchParams.set("moment", momentSel.value);
      history.replaceState(null, "", url);
    } catch (_) {}
  }

  function applySeed(raw) {
    const seed = seedToInt(raw);
    scene.regenerate(seed);
    seedInput.value = String(raw);
    updateURL();
  }

  function randomSeed() {
    return String(Math.floor(100000 + Math.random() * 899999));
  }

  btnGenerate.addEventListener("click", () => applySeed(randomSeed()));
  seedInput.addEventListener("change", () => applySeed(seedInput.value));

  btnPrev.addEventListener("click", () => { scene.camera.x -= 90; });
  btnNext.addEventListener("click", () => { scene.camera.x += 90; });
  chkAuto.addEventListener("change", () => { scene.autoScroll = chkAuto.checked; });
  speed.addEventListener("input", () => { scene.scrollSpeed = Number(speed.value); });

  function applyAspectFromControls() {
    const custom = aspectSel.value === "custom";
    aspectCustom.hidden = !custom;
    const raw = custom ? aspectCustom.value : aspectSel.value;
    const ratio = ratioFromString(raw);
    if (!ratio) return;
    aspectLabel = custom ? String(raw).trim() : aspectSel.value;
    hooks.setAspect?.(ratio);
    updateURL();
  }

  aspectSel.addEventListener("change", () => {
    if (aspectSel.value === "custom") {
      aspectCustom.hidden = false;
      if (!aspectCustom.value) return;
    } else {
      aspectCustom.hidden = true;
    }
    applyAspectFromControls();
  });
  aspectCustom.addEventListener("change", applyAspectFromControls);

  timeRange.addEventListener("input", () => {
    draggingTime = true;
    scene.timeAuto = false;
    chkTimeAuto.checked = false;
    scene.hour = Number(timeRange.value) / 60;
  });
  timeRange.addEventListener("change", () => { draggingTime = false; updateURL(); });
  chkTimeAuto.addEventListener("change", () => { scene.timeAuto = chkTimeAuto.checked; updateURL(); });

  weatherSel.addEventListener("change", () => { scene.setWeatherType(weatherSel.value); updateURL(); });
  momentSel.addEventListener("change", () => { scene.setMoment(momentSel.value); updateURL(); });
  btnExport.addEventListener("click", () => scene.exportPNG());
  btnCopy.addEventListener("click", async () => {
    updateURL();
    const prev = btnCopy.textContent;
    try {
      await navigator.clipboard.writeText(window.location.href);
      btnCopy.textContent = "✓";
    } catch (_) {
      btnCopy.textContent = "!";
    }
    setTimeout(() => { btnCopy.textContent = prev; }, 1200);
  });

  panelToggle.addEventListener("click", () => panel.classList.toggle("open"));

  function updateHUD() {
    const h = Math.floor(scene.hour);
    const m = Math.floor((scene.hour % 1) * 60);
    const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    timeLabel.textContent = label;
    if (!draggingTime) timeRange.value = String(Math.round(scene.hour * 60));
    hud.textContent = `seed ${scene.seed} · x ${Math.round(scene.camera.x)} · ${label} · ${WEATHER_LABEL[scene.weather.type] || scene.weather.type}`;
  }

  // Estado inicial desde la URL
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("seed") || "andes";
  applySeed(initial);

  const hourParam = parseFloat(params.get("hour"));
  if (Number.isFinite(hourParam)) {
    scene.hour = ((hourParam % 24) + 24) % 24;
    scene.timeAuto = false;
  }
  const weatherParam = params.get("weather");
  if (weatherParam && weatherParam in WEATHER_LABEL) {
    scene.setWeatherType(weatherParam);
    weatherSel.value = weatherParam;
  }

  const momentParam = params.get("moment");
  if (momentParam && [...momentSel.options].some((o) => o.value === momentParam)) {
    scene.setMoment(momentParam);
    momentSel.value = momentParam;
  }

  // Relación de aspecto: sincroniza los controles con lo ya aplicado en main.js.
  const aspectParam = params.get("aspect");
  if (aspectParam) {
    const ratio = ratioFromString(aspectParam);
    const preset = ASPECT_PRESETS.find((p) => p.ratio === ratio);
    if (preset) {
      aspectSel.value = preset.id;
      aspectLabel = preset.id;
    } else if (ratio) {
      aspectSel.value = "custom";
      aspectCustom.value = aspectParam;
      aspectCustom.hidden = false;
      aspectLabel = aspectParam;
    }
  } else {
    aspectSel.value = DEFAULT_ASPECT;
  }

  chkAuto.checked = scene.autoScroll;
  chkTimeAuto.checked = scene.timeAuto;
  speed.value = String(scene.scrollSpeed);

  // Modo kiosco: sin panel ni botón.
  if (params.get("ui") === "0") {
    document.body.classList.add("kiosk");
    panel.classList.remove("open");
  }

  return { updateHUD };
}
