// ------------------------------------------------------
// functions/src/index.ts
// Emulator CORS対応 完全版（最終）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

admin.initializeApp();

// ✅ 全オリジン許可（localhost:5173などOK）
const corsHandler = cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// ✅ createBattle
export const createBattle = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
  
      res.status(200).json({ ok: true, msg: "createBattle success (CORS OK)" });
    } catch (err: any) {
      console.error("createBattle error:", err);
      res.status(500).json({ error: err.message });
    }
  });
});

// ✅ commitRound
export const commitRound = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    res.json({ ok: true, msg: "commitRound OK" });
  });
});

// ✅ finishBattle
export const finishBattle = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    res.json({ ok: true, msg: "finishBattle OK" });
  });
});
