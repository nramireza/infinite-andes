// Interfaz: controles enlazados a la escena + semilla en la URL.

import { seedToInt } from "./rng.js";
import { ASPECT_PRESETS, DEFAULT_ASPECT, ratioFromString } from "./viewport.js";
import { addView, decodeView, encodeView, parseViews, removeView } from "./views.js";

const VIEWS_STORAGE_KEY = "infinite-andes:views";

const WEATHER_LABEL = {
  clear: "despejado", snow: "nieve", rain: "lluvia", fog: "niebla", wind: "viento",
};

const BIOME_LABEL = {
  auto: "procedural", norte: "norte", centro: "centro", sur: "sur",
};

const SEASON_LABEL = {
  auto: "auto", verano: "verano", otono: "otoño", invierno: "invierno", primavera: "primavera",
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
  const seasonSel = $("seasonSel");
  const biomeSel = $("biomeSel");
  const bloomSel = $("bloomSel");
  const btnExport = $("btnExport");
  const btnCopy = $("btnCopy");
  const viewSel = $("viewSel");
  const viewName = $("viewName");
  const btnSaveView = $("btnSaveView");
  const btnDelView = $("btnDelView");
  const hud = $("hud");
  const panelToggle = $("panelToggle");
  const panel = $("panel");

  let draggingTime = false;
  let aspectLabel = DEFAULT_ASPECT;
  let views = loadViews();

  // Estado actual como "view" (mismos campos que la URL/favorito).
  function currentView() {
    return {
      seed: seedInput.value,
      x: Math.round(scene.camera.x),
      hour: scene.hour,
      weather: weatherSel.value,
      aspect: aspectLabel,
      moment: momentSel.value,
      season: seasonSel.value,
      biome: biomeSel.value,
      bloom: bloomSel.value,
    };
  }

  function updateURL() {
    try {
      const url = new URL(window.location.href);
      const view = currentView();
      // Con auto-scroll activo no se ancla la posición: el enlace sigue fluyendo.
      if (scene.autoScroll) delete view.x;
      url.search = encodeView(view);
      history.replaceState(null, "", url);
    } catch (_) {}
  }

  function loadViews() {
    try {
      return parseViews(localStorage.getItem(VIEWS_STORAGE_KEY));
    } catch (_) {
      return [];
    }
  }

  function storeViews(list) {
    try {
      localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  function populateViewSelect(selected) {
    viewSel.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "— sin vistas —";
    viewSel.appendChild(none);
    for (const v of views) {
      const opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = v.name;
      viewSel.appendChild(opt);
    }
    viewSel.value = selected && views.some((v) => v.name === selected) ? selected : "";
  }

  function applyAspectParam(aspect) {
    const ratio = ratioFromString(aspect);
    if (!ratio) return;
    const preset = ASPECT_PRESETS.find((p) => p.ratio === ratio);
    if (preset) {
      aspectSel.value = preset.id;
      aspectLabel = preset.id;
      aspectCustom.hidden = true;
    } else {
      aspectSel.value = "custom";
      aspectCustom.value = aspect;
      aspectCustom.hidden = false;
      aspectLabel = String(aspect).trim();
    }
    hooks.setAspect?.(ratio);
  }

  // Aplica un "view" a la escena y sincroniza los controles.
  function applyView(view) {
    if (view.seed != null) {
      scene.regenerate(seedToInt(view.seed));
      seedInput.value = String(view.seed);
    }
    if (Number.isFinite(view.x)) {
      scene.camera.x = view.x;
      scene.autoScroll = false;
      chkAuto.checked = false;
    }
    if (Number.isFinite(view.hour)) {
      scene.hour = view.hour;
      scene.timeAuto = false;
      chkTimeAuto.checked = false;
    }
    if (view.weather) { scene.setWeatherType(view.weather); weatherSel.value = view.weather; }
    if (view.moment) { scene.setMoment(view.moment); momentSel.value = view.moment; }
    if (view.season) { scene.setSeason(view.season); seasonSel.value = view.season; }
    if (view.biome) { scene.setBiome(view.biome); biomeSel.value = view.biome; }
    if (view.bloom) { scene.setBloom(view.bloom); bloomSel.value = view.bloom; }
    if (view.aspect) applyAspectParam(view.aspect);
    updateURL();
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
  chkAuto.addEventListener("change", () => { scene.autoScroll = chkAuto.checked; updateURL(); });
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
  seasonSel.addEventListener("change", () => { scene.setSeason(seasonSel.value); updateURL(); });
  biomeSel.addEventListener("change", () => { scene.setBiome(biomeSel.value); updateURL(); });
  bloomSel.addEventListener("change", () => { scene.setBloom(bloomSel.value); updateURL(); });

  function saveCurrentView() {
    const name = (viewName.value || "").trim();
    if (!name) { viewName.focus(); return; }
    views = addView(views, currentView(), name);
    storeViews(views);
    viewName.value = "";
    populateViewSelect(name);
  }
  btnSaveView.addEventListener("click", saveCurrentView);
  viewName.addEventListener("keydown", (e) => { if (e.key === "Enter") saveCurrentView(); });
  btnDelView.addEventListener("click", () => {
    if (!viewSel.value) return;
    views = removeView(views, viewSel.value);
    storeViews(views);
    populateViewSelect("");
  });
  viewSel.addEventListener("change", () => {
    const v = views.find((x) => x.name === viewSel.value);
    if (v) applyView(decodeView(v.query));
  });

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
    const weather = WEATHER_LABEL[scene.weather.type] || scene.weather.type;
    const biome = BIOME_LABEL[scene.biomeMode] || scene.biomeMode;
    const season = SEASON_LABEL[scene.season] || scene.season;
    hud.textContent = `seed ${scene.seed} · x ${Math.round(scene.camera.x)} · ${label} · ${weather} · ${season} · ${biome}`;
  }

  // Estado inicial desde la URL (mismo camino que cargar un favorito).
  const params = new URLSearchParams(window.location.search);
  const initialView = decodeView(params);
  applyView({ ...initialView, seed: initialView.seed || "andes" });
  if (!initialView.aspect) aspectSel.value = DEFAULT_ASPECT;

  chkAuto.checked = scene.autoScroll;
  chkTimeAuto.checked = scene.timeAuto;
  speed.value = String(scene.scrollSpeed);
  populateViewSelect("");

  // Modo kiosco: sin panel ni botón.
  if (params.get("ui") === "0") {
    document.body.classList.add("kiosk");
    panel.classList.remove("open");
  }

  return { updateHUD };
}
