// upload/uploadItems.js

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ✅ サービスアカウントキーの読み込み（パスを調整してください）
const serviceAccount = require("../serviceAccountKey.json");

// ✅ Firebase 初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ items.json の読み込み
const items = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../items.json"), "utf-8"));

const uploadItems = async () => {
  const batch = db.batch();

  items.forEach((item) => {
    const itemRef = db.collection("items").doc(item.itemId); // ← itemId をドキュメントIDに
    batch.set(itemRef, item);
  });

  await batch.commit();
  console.log("✅ items コレクションに一括アップロード完了！");
};

uploadItems();
