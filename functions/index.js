const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // CORSを許可

// Firebase Admin SDK 初期化
admin.initializeApp();
const db = admin.firestore();

// Gmail設定
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gachaben2025@gmail.com",
    pass: "ggxfjitxpixbksku" // アプリパスワード
  }
});

exports.sendSupportMail = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { childName, childUid, messageBody, parentEmail } = req.body;

      const mailOptions = {
        from: "gachaben2025@gmail.com",
        to: parentEmail,
        subject: `【応援しよう📣】${childName}さんにメッセージを届けませんか？`,
        text: `
こんにちは！

${childName}さんが「がちゃべん」で毎日がんばって学んでいます✨
そんな ${childName}さん に、あなたからの応援メッセージを届けてみませんか？

🌱 がんばっている姿は、きっと力になります。
📣 あなたの一言で、${childName}さんのやる気がもっとアップします！

＝＝＝＝＝＝＝＝＝＝＝＝
${childName}さんへのメッセージ：
「${messageBody}」
＝＝＝＝＝＝＝＝＝＝＝＝

これからも一緒に見守っていきましょう😊

――――――――――――
がちゃべん運営より📚✨
        `,
      };

      // メール送信
      await transporter.sendMail(mailOptions);

      // Firestoreに送信ログを保存
      // Firestoreに送信ログを保存
await db.collection("supportMessages").add({
  childUid: childUid,
  childName: childName,
  parentEmail: parentEmail,
  message: messageBody,
  sentAt: admin.firestore.FieldValue.serverTimestamp(),
});

// 🔽 ここが今回の追記ポイント！ supportUnread を true にして保存
await db.collection("users").doc(childUid).set(
  {
    supportUnread: true,
  },
  { merge: true } // 既存のデータを消さずにマージ
);

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("エラー:", error);
      res.status(500).send({ success: false, error: error.toString() });
    }
  });
});
