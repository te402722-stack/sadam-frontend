importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyChzzkqBijf0zZcl_ca71vxg84dLHZS8Pg",
  authDomain: "sadam-a669a.firebaseapp.com",
  projectId: "sadam-a669a",
  storageBucket: "sadam-a669a.firebasestorage.app",
  messagingSenderId: "995476345701",
  appId: "1:995476345701:web:cac2c246ddd1138a76c78c",
  measurementId: "G-YB9MPWY8DC"
});

const messaging = firebase.messaging();

// 🔔 Notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {

  console.log("🔔 Background message:", payload);

  const notificationTitle =
    payload?.notification?.title || "Nuevo mensaje";

  const notificationOptions = {
    body: payload?.notification?.body || "",
    icon: "/logo192.png",
    badge: "/logo192.png",
    data: payload?.data || {}
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// 👆 Click en notificación
self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {

      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});