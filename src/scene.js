// Composición de la escena: cámara, parallax, ciclo día/noche y clima.

import { getPalette, nightAmount, applyBiome } from "./palette.js";
import { Sky } from "./sky.js";
import { Weather } from "./weather.js";
import { LAYERS, drawLayer, drawSea, seedLayers, setBiomeGeometry } from "./terrain.js";
import { placeFlora } from "./flora.js";
import { placeFauna } from "./fauna.js";
import { momentSky, momentGround } from "./moments.js";
import { biomeAt, biomeGeometry, modeWeights, biomeFloraPool, biomeFaunaPool, resolveBloom, bloomChanceMul } from "./biomes.js";
import { seasonState, seasonSnowShift, applySeason, pickSeasonWeather, SEASON_DURATION, SEASON_STRENGTH } from "./seasons.js";

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

    this.weatherAuto = true;
    this.weatherTimer = 12;

    this.moment = "auto";
    this.biomeMode = "auto";
    this.bloomMode = "auto";
    this.season = "auto";
    this.seasonPhase = 0;
    this.seasonSpeed = 1 / SEASON_DURATION; // estaciones por segundo
    this.tSec = 0;
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
    this.biomeMode = mode || "auto";
  }

  setBloom(mode) {
    this.bloomMode = mode || "auto";
  }

  setSeason(mode) {
    this.season = mode || "auto";
  }

  // Estado de la estación actual (índice, siguiente y mezcla).
  seasonState() {
    return seasonState(this.seasonPhase, this.season);
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

    if (this.timeAuto) {
      this.hour += this.timeSpeed * dt;
      if (this.hour >= 24) this.hour -= 24;
    }

    if (this.season === "auto") {
      this.seasonPhase = (this.seasonPhase + this.seasonSpeed * dt) % 4;
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
    const nightAmt = nightAmount(this.hour);
    const season = this.seasonState();
    const biome = this.biomeAt(this.camera.x + W * 0.5);
    const bloom = this.bloomValue(biome);
    // Orden: hora → clima (en getPalette) → estación → bioma (manda en lo regional).
    let pal = getPalette(this.hour, this.weather.type, this.weather.strength);
    pal = applySeason(pal, season, SEASON_STRENGTH * (1 - 0.85 * nightAmt));
    pal = applyBiome(pal, biome.tint, biome.amount, bloom);
    const cel = this.sky.celestial(this.hour, W, H);

    ctx.clearRect(0, 0, W, H);
    this.sky.draw(ctx, W, H, pal, nightAmt, this.tSec, cel);

    // Astro al fondo y nubes por delante de él (lo tapan); el terreno tapa a las nubes.
    this.sky.drawBody(ctx, cel, pal);
    this.sky.drawClouds(ctx, W, pal, this.camera, this.tSec);
    momentSky(ctx, pal, this.camera, W, H, this.seed, this.tSec, this.moment);

    // Capas de atrás hacia adelante.
    for (const layer of LAYERS) {
      if (layer.sea) {
        drawSea(ctx, pal, this.camera, W, H, this.tSec, cel);
      } else {
        drawLayer(ctx, layer, pal, this.camera, W, H);
        placeFlora(ctx, layer, pal, this.camera, W, H, this.seed, this.tSec,
          (wx) => this.floraPoolAt(layer, wx));
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
