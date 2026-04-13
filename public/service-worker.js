// public/service-worker.js
/* eslint-disable no-restricted-globals */
const CACHE_NAME = "meal-invoice-v1";
const OFFLINE_URL = "/offline.html";

// الملفات الأساسية التي سيتم تخزينها مؤقتاً (يمكنك إضافة المزيد حسب الحاجة)
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  // سيتم إضافة ملفات JS و CSS تلقائياً بواسطة CRA أثناء البناء
];

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()),
  );
});

// تفعيل Service Worker وحذف المخابئ القديمة
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// استراتيجية: Cache First للملفات الثابتة، وشبكة أولاً للصفحات (مع عرض offline عند الفشل)
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // للصفحات HTML (أو طلبات التنقل)
  if (
    event.request.mode === "navigate" ||
    requestUrl.pathname.endsWith(".html")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches
          .match(event.request)
          .then((response) => response || caches.match(OFFLINE_URL));
      }),
    );
    return;
  }

  // للملفات الثابتة (JS, CSS, صور) نستخدم cache first
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
