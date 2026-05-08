importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO",
  projectId: "TU_PROJECT_ID",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
});

const messaging = firebase.messaging();

// Manejo de notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {

  const notificationTitle = payload?.notification?.title || "Nuevo mensaje";
  const notificationOptions = {
    body: payload?.notification?.body || "",
    icon: "/logo192.png",
    badge: "/logo192.png",
    data: payload?.data || {},
    // Mejora UX: permite interacción futura
    actions: [
      {
        action: "open",
        title: "Abrir"
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Mejora importante: manejar clicks en notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          client.focus();
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});