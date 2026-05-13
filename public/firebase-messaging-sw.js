// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyChzzkqBijf0zZcl_ca71vxg84dLHZS8Pg",
  authDomain: "sadam-a669a.firebaseapp.com",
  projectId: "sadam-a669a",
  storageBucket: "sadam-a669a.appspot.com",
  messagingSenderId: "995476345701",
  appId: "1:995476345701:web:cac2c246ddd1138a76c78c"
});

const messaging = firebase.messaging();

// Esto maneja la notificación cuando la app está CERRADA
messaging.onBackgroundMessage((payload) => {
  console.log("Mensaje en segundo plano:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});