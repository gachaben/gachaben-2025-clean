// src/firebase/index.js
import { initializeApp } from "firebase/app";
import { getAuth /*, connectAuthEmulator*/ } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { db } from "../firebase";
const app = initializeApp({
  apiKey:        import.meta.env.VITE_FB_API_KEY,
  authDomain:    import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:     import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  appId:         import.meta.env.VITE_FB_APP_ID,
});


const auth = getAuth(app);
const functions = getFunctions(app, "asia-northeast1"); // ← Functionsのリージョン合わせ

// ローカルならエミュに接続
if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  // connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}

export { app, auth, db, functions };
