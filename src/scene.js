// Composición de la escena: cámara, parallax, ciclo día/noche y clima.

import { getPalette, lerpPalettes, nightAmount, applyBiome } from "./palette.js";
import { Sky } from "./sky.js";
import { Weather } from "./weather.js";
import { LAYERS, drawLayer, drawSea, seedLayers, setBiomeGeometry, clearColumnCaches } from "./terrain.js";
import { placeFlora } from "./flora.js";
import { placeFauna } from "./fauna.js";
import { momentSky, momentGround } from "./moments.js";
import { biomeAt, biomeGeometry, modeWeights, biomeFloraPool, biomeFaunaPool, resolveBloom, bloomChanceMul } from "./biomes.js";
import { seasonState, seasonSnowShift, applySeason, pickSeasonWeather, seasonGlowTint, SEASON_DURATION, SEASON_STRENGTH } from "./seasons.js";
import { localHour, dayOfYear, seasonPhaseForDate, moonPhaseForDate, moonPhaseFromDays } from "./clock.js";
import { solarTimes, solarClock } from "./sun.js";

export class Scene {
  constructor(canvas, seed) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.W = canvas.width;
    this.H = canvas.height;
    this.ctx.imageSmoothingEnabled = false;

    this.seed = seed;
    seedLayers(seed);
    setBiomeGeometry((wx) => {
      const g = biomeGeometry(modeWeights(this.biomeMode, wx, this.seed));
      g.snowShift += seasonSnowShift(this.seasonState());
      return g;
    });
    this.sky = new Sky(seed);
    this.weather = new Weather(this.W, this.H);

    this.camera = { x: 0 };
    this.autoScroll = true;
    this.scrollSpeed = 30;

    this.hour = 8;
    this.timeAuto = true;
    this.timeSpeed = 0.125; // horas por segundo (ciclo 0.5x)

    // Reloj real: hora y estación del dispositivo; sol de Chile central.
    this.clock = "real";
    this.lat = -33.45;
    this.longitude = -70.66;
    this._solarDoy = null;
    this._solar = null;

    this.weatherAuto = true;
    this.weatherTimer = 12;

    this.moment = "auto";
    this.biomeMode = "auto";
    this.bloomMode = "auto";
    this.season = "auto";
    this.seasonPhase = 0;
    this.seasonSpeed = 1 / SEASON_DURATION; // estaciones por segundo
    this.dayNum = 0; // días simulados en reloj rápido (fase lunar)
    this.tSec = 0;

    // Memo de la paleta compuesta (cambia lento: hora/clima/estación/bioma).
    this._pal = { key: "", value: null };
  }

  regenerate(seed) {
    this.seed = seed;
    seedLayers(seed);
    this.sky = new Sky(seed);
    this.camera.x = 0;
    this.weather.setImmediate("clear", this.W, this.H);
    this.weatherTimer = 12;
  }

  // Cambia el tamaño interno del lienzo (relación de aspecto). El cielo guarda
  // posiciones normalizadas y se dibuja con W/H de cada fotograma; el clima
  // rehace sus partículas al nuevo tamaño.
  resize(W, H) {
    this.W = W;
    this.H = H;
    this.weather.resize(W, H);
  }

  setWeatherType(type) {
    if (type === "auto") {
      this.weatherAuto = true;
      this.weatherTimer = 0.5;
      return;
    }
    this.weatherAuto = false;
    this.weather.setImmediate(type, this.W, this.H);
  }

  setMoment(mode) {
    this.moment = mode || "auto";
  }

  setBiome(mode) {
    const m = mode || "auto";
    if (m !== this.biomeMode) clearColumnCaches(); // la geometría por bioma entra en el cache
    this.biomeMode = m;
  }

  setBloom(mode) {
    this.bloomMode = mode || "auto";
  }

  setSeason(mode) {
    this.season = mode || "auto";
  }

  setClock(mode) {
    this.clock = mode === "fast" ? "fast" : "real";
  }

  // Amanecer/atardecer del día (cacheado por día del año y parámetros solares).
  solar() {
    const doy = dayOfYear(new Date());
    const key = `${doy}:${this.lat}:${this.longitude}`;
    if (this._solarDoy !== key) {
      this._solarDoy = key;
      const tz = -new Date().getTimezoneOffset() / 60;
      this._solar = solarTimes(doy, this.lat, this.longitude, tz);
    }
    return this._solar;
  }

  // Hora con la que se consulta la paleta/cielo (real: reasignada al sol de Chile).
  paletteHour() {
    if (this.clock !== "real") return this.hour;
    const s = this.solar();
    return s ? solarClock(this.hour, s.rise, s.set) : this.hour;
  }

  // Estado de la estación actual (índice, siguiente y mezcla).
  seasonState() {
    return seasonState(this.seasonPhase, this.season);
  }

  // Fase lunar (0 nueva, 0.5 llena): fecha real o días simulados en reloj rápido.
  moonPhase() {
    if (this.clock !== "real") return moonPhaseFromDays(this.dayNum);
    const now = new Date();
    return moonPhaseForDate(now.getFullYear(), dayOfYear(now));
  }

  // Contexto de bioma en una posición de mundo (tinte, pools y floración).
  biomeAt(worldX) {
    return biomeAt(worldX, this.seed, this.biomeMode);
  }

  bloomValue(b) {
    return resolveBloom(this.bloomMode, b);
  }

  floraPoolAt(layer, wx) {
    const b = this.biomeAt(wx);
    return biomeFloraPool(layer.name, b.weights, this.bloomValue(b), layer.flora?.types);
  }

  faunaPoolAt(layer, wx) {
    const b = this.biomeAt(wx);
    return biomeFaunaPool(layer.name, b.weights, this.bloomValue(b), layer.fauna?.species);
  }

  faunaChanceAt(wx) {
    return bloomChanceMul(this.bloomValue(this.biomeAt(wx)));
  }

  update(dt) {
    this.tSec += dt;

    if (this.autoScroll) this.camera.x += this.scrollSpeed * dt;

    if (this.clock === "real") {
      const now = new Date();
      this.hour = localHour(now);
      if (this.season === "auto") this.seasonPhase = seasonPhaseForDate(now);
    } else {
      if (this.timeAuto) {
        this.hour += this.timeSpeed * dt;
        if (this.hour >= 24) { this.hour -= 24; this.dayNum++; }
      }
      if (this.season === "auto") {
        this.seasonPhase = (this.seasonPhase + this.seasonSpeed * dt) % 4;
      }
    }

    if (this.weatherAuto) {
      this.weatherTimer -= dt;
      if (this.weatherTimer <= 0) {
        let pick = pickSeasonWeather(this.seasonState(), Math.random);
        if (pick === this.weather.type) pick = pick === "clear" ? "wind" : "clear";
        this.weather.request(pick);
        this.weatherTimer = 30 + Math.random() * 30;
      }
    }

    this.weather.update(dt);
  }

  render() {
    const ctx = this.ctx;
    const { W, H } = this;
    const palHour = this.paletteHour();
    const nightAmt = nightAmount(palHour);
    const season = this.seasonState();
    const centerX = this.camera.x + W * 0.5;
    const biome = this.biomeAt(centerX);
    const bloom = this.bloomValue(biome);
    // Paleta compuesta memoizada: se rehace solo cuando cambian sus entradas.
    // Con crossfade entran en la clave también el clima saliente y su fuerza.
    const w = this.weather;
    const palKey = `${Math.round(palHour * 256)}|${w.type}|${Math.round(w.strength * 16)}` +
      `|${w.prevType || ""}|${Math.round(w.prevStrength * 16)}` +
      `|${season.index}|${season.next}|${Math.round(season.t * 16)}|${this.biomeMode}|${Math.round(centerX)}`;
    let pal;
    if (this._pal.key === palKey) {
      pal = this._pal.value;
    } else {
      // Orden: hora → clima (en getPalette) → estación → bioma (manda en lo regional).
      pal = getPalette(palHour, w.type, w.strength);
      if (w.prevType) {
        const prevPal = getPalette(palHour, w.prevType, w.prevStrength);
        const total = w.strength + w.prevStrength;
        const k = total < 0.001 ? 1 : w.strength / total;
        pal = lerpPalettes(prevPal, pal, k);
      }
      pal = applySeason(pal, season, SEASON_STRENGTH * (1 - 0.85 * nightAmt));
      // El tinte del bioma y el rubor de la floración también se atenúan de
      // noche (mismo factor que la estación): si no, el norte queda "de día".
      const nightBiome = 1 - 0.85 * nightAmt;
      pal = applyBiome(pal, biome.tint, biome.amount * nightBiome, bloom * nightBiome);
      this._pal = { key: palKey, value: pal };
    }
    const solar = this.clock === "real" ? this.solar() : null;
    const moon = this.moonPhase();
    const cel = this.sky.celestial(this.hour, W, H, solar?.rise, solar?.set, moon);
    const glowTint = seasonGlowTint(season);
    const moonDim = cel && !cel.isSun && cel.visible ? cel.illum : 0;

    ctx.clearRect(0, 0, W, H);
    this.sky.draw(ctx, W, H, pal, nightAmt, this.tSec, cel, glowTint, moonDim);

    // Astro al fondo y nubes por delante de él (lo tapan); el terreno tapa a las nubes.
    this.sky.drawBody(ctx, cel, pal);
    this.sky.drawClouds(ctx, W, pal, this.camera, this.tSec);
    momentSky(ctx, pal, this.camera, W, H, this.seed, this.tSec, this.moment);

    // Rayo de tormenta por delante del cielo y detrás del terreno.
    this.weather.drawLightning(ctx, W, H, pal);

    // Capas de atrás hacia adelante.
    for (const layer of LAYERS) {
      if (layer.sea) {
        drawSea(ctx, pal, this.camera, W, H, this.tSec, cel, this.weather.effectiveWind());
      } else {
        drawLayer(ctx, layer, pal, this.camera, W, H);
        placeFlora(ctx, layer, pal, this.camera, W, H, this.seed, this.tSec,
          (wx) => this.floraPoolAt(layer, wx), season.index, nightAmt);
      }
      placeFauna(ctx, layer, pal, this.camera, W, H, this.seed, this.hour, this.tSec,
        (wx) => this.faunaPoolAt(layer, wx), (wx) => this.faunaChanceAt(wx));
    }

    momentGround(ctx, pal, this.camera, W, H, this.seed, this.tSec, this.moment);

    this.weather.draw(ctx, W, H, pal);
  }

  exportPNG() {
    this.canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const hh = String(Math.floor(this.hour)).padStart(2, "0");
      const mm = String(Math.floor((this.hour % 1) * 60)).padStart(2, "0");
      a.download = `infinite-andes_${this.seed}_${hh}${mm}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  }
}
