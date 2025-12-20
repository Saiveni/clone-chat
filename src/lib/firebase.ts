import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAZEP1YKnYD4Bof4oIxj2QGyRtsXKvRVLs",
  authDomain: "whatsapp-5fb87.firebaseapp.com",
  projectId: "whatsapp-5fb87",
  storageBucket: "whatsapp-5fb87.firebasestorage.app",
  messagingSenderId: "539332176836",
  appId: "1:539332176836:web:ce2d41ba72a752765a1291",
  measurementId: "G-Y2BSGEGYWL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
