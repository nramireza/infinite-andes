// Service worker de Infinite Andes: uso offline sin dependencias.
//
// Estrategia:
//  - Navegación (documentos): red primero, con la copia en caché como respaldo
//    (así siempre se ve la versión nueva cuando hay conexión).
//  - Recursos (JS/CSS/íconos): caché primero con revalidación en segundo plano
//    (stale-while-revalidate); si no está en caché, se pide y se guarda.
//
// No hay build ni lista de módulos que mantener: el grafo `src/*.js` se cachea
// solo la primera vez que se sirve. El servidor de desarrollo (`npm start`)
// mantiene `Cache-Control: no-store`; el registro se omite en `localhost`.

const CACHE = "infinite-andes-v1";

const SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
