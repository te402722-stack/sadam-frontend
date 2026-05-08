import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO",
  projectId: "TU_PROJECT_ID",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

let messaging = null;

export const getMessagingSafe = async () => {
  const supported = await isSupported();

  if (!supported) {
    console.log("⚠️ Firebase Messaging no soportado en este dispositivo");
    return null;
  }

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
};