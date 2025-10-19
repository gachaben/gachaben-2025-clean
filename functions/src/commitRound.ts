// ------------------------------------------------------
// functions/src/commitRound.ts（v1.7b対応・PW撤廃）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { Timestamp } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true, methods: ["POST", "OPTIONS"] });

export const commitRound = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        return res.status(204).send("");
      }

      const { battleId, round, correct, time } = req.body || {};
      if (!battleId) throw new Error("battleId が未指定です");

      const ref = db.collection("battles").doc(battleId);
      const snap = await ref.get();
      if (!snap.exists) throw new Error("該当バトルが存在しません");

      const data = snap.data() || {};
      const newNoteProgress = (data.noteProgress || 0) + (correct ? 1 : 0);

      await ref.update({
        rounds: admin.firestore.FieldValue.arrayUnion({
          round,
          correct: !!correct,
          time: time ?? null,
        }),
        noteProgress: newNoteProgress,
        updatedAt: Timestamp.now(),
      });

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json({
        message: "Round committed ✅",
        newNoteProgress,
      });
    } catch (err: any) {
      console.error("🔥 commitRound Error:", err);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(500).json({ error: err.message });
    }
  });
});
