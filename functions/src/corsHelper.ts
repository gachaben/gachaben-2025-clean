// ------------------------------------------------------
// functions/src/corsHelper.ts（完全対応版）
// ------------------------------------------------------
import { Request, Response } from "express";

export const allowCORS =
  (handler: (req: Request, res: Response) => any) =>
  async (req: Request, res: Response) => {
    // ✅ ヘッダーを明示的に設定
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ✅ プリフライト即返し
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    try {
      await handler(req, res);
    } catch (err) {
      console.error("❌ allowCORS error:", err);
      res.status(500).json({ ok: false, error: String(err) });
    }
  };
