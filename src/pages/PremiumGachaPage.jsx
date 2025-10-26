// ------------------------------------------------------
// 🌈 PremiumGachaPage.jsx（UI整列＋音符アニメ完全版）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit/app";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// 🎁 プレミアム景品リスト（シリーズ2508 / *_premium.png を使用）
const PREMIUM_ITEMS = [
  {
    id: "P001",
    name: "ヘラクレス・オブ・ドレミ",
    rarity: "LEGEND",
    color: "#facc15",
    image: "/images/2508/stage5/001_herakuresu_premium.png",
  },
  {
    id: "P002",
    name: "アゲハ・ライトウィング",
    rarity: "ULTRA",
    color: "#60a5fa",
    image: "/images/2508/stage5/002_ageha_premium.png",
  },
  {
    id: "P003",
    name: "ハニー・ハーモニック",
    rarity: "ULTRA",
    color: "#34d399",
    image: "/images/2508/stage5/003_hati_premium.png",
  },
  {
    id: "P004",
    name: "ホタル・ルミナス",
    rarity: "SUPER",
    color: "#a78bfa",
    image: "/images/2508/stage5/004_hotaru_premium.png",
  },
  {
    id: "P005",
    name: "カブト・プレミアムX",
    rarity: "LEGEND",
    color: "#f87171",
    image: "/images/2508/stage5/005_kabuto_premium_premium.png",
  },
  {
    id: "P006",
    name: "モンシロ・セレナーデ",
    rarity: "SUPER",
    color: "#fcd34d",
    image: "/images/2508/stage5/006_monshiro_premium.png",
  },
  {
    id: "P007",
    name: "セミ・サマーブレイク",
    rarity: "ULTRA",
    color: "#f472b6",
    image: "/images/2508/stage5/007_semi_premium.png",
  },
  {
    id: "P008",
    name: "テン・ドレミムシ",
    rarity: "SUPER",
    color: "#22c55e",
    image: "/images/2508/stage5/008_tentoumusi_premium.png",
  },
  {
    id: "P009",
    name: "トンボ・スカイソニック",
    rarity: "ULTRA",
    color: "#38bdf8",
    image: "/images/2508/stage5/009_tombo_premium.png",
  },
  {
    id: "P010",
    name: "クワガタ・クロノブレード",
    rarity: "LEGEND",
    color: "#fb923c",
    image: "/images/2508/stage5/010_kuwagata_premium.png",
  },
];

// 🔊 レア度別サウンド
const raritySounds = {
  LEGEND: "/sounds/effects/se_legend.mp3",
  ULTRA: "/sounds/effects/se_ultra.mp3",
  SUPER: "/sounds/effects/se_super.mp3",
  RAINBOW: "/sounds/effects/se_rainbow.mp3",
};

// 🧩 Firestore 初期化
async function initPremiumGacha(uid) {
  const ref = doc(db, "users", uid, "stats", "premiumGacha");
  const snap = await getDoc(ref);
  const today = new Date().toISOString().split("T")[0];
  if (!snap.exists()) {
    await setDoc(ref, {
      freeUsed: false,
      adUsedCount: 0,
      noteCount: 0,
      lastUsedAt: today,
      totalDraws: 0,
    });
    return { freeUsed: false, adUsedCount: 0, noteCount: 0 };
  }
  const data = snap.data();
  if (data.lastUsedAt !== today) {
    await setDoc(ref, { freeUsed: false, adUsedCount: 0, lastUsedAt: today }, { merge: true });
    return { ...data, freeUsed: false, adUsedCount: 0 };
  }
  return {
    freeUsed: !!data.freeUsed,
    adUsedCount: Number(data.adUsedCount || 0),
    noteCount: Number(data.noteCount || 0),
  };
}

export default function PremiumGachaPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [gachaState, setGachaState] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showEffect, setShowEffect] = useState(false);

  // 🔹 初期化
  useEffect(() => {
    if (user) initPremiumGacha(user.uid).then(setGachaState);
  }, [user]);

  // 🎬 ガチャ実行
  const startGacha = async (mode = "free") => {
    if (isSpinning || !gachaState) return;
    const { freeUsed, adUsedCount, noteCount } = gachaState;

    if (mode === "free" && freeUsed) return alert("今日はもう無料ガチャを引きました！");
    if (mode === "ad" && adUsedCount >= 2) return alert("広告ガチャは1日2回までです！");

    const startSound = new Audio("/sounds/effects/gacha_complete.mp3");
    startSound.play().catch(() => {});
    setIsSpinning(true);
    setResult(null);

    setTimeout(async () => {
      const ref = doc(db, "users", user.uid, "stats", "premiumGacha");
      let item;
      let newNoteCount = gachaState.noteCount + 1;
      let guaranteed = false;

      // 🌈 7回目で確定
      if (newNoteCount >= 7) {
        item = PREMIUM_ITEMS[Math.floor(Math.random() * PREMIUM_ITEMS.length)];
        newNoteCount = 0;
        guaranteed = true;
      } else {
        item =
          Math.random() < 0.4
            ? PREMIUM_ITEMS[Math.floor(Math.random() * PREMIUM_ITEMS.length)]
            : { id: "NONE", name: "はずれ…", rarity: "NONE", color: "#999" };
      }

      setResult(item);
      setIsSpinning(false);

      // 🎵 効果音
      if (guaranteed) {
        const rainbow = new Audio(raritySounds.RAINBOW);
        rainbow.play();
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 2000);
      } else if (item.id !== "NONE") {
        const se = new Audio(raritySounds[item.rarity] || "");
        se.play();
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 1500);
      }

      // 🔥 Firestore 更新
      await setDoc(ref, {
        noteCount: newNoteCount,
        freeUsed: mode === "free" ? true : freeUsed,
        adUsedCount: mode === "ad" ? adUsedCount + 1 : adUsedCount,
        lastUsedAt: new Date().toISOString().split("T")[0],
      }, { merge: true });

      setGachaState((prev) => ({
        ...prev,
        noteCount: newNoteCount,
        freeUsed: mode === "free" ? true : prev.freeUsed,
        adUsedCount: mode === "ad" ? prev.adUsedCount + 1 : prev.adUsedCount,
      }));
    }, 3000);
  };

  if (!gachaState)
    return <div className="p-8 text-gray-500">ガチャデータを読み込み中...</div>;

  // 🎵 音符ゲージ（下にカラフル表示）
  const noteColors = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#facc15"];
  const notes = Array(7)
    .fill(null)
    .map((_, i) => (
      <motion.span
        key={i}
        className="text-4xl mx-1"
        style={{ color: i < gachaState.noteCount ? noteColors[i] : "#ddd" }}
        animate={{ scale: i < gachaState.noteCount ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.6 }}
      >
        𝄞
      </motion.span>
    ));

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-pink-100 via-rose-100 to-white overflow-hidden">

      {/* 🌈 光エフェクト */}
      {showEffect && (
        <video
          src="/videos/effect_glow.mp4"
          autoPlay
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-[999]"
        />
      )}

      {/* 🌈 タイトル */}
      <h1 className="text-3xl font-bold text-pink-600 drop-shadow-md mb-4 z-10">
        🌈 プレミアムガチャ！
      </h1>

      {/* 🎰 ガチャ円 */}
      <div className="relative z-10 w-80 h-80 flex items-center justify-center rounded-full border-8 border-white/50 bg-white/70 shadow-xl backdrop-blur-md overflow-hidden">
        <AnimatePresence>
          {isSpinning ? (
            <video
              src="/videos/gacha_spin.mp4"
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center relative z-20">
              {/* 🎨 ガチャマシン or 当選画像 */}
              {!result && (
                <img
                  src="/images/gacha_machine.png"
                  alt="ガチャマシン"
                  className="w-40 h-40 object-contain mb-2"
                />
              )}
              {result?.image && result.id !== "NONE" && (
                <motion.img
                  src={result.image}
                  alt={result.name}
                  className="w-44 h-44 object-contain mb-3 z-30 relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <p className="text-2xl font-bold mb-2" style={{ color: result?.color || "#888" }}>
                {result ? result.name : "🎵 準備OK！"}
              </p>
              <p className="text-lg text-gray-500">
                {result
                  ? result.id === "NONE"
                    ? "また挑戦しよう！"
                    : `レア度：${result.rarity}`
                  : ""}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎬 ボタン */}
      <div className="flex space-x-4 mb-4 mt-4">
        {!isSpinning && !gachaState.freeUsed && (
          <button
            onClick={() => startGacha("free")}
            className="px-6 py-3 bg-pink-500 text-white rounded-2xl shadow-md hover:scale-105 transition"
          >
            🎁 無料で1回引く
          </button>
        )}
        {!isSpinning && gachaState.freeUsed && gachaState.adUsedCount < 2 && (
          <button
            onClick={() => startGacha("ad")}
            className="px-6 py-3 bg-purple-500 text-white rounded-2xl shadow-md hover:scale-105 transition"
          >
            🎥 広告を見てもう1回！
          </button>
        )}
      </div>

      {/* 🎵 音符ゲージ */}
      <div className="flex justify-center mb-6">{notes}</div>

      {/* ✅ ホームに戻る */}
      {result && !isSpinning && (
        <motion.button
          onClick={() => navigate("/home")}
          className="mt-2 px-8 py-3 bg-green-500 text-white rounded-2xl shadow-lg hover:bg-green-600 transition"
        >
          ✅ ホームに戻る
        </motion.button>
      )}
    </div>
  );
}
