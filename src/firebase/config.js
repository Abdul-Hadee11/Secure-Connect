// 🔥 Firebase configuration
// Replace these values with your own from: https://console.firebase.google.com/
// (Project Settings → General → Your apps → SDK setup and configuration)

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvua3ujj_1S5OjlOqe-slMGz9QjFt63-M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lowkeyus-3ff0d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lowkeyus-3ff0d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lowkeyus-3ff0d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "273012138299",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:273012138299:web:aeec09b979d0a434e3d71e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
