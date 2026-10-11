// Reactividad del sistema: convierte la actividad real del equipo en un
// multiplicador global de densidad de fauna. No decide la identidad ni la
// posición de ningún animal (eso sigue siendo determinista por semilla): solo
// pondera la probabilidad de aparición, igual que la hora o la floración.
//
// Es **opt-in** con un switch en el panel (off por defecto). El contrato del
// puente (`?activity=<url>`, ver scripts/activity-bridge.mjs):
//   { "cpu": 0..1, "ram": 0..1, "temp": °C, "load": carga media 1 min }

export const ACTIVITY_MIN = 0.5;
export const ACTIVITY_MAX = 1.8;
export const ACTIVITY_URL_DEFAULT = "http://localhost:8787/activity";
export const ACTIVITY_STORAGE_KEY = "infinite-andes:activity";

// Pesos de cada señal (transparentes y ajustables; ver docs/17).
const WEIGHTS = { cpu: 0.55, ram: 0.25, heat: 0.3, load: 0.2 };
const TEMP_BASE = 55; // °C por debajo de los cuales no hay penalización térmica
const TEMP_SPAN = 45;
const LOAD_SPAN = 4;

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

// Señales -> multiplicador acotado a [ACTIVITY_MIN, ACTIVITY_MAX]. Entradas
// ausentes o corruptas equivalen a "sin actividad": 1 (render actual intacto).
export function activityMultiplier(signals) {
  if (!signals || typeof signals !== "object") return 1;
  const cpu = clamp01(num(signals.cpu, 0));
  const ram = clamp01(num(signals.ram, 0));
  const heat = clamp01((num(signals.temp, TEMP_BASE) - TEMP_BASE) / TEMP_SPAN);
  const load = clamp01(num(signals.load, 0) / LOAD_SPAN);
  const raw = 1 + WEIGHTS.cpu * cpu + WEIGHTS.ram * ram - WEIGHTS.heat * heat - WEIGHTS.load * load;
  return Math.min(ACTIVITY_MAX, Math.max(ACTIVITY_MIN, raw));
}

// Precedencia de la configuración: URL > preferencia guardada > off.
// `param` es el valor de `?activity` (null si no viene); `stored` "1"/"0".
export function activityConfigFrom({ param = null, stored = null } = {}) {
  const off = { enabled: false, url: ACTIVITY_URL_DEFAULT };
  if (param != null) {
    const v = String(param).trim();
    if (v === "off" || v === "0" || v === "false") return off;
    if (v === "" || v === "1" || v === "on" || v === "true") {
      return { enabled: true, url: ACTIVITY_URL_DEFAULT };
    }
    return { enabled: true, url: v }; // URL explícita del puente
  }
  if (stored === "1") return { enabled: true, url: ACTIVITY_URL_DEFAULT };
  return off;
}

// Sondea el puente cada `interval` ms y llama a `onUpdate(mul, ok)`: `ok` es
// false si el endpoint falta o falla (en tal caso `mul` = 1). Devuelve una
// función para detenerlo.
export function startActivityPolling(url, onUpdate, { interval = 5000, timeout = 2500, fetchImpl } = {}) {
  const doFetch = fetchImpl || globalThis.fetch;
  if (!url || typeof doFetch !== "function") {
    onUpdate(1, false);
    return () => {};
  }
  let stopped = false;
  let timer = null;

  async function tick() {
    let mul = 1;
    let ok = false;
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), timeout);
      const res = await doFetch(url, { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(to);
      if (res && res.ok) {
        mul = activityMultiplier(await res.json());
        ok = true;
      }
    } catch (_) {
      mul = 1;
    }
    if (stopped) return;
    onUpdate(mul, ok);
    timer = setTimeout(tick, interval);
  }

  tick();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

// Controlador del switch: enable/disable limpio (al apagar no hay ningún fetch)
// y estado observable `{ enabled, online, mul }` (`online` null hasta el primer
// sondeo). `onUpdate(state)` se llama en cada cambio.
export function createActivityController({ url, onUpdate, interval, timeout, fetchImpl } = {}) {
  let stop = null;
  const state = { enabled: false, online: null, mul: 1 };

  function emit() {
    onUpdate?.({ ...state });
  }

  return {
    enable() {
      if (stop) return;
      state.enabled = true;
      state.online = null;
      state.mul = 1;
      stop = startActivityPolling(
        url,
        (mul, ok) => { state.mul = mul; state.online = ok; emit(); },
        { interval, timeout, fetchImpl }
      );
      emit();
    },
    disable() {
      if (!stop && !state.enabled) return;
      if (stop) stop();
      stop = null;
      state.enabled = false;
      state.online = null;
      state.mul = 1;
      emit();
    },
    isEnabled() {
      return !!stop;
    },
    getState() {
      return { ...state };
    },
    setUrl(next) {
      url = next;
    },
  };
}
