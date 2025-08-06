const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const run = async () => {
  const itemsRef = db.collection("items");
  const snapshot = await itemsRef.get();

  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    let rank = "B"; // 初期は B
    if (data.itemId?.includes("_S_")) {
      rank = "S";
    } else if (data.itemId?.includes("_A_")) {
      rank = "A";
    }

    await doc.ref.update({ rank });
    console.log(`${doc.id} に rank: ${rank} を追加`);
    count++;
  }

  console.log(`✅ 合計 ${count} 件 更新完了！`);
};

run().catch(console.error);
