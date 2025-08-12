import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const projectId = "gachaben-2025"; // ← 任意（UIに出ているプロジェクト名でOK）
const firebaseConfig =
  import.meta.env.PROD
    ? {
        // ★本番ビルド用（後で本物を入れる）
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: `${projectId}.appspot.com`,
      }
    : {
        // ★開発（エミュ）用：ダミーでもOK
        apiKey: "fake-api-key",
        authDomain: "localhost",
        projectId,
        storageBucket: `${projectId}.appspot.com`,
      };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// エミュに接続（あなたのポートに合わせて）
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://127.0.0.1:9097", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8082);
  connectStorageEmulator(storage, "127.0.0.1", 9197);
}
