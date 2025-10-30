// ------------------------------------------------------
// 🌌 PremiumGachaPage.jsx（LEGENDドレミ爆光エフェクト 完全版）
// ------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit/app";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const PREMIUM_ITEMS = [
  { id: "P001", name: "ヘラクレス・オブ・ドレミ", rarity: "LEGEND", color: "#facc15", image: "/images/2508/stage5/001_herakuresu_premium.png" },
  { id: "P002", name: "アゲハ・ライトウィング", rarity: "ULTRA", color: "#60a5fa", image: "/images/2508/stage5/002_ageha_premium.png" },
  { id: "P003", name: "ハニー・ハーモニック", rarity: "ULTRA", color: "#34d399", image: "/images/2508/stage5/003_hati_premium.png" },
  { id: "P004", name: "ホタル・ルミナス", rarity: "SUPER", color: "#a78bfa", image: "/images/2508/stage5/004_hotaru_premium.png" },
  { id: "P005", name: "カブト・プレミアムX", rarity: "LEGEND", color: "#f87171", image: "/images/2508/stage5/005_kabuto_premium.png" },
  { id: "P006", name: "モンシロ・セレナーデ", rarity: "SUPER", color: "#fcd34d", image: "/images/2508/stage5/006_monshiro_premium.png" },
  { id: "P007", name: "セミ・サマーブレイク", rarity: "ULTRA", color: "#f472b6", image: "/images/2508/stage5/007_semi_premium.png" },
  { id: "P008", name: "テン・ドレミムシ", rarity: "SUPER", color: "#22c55e", image: "/images/2508/stage5/008_tentoumusi_premium.png" },
  { id: "P009", name: "トンボ・スカイソニック", rarity: "ULTRA", color: "#38bdf8", image: "/images/2508/stage5/009_tombo_premium.png" },
  { id: "P010", name: "クワガタ・クロノブレード", rarity: "LEGEND", color: "#fb923c", image: "/images/2508/stage5/010_kuwagata_premium.png" },
];

const raritySounds = {
  LEGEND: "/sounds/effects/se_legend.mp3",
  ULTRA: "/sounds/effects/se_ultra.mp3",
  SUPER: "/sounds/effects/se_super.mp3",
  RAINBOW: "/sounds/effects/se_rainbow.mp3",
};

async function initPremiumGacha(uid) {
  const ref = doc(db, "users", uid, "stats", "premiumGacha");
  const snap = await getDoc(ref);
  const today = new Date().toISOString().split("T")[0];
  if (!snap.exists()) {
    await setDoc(ref, { freeUsed: false, adUsedCount: 0, noteCount: 0, lastUsedAt: today, totalDraws: 0 });
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
  const [showRipple, setShowRipple] = useState(false);
  const [showAura, setShowAura] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bgGradient, setBgGradient] = useState("linear-gradient(to bottom, #ffeef4, #fff)");

  useEffect(() => {
    if (user) initPremiumGacha(user.uid).then(setGachaState);
  }, [user]);

  // 🎨 レア度別背景
  useEffect(() => {
    if (!result) return;
    switch (result.rarity) {
      case "LEGEND":
        setBgGradient("linear-gradient(135deg, #fff7cc, #ffd700, #ffb347)");
        break;
      case "ULTRA":
        setBgGradient("linear-gradient(135deg, #e0f7ff, #60a5fa, #1e3a8a)");
        break;
      case "SUPER":
        setBgGradient("linear-gradient(135deg, #f3e8ff, #a78bfa, #f472b6)");
        break;
      default:
        setBgGradient("linear-gradient(to bottom, #ffeef4, #fff)");
    }
  }, [result]);

  // ✨ 粒子生成（動的爆光対応）
  const generateParticles = (rarity, multiplier = 1) => {
    const config = {
      LEGEND: { colors: ["#fff", "#ffd700", "#fff8dc"], count: 60, speed: 12 },
      ULTRA: { colors: ["#cce5ff", "#60a5fa", "#93c5fd"], count: 40, speed: 10 },
      SUPER: { colors: ["#f0d9ff", "#a78bfa", "#f472b6"], count: 30, speed: 9 },
      NONE: { colors: ["#ffe4e6", "#fbcfe8", "#fecdd3"], count: 20, speed: 8 },
    };
    const cfg = config[rarity || "NONE"];
    return Array(cfg.count * multiplier)
      .fill(null)
      .map((_, i) => ({
        id: i,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 5 * (multiplier > 1 ? 1.6 : 1),
        delay: Math.random() * 3,
        duration: cfg.speed + Math.random() * 3,
        glow: multiplier > 1,
      }));
  };

  useEffect(() => {
    setParticles(generateParticles(result?.rarity));
  }, [result]);

  // 🎵 ドレミ和音＋爆光連動
  const playDoremiExplosion = () => {
    const notes = ["do2.wav", "re2.wav", "mi2.wav", "do_high.wav"];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const audio = new Audio(`/sounds/doremi/${note}`);
        audio.volume = i === 3 ? 0.9 : 0.7;
        audio.play().catch(() => {});
        // 音のタイミングで粒子を爆発させる
        setParticles(generateParticles("LEGEND", i === 3 ? 2.5 : 1.8));
        setTimeout(() => setParticles(generateParticles("LEGEND")), 800);
      }, i * 200);
    });
  };

  // 🎬 ガチャ開始
  const startGacha = async (mode = "free") => {
    if (isSpinning || !gachaState) return;
    const { freeUsed, adUsedCount, noteCount } = gachaState;
    if (mode === "free" && freeUsed) return alert("今日はもう無料ガチャを引きました！");
    if (mode === "ad" && adUsedCount >= 2) return alert("広告ガチャは1日2回までです！");

    new Audio("/sounds/effects/gacha_complete.mp3").play().catch(() => {});
    setIsSpinning(true);
    setResult(null);

    setTimeout(async () => {
      const ref = doc(db, "users", user.uid, "stats", "premiumGacha");
      let item;
      let newNoteCount = gachaState.noteCount + 1;
      if (newNoteCount >= 7) {
        item = PREMIUM_ITEMS[Math.floor(Math.random() * PREMIUM_ITEMS.length)];
        newNoteCount = 0;
      } else {
        item =
          Math.random() < 0.4
            ? PREMIUM_ITEMS[Math.floor(Math.random() * PREMIUM_ITEMS.length)]
            : { id: "NONE", name: "はずれ…", rarity: "NONE", color: "#999" };
      }

      setResult(item);
      setIsSpinning(false);

      if (item.id !== "NONE") {
        if (item.rarity === "LEGEND") {
          playDoremiExplosion();
          setTimeout(() => setShowRipple(true), 200);
          setTimeout(() => setShowRipple(false), 1500);
          setTimeout(() => setShowAura(true), 800);
          setTimeout(() => setShowAura(false), 4800);
          setTimeout(() => {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 400);
          }, 600);
        } else {
          new Audio(raritySounds[item.rarity] || "").play().catch(() => {});
        }
      }

      await setDoc(ref, { noteCount: newNoteCount, freeUsed: true, lastUsedAt: new Date().toISOString().split("T")[0] }, { merge: true });
    }, 3000);
  };

  return (
    <motion.div className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden"
      animate={{ background: bgGradient }} transition={{ duration: 1.5 }}>

      {/* ✨ 背景粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[100]">
        {particles.map((p) => (
          <motion.div key={p.id} className="absolute rounded-full"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              filter: p.glow ? "blur(3px) brightness(1.6)" : "blur(1px)",
            }}
            animate={{ y: ["0%", "-120%"], opacity: [0.3, 1, 0.6, 1, 0.4] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
        ))}
      </div>

      {/* 💥 光フラッシュ */}
      {showFlash && <div className="absolute inset-0 bg-yellow-200 opacity-80 z-[970] animate-flash"></div>}

      {/* 🌊 波紋・残光 */}
      {showRipple && (
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full pointer-events-none z-[950]"
          style={{
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255,215,0,0.7) 0%, rgba(255,215,0,0) 70%)",
            animation: "ripple 1.5s ease-out forwards",
          }} />
      )}
      {showAura && <div className="absolute top-1/2 left-1/2 w-[260px] h-[260px] rounded-full pointer-events-none z-[940] aura"></div>}

      <h1 className="text-3xl font-bold text-pink-600 drop-shadow-md mb-4 z-10">🌈 プレミアムガチャ！</h1>

      <div className="relative z-10 w-80 h-80 flex items-center justify-center rounded-full border-8 border-white/50 bg-white/70 shadow-xl backdrop-blur-md overflow-hidden">
        <AnimatePresence>
          {isSpinning ? (
            <video src="/videos/gacha_spin.mp4" autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center relative z-20">
              {result?.image ? (
                <motion.img src={result.image} alt={result.name} className="w-44 h-44 object-contain mb-3"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} />
              ) : (
                <img src="/images/gacha_machine.png" alt="ガチャ" className="w-40 h-40 mb-2" />
              )}
              <p className="text-2xl font-bold mb-2" style={{ color: result?.color || "#888" }}>
                {result ? result.name : "🎵 準備OK！"}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={() => startGacha("free")}
        className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-2xl shadow-md hover:scale-105 transition z-20">
        🎁 ガチャを引く
      </button>

      <style>{`
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        .aura {
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(255,215,0,0.3) 20%, rgba(255,215,0,0.1) 50%, rgba(255,215,0,0) 80%);
          box-shadow: 0 0 40px 10px rgba(255,230,120,0.3);
          animation: auraPulse 4s ease-in-out forwards;
        }
        @keyframes auraPulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.4s ease-out forwards;
        }
      `}</style>
    </motion.div>
  );
}
