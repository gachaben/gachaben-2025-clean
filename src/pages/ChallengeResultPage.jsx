// ------------------------------------------------------
// ⚡ ChallengeResultPage.jsx
// チャレンジ終了時の結果保存＋ドレミポイント加算＋称号アップ演出（♫）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { auth } from "@/fbkit";
import { saveChallengeRecord } from "@/utils/saveChallengeRecord"; // チャレンジ結果保存用
import { updateDoremiPoints } from "@/utils/updateDoremiPoints";
import RankUpModal from "@/components/ui/RankUpModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/fbkit";

export default function ChallengeResultPage() {
  const [msg, setMsg] = useState("saving...");
  const [recId, setRecId] = useState(null);
  const [modal, setModal] = useState({ show: false, old: null, new: null });

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (!user) {
        setMsg("未ログインです");
        return;
      }

      const sp = new URLSearchParams(location.search);
      const state = history.state?.usr || {};
      const result = (sp.get("result") ?? state.result ?? "clear").toLowerCase();
      const score = Number(sp.get("score") ?? state.score ?? 0);

      try {
        // 🧾 Firestoreにチャレンジ履歴を保存
        const id = await saveChallengeRecord({
          uid: user.uid,
          result: ["clear", "fail"].includes(result) ? result : "clear",
          score,
          meta: { from: "ChallengeResultPage" },
        });
        setRecId(id);

        // 🎹 現在の称号を取得
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const prevRank = userSnap.exists()
          ? userSnap.data().doremiRank ?? "リコーダー"
          : "リコーダー";

        // 🎵 チャレンジドレミ加算ルール
        let add = 0;
        if (result === "clear") add = 20;
        if (score >= 5) add += 10; // スコアボーナス

        let newRank = prevRank;
        if (add > 0) {
          const updated = await updateDoremiPoints(user.uid, add);
          newRank = updated?.rank ?? prevRank;
          console.log(
            `🎵 Challenge: +${add}pt / ${prevRank} → ${newRank} (score: ${score})`
          );
        }

        // 🪄 ランクアップ演出（♫）
        if (newRank !== prevRank) {
          console.log("⚡ RankUpModal 発火:", prevRank, "→", newRank);
          setTimeout(() => {
            setModal({ show: true, old: prevRank, new: newRank });
          }, 300);
        }

        setMsg(`保存完了！ (+${add}pt)`);
      } catch (e) {
        console.error(e);
        setMsg("保存に失敗しました: " + String(e));
      }
    })();
  }, []);

  return (
    <div
      style={{
        padding: 16,
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #fff8e7, #ffe7cc)",
      }}
    >
      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        ⚡ Challenge Result
      </h1>

      <p className="text-gray-700">{msg}</p>

      {recId && (
        <p className="mt-2 text-sm text-gray-500">
          id: <code>{recId}</code>
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2 items-center">
        <a href="/challenge/list" className="text-orange-600 underline">
          他のチャレンジに挑戦する
        </a>
        <a href="/login" className="text-orange-600 underline">
          Loginへ戻る
        </a>
      </div>

      {/* 🎹 称号アップモーダル（チャレンジモード＝♫） */}
      <RankUpModal
        show={modal.show}
        oldRank={modal.old}
        newRank={modal.new}
        mode="challenge"
        onClose={() => setModal({ show: false, old: null, new: null })}
      />
    </div>
  );
}
