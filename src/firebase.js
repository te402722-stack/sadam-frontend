import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyChzzkqBijf0zZcl_ca71vxg84dLHZS8Pg",
  authDomain: "sadam-a669a.firebaseapp.com",
  projectId: "sadam-a669a",
  storageBucket: "sadam-a669a.firebasestorage.app",
  messagingSenderId: "995476345701",
  appId: "1:995476345701:web:cac2c246ddd1138a76c78c",
  measurementId: "G-YB9MPWY8DC"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);