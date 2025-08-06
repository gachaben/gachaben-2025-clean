const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();


async function updateItemsWithZoneName() {
  const snapshot = await db.collection("items").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const pw = data.pw;

    let zoneName = "";
    if (pw >= 2000) {
      zoneName = "神化ゾーン";
    } else if (pw >= 1500) {
      zoneName = "超越ゾーン";
    } else if (pw >= 1000) {
      zoneName = "爆裂ゾーン";
    } else {
      zoneName = "ノーマルゾーン";
    }

    const docRef = db.collection("items").doc(doc.id);
    batch.update(docRef, { zoneName });
  });

  await batch.commit();
  console.log("✅ 全 items に zoneName を追加しました！");
}

updateItemsWithZoneName().catch((error) => {
  console.error("❌ エラー:", error);
});
