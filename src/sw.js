// src/sw.js
const CACHE_NAME = "meal-invoice-v1";
const OFFLINE_URL = "/offline.html";

// الملفات الأساسية التي سيتم تخزينها مؤقتاً
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/static/js/bundle.js",
  "/static/js/main.chunk.js",
  "/static/js/0.chunk.js",
  "/static/css/main.chunk.css",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()),
  );
});

// تفعيل Service Worker وحذف المخابئ القديمة
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// استراتيجية: Network First للـ API، Cache First للملفات الثابتة
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // للطلبات التي تبدأ بـ /api (إذا كان لديك API) - يمكن تعديلها حسب الحاجة
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  // للملفات الثابتة (HTML, CSS, JS) نستخدم Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request)
        .then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        })
        .catch(() => {
          // إذا كان الطلب لصفحة HTML ولم نجدها في cache، نعرض صفحة offline
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match(OFFLINE_URL);
          }
        });
    }),
  );
});
s;
