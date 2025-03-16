
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAqwi02QcTZ5j1i2ZW7jg_g_JWxBPXpQoQ",
  authDomain: "watchapp-ff47e.firebaseapp.com",
  projectId: "watchapp-ff47e",
  storageBucket: "watchapp-ff47e.firebasestorage.app",
  messagingSenderId: "820255254734",
  appId: "1:820255254734:web:f301341f0deabc3e29489f"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);