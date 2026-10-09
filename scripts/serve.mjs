// Servidor de desarrollo sin caché.
//
// Sirve el proyecto por HTTP con `Cache-Control: no-store` para los módulos ES,
// así el navegador nunca mezcla versiones nuevas con otras cacheadas (lo que
// rompe los `import` y deja la pantalla en negro). Sin dependencias.
//
// Uso: npm start   (PORT=8000 por defecto)

import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT) || 8000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";

  // Evita salir de la raíz del proyecto.
  const file = normalize(join(ROOT, pathname));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  let stat;
  try {
    stat = statSync(file);
  } catch {
    res.writeHead(404).end("Not found");
    return;
  }
  if (stat.isDirectory()) {
    res.writeHead(302, { Location: pathname.replace(/\/?$/, "/") }).end();
    return;
  }

  // Sin caché: siempre fresco (clave en desarrollo).
  res.writeHead(200, {
    "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream",
    "Content-Length": stat.size,
    "Cache-Control": "no-store, must-revalidate",
  });
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Infinite Andes en http://localhost:${PORT} (sin caché)`);
});
