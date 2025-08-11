import { initializeApp } from "firebase/app";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCV8UNRLnbdoeWkLA_azeMWJyflw0iw",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.appspot.com",
  messagingSenderId: "929195735227",
  appId: "1:929195735227:web:94167de85ef28bf724942f"
};

const app = initializeApp(firebaseConfig);

const addSeriesIdToItems = async () => {
  const snapshot = await getDocs(collection(db, "items"));
  let count = 0;

  for (const docSnap of snapshot.docs) {
    const docRef = doc(db, "items", docSnap.id);
    await updateDoc(docRef, { seriesId: "kontyu" });
    console.log(`✅ 追加: ${docSnap.id}`);
    count++;
  }

  console.log(`🎉 完了！${count} 件の item に seriesId を追加しました！`);
};

addSeriesIdToItems();
