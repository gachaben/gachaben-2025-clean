// ------------------------------------------------------
// 🎰 MissionGachaPage.jsx（完全動作テスト保証版）
// ------------------------------------------------------

import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

// ✅ メイン関数
export default function MissionGachaPage() {
  // 🔹 状態管理
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);

  // ✅ 認証監視
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  // ✅ オーバーレイ削除
  useEffect(() => {
    const removeBlockers = () => {
      const blockers = document.querySelectorAll(
        ".pointer-events-none.fixed.inset-0, .absolute.inset-0.pointer-events-none"
      );
      blockers.forEach((el) => {
        el.remove();
        console.log("🧹 削除完了: pointer-events-none.fixed.inset-0");
      });
    };
    removeBlockers();
    setTimeout(removeBlockers, 1000);
  }, []);

  // ✅ クリックテスト
  const handleClick = () => {
    alert("✅ onClick 発火しました！");
    console.log("🔥 onClick 動作確認OK (MissionGachaPage)");
    setShowAdModal(true);
  };

  // ✅ UI本体
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-blue-100 via-sky-100 to-white">
      {/* タイトル */}
      <motion.h1
        className="text-3xl font-bold text-blue-600 mb-6 z-10 drop-shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🎰 今日のミッションガチャ！
      </motion.h1>

      {/* ガチャ円 */}
      <div className="relative z-10 w-72 h-72 flex items-center justify-center rounded-full border-8 border-white/50 bg-white/40 shadow-xl backdrop-blur-md">
        <AnimatePresence>
          <motion.div key="ready" className="text-lg text-gray-500 italic">
            🎥 広告を見てガチャを回そう！
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ✅ デバッグボタン */}
      <button
        id="debug-btn"
        onClick={() => {
          console.log("🎯 CLICK TRIGGERED (raw)");
          handleClick();
        }}
        className="mt-8 px-8 py-3 bg-pink-500 text-white rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-95 hover:bg-pink-600"
        style={{
          zIndex: 999999,
          cursor: "pointer",
          position: "relative",
          pointerEvents: "auto",
        }}
      >
        🎥 広告を見てガチャを回す！（再生成テスト）
      </button>

      {/* ✅ モーダル */}
      {showAdModal && (
        <div
          id="modal-root"
          className="fixed inset-0 z-[2147483647] bg-black/50 flex items-center justify-center"
        >
          <div className="bg-white p-8 rounded-2xl shadow-xl text-lg">
            🎁 モーダルテスト表示成功！
            <button
              onClick={() => setShowAdModal(false)}
              className="block mt-4 mx-auto bg-pink-500 text-white px-6 py-2 rounded-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 🚫 全レイヤー強制解除CSS */}
      <style>{`
        div.pointer-events-none.fixed.inset-0,
        div.absolute.inset-0.pointer-events-none {
          display: none !important;
          visibility: hidden !important;
        }

        * {
          pointer-events: auto !important;
        }

        #debug-btn {
          z-index: 999999 !important;
          position: relative !important;
          pointer-events: auto !important;
        }

        html, body, #root {
          pointer-events: auto !important;
          overflow: visible !important;
        }
      `}</style>
    </div>
  );
}
