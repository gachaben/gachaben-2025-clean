// scripts/deleteExtraItems.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const deleteExtraItems = async () => {
  const itemsRef = collection(db, "items");
  const snapshot = await getDocs(itemsRef);

  let count = 0;

  for (const document of snapshot.docs) {
    const docId = document.id;
    const data = document.data();

    if (data.itemId !== docId) {
      await deleteDoc(doc(db, "items", docId));
      console.log(`✅ Deleted: ${docId}`);
      count++;
    }
  }

  console.log(`✅ 完了：${count} 件の重複ドキュメントを削除しました`);
};

deleteExtraItems();
