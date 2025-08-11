// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCYoonUtU7leRNcHx0lKA_azeMWvjFYTuo',
  authDomain: 'gachaben-2025.firebaseapp.com',
  projectId: 'gachaben-2025',
  storageBucket: 'gachaben-2025.appspot.com',
  messagingSenderId: '929513375207',
  appId: '1:929513375207:web:94167d7e05eff28b7f2942',
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebaseサービスを初期化
export const db = getFirestore(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// 🔐 iOS対策：認証の永続化を localStorage に固定
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase Auth 永続化エラー:", error);
});
