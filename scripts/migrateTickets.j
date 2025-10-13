// ------------------------------------------------------
// 🎫 migrateTickets.js
// Firestore: usersコレクション内の battleTickets → tickets に変換
// ------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, updateDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  const usersRef = collection(db, "users");
  const snap = await getDocs(usersRef);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();

    // 旧フィールドが存在する場合のみ変換
    if (data.battleTickets !== undefined) {
      const newTickets = data.battleTickets;
      await updateDoc(doc(db, "users", docSnap.id), {
        tickets: newTickets,
      });
      console.log(`✅ ${docSnap.id}: battleTickets(${newTickets}) → tickets`);
    }
  }

  console.log("🎫 Migration completed!");
}

migrate().catch((e) => console.error("❌ Migration error:", e));
