// NAISSER Service Worker — 푸시 알림 + 오프라인 캐싱
// TODO: FCM 서버키 설정 후 활성화

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 푸시 알림 수신
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "나이써";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: data.tag || "naisser",
    data: { url: data.url || "/" },
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 → 딥링크
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// 오프라인 캐싱 (네트워크 우선, 실패 시 캐시)
const CACHE_NAME = "naisser-v1";
const OFFLINE_URLS = ["/", "/community"];

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) return; // API는 캐싱 안 함

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
