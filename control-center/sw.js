self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data.json(); } catch {}

  event.waitUntil(
    self.registration.showNotification(
      data.title || "NeuroSuite Control Center",
      {
        body: data.body || "Nuova richiesta di accesso",
        requireInteraction: true,
        data: {url: data.url || "/control-center/"}
      }
    )
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/control-center/")
  );
});
