// import.js
const admin = require("firebase-admin");
const serviceAccount = require("./gachaben-2025-firebase-adminsdk-fbsvc-2a7c89a3b2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const questions = [
  {
    question: "つぎのうち、いぬのなきごえはどれ？",
    choices: ["にゃー", "ぴよぴよ", "わんわん", "もー"],
    answerIndex: 2
  },
  {
    question: "つぎのうち、そらをとべるのはどれ？",
    choices: ["ねこ", "いぬ", "とり", "うま"],
    answerIndex: 2
  },
  {
    question: "つぎのうち、みずのなかにすんでいるのはどれ？",
    choices: ["さかな", "しか", "とり", "ねずみ"],
    answerIndex: 0
  }
];

async function importQuestions() {
  const batch = db.batch();
  questions.forEach((q) => {
    const docRef = db.collection("specialQuestions").doc(); // 自動ID
    batch.set(docRef, q);
  });

  await batch.commit();
  console.log("✅ インポート完了！");
}

importQuestions();
