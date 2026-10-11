// Puente local de actividad para Infinite Andes (opcional, sin dependencias).
//
// Expone `http://localhost:8787/activity` con { cpu, ram, temp, load } para que
// el frontend (`?activity=<url>`) module la densidad de fauna. Solo Linux para
// la temperatura (vía /sys/class/thermal); cpu/ram/load son portables con node:os.
//
// Uso: npm run activity   (PORT=8787 por defecto)

import http from "node:http";
import os from "node:os";
import { readFileSync, readdirSync } from "node:fs";

const PORT = Number(process.env.PORT) || 8787;

function cpuSnapshot() {
  let idle = 0;
  let total = 0;
  for (const c of os.cpus()) {
    for (const t in c.times) total += c.times[t];
    idle += c.times.idle;
  }
  return { idle, total };
}

let prev = cpuSnapshot();

function cpuUsage() {
  const now = cpuSnapshot();
  const idle = now.idle - prev.idle;
  const total = now.total - prev.total;
  prev = now;
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - idle / total));
}

function ramUsage() {
  const total = os.totalmem();
  return total > 0 ? 1 - os.freemem() / total : 0;
}

function temperature() {
  try {
    const zones = readdirSync("/sys/class/thermal").filter((n) => n.startsWith("thermal_zone"));
    const temps = [];
    for (const z of zones) {
      try {
        const milli = Number(readFileSync(`/sys/class/thermal/${z}/temp`, "utf8").trim());
        if (Number.isFinite(milli)) temps.push(milli / 1000);
      } catch (_) {}
    }
    if (temps.length) return Math.max(...temps);
  } catch (_) {}
  return NaN;
}

function isLocal(origin) {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch (_) {
    return false;
  }
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const cors = origin && isLocal(origin) ? { "Access-Control-Allow-Origin": origin } : {};
  if (req.method === "OPTIONS") {
    res.writeHead(204, { ...cors, "Access-Control-Allow-Methods": "GET", "Access-Control-Max-Age": "600" });
    res.end();
    return;
  }
  if (new URL(req.url, "http://localhost").pathname !== "/activity") {
    res.writeHead(404, cors).end("Not found");
    return;
  }
  const temp = temperature();
  const body = JSON.stringify({
    cpu: Number(cpuUsage().toFixed(3)),
    ram: Number(ramUsage().toFixed(3)),
    temp: Number.isFinite(temp) ? Number(temp.toFixed(1)) : null,
    load: Number(os.loadavg()[0].toFixed(2)),
  });
  res.writeHead(200, { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`Puente de actividad en http://localhost:${PORT}/activity (CORS solo localhost)`);
});
