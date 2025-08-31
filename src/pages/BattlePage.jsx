// src/pages/BattlePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { onAuthStateChanged } from "firebase/auth";
import { jpDateKey } from "@/utils/battleUtils";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

// ---- 背景 ----
const BASE = (import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";
const BG = {
  event:  `${BASE}images/bg/janken/event_fire.png`,
  spring: `${BASE}images/bg/janken/spring.png`,
  summer: `${BASE}images/bg/janken/summer.png`,
  autumn: `${BASE}images/bg/janken/autumn.png`,
  winter: `${BASE}images/bg/janken/winter.png`,
};
const getSeasonKey = (d = new Date()) => {
  const m = d.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
};

// ---- タイミング ----
const T = { afterPon: 600, cpuThink: 900, judgePause: 800 };

// ---- バイブ ----
const VIB = { short: 80, win: [180,80,180], good: [200] };
const buzz = (pat) => { try { if ("vibrate" in navigator) navigator.vibrate(pat); } catch {} };

// ---- ジャンケン ----
const HANDS = ["gu", "choki", "pa"];
const HAND_LABEL = { gu: "グー", choki: "チョキ", pa: "パー" };
const HandIcon = ({ hand, className="w-16 h-16 md:w-24 md:h-24" }) =>
  <img src={`/images/janken/${hand}.png`} alt={HAND_LABEL[hand]} className={className} draggable={false} />;

// ---- 小物UI ----
function Section({ title, children }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}
const sleep = (ms) => new Promise(r=>setTimeout(r,ms));

function PlayerPanel({ side="enemy", name, hand, question, extra, cpuAnswer }) {
  const isEnemy = side==="enemy";
  return (
    <div className={`rounded-xl border p-3 md:p-4 ${isEnemy?"bg-gray-50":"bg-blue-50"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold">{name}</div>
        <div className="text-xs text-gray-500">{hand?`手: ${HAND_LABEL[hand]}`:"手: - "}</div>
      </div>
      <div className="flex items-center justify-center min-h-[88px] md:min-h-[112px]">
        {hand ? <HandIcon hand={hand}/> : <div className="text-gray-400">待機中…</div>}
      </div>
      {question && <div className="mt-2 text-sm">問題: {question}</div>}
      {typeof cpuAnswer!=="undefined" && (
        <div className="mt-2 text-sm">回答結果: {cpuAnswer ? "正解⭕" : "不正解❌"}</div>
      )}
      {extra}
    </div>
  );
}

// ---- メイン ----
export default function BattlePage() {
  const nav = useNavigate();
  const [uid,setUid] = useState(null);
  const [tickets,setTickets] = useState(0);
  const [checking,setChecking] = useState(true);
  const [rounds,setRounds] = useState([]);
  const [winner,setWinner] = useState(null);
  const [result,setResult] = useState(null);
  const [selMyHand,setSelMyHand] = useState(null);
  const [cpuHand,setCpuHand] = useState(null);
  const [qobj,setQobj] = useState(null);
  const [revealHands,setRevealHands] = useState(false);

  // 認証
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if (!u) { nav("/login"); return; }
      setUid(u.uid);
      try {
        const ref = doc(db,"users",u.uid);
        const snap = await getDoc(ref);
        let data = snap.exists()?snap.data():null;
        if (!data) {
          data = { battleTickets:3, __dateKey:jpDateKey() };
          await setDoc(ref,data,{merge:true});
        }
        setTickets(data.battleTickets ?? 3);
      } finally {
        setChecking(false);
      }
    });
    return ()=>unsub();
  },[nav]);

  if (checking) {
    return <div className="p-4">確認中…</div>;
  }

  // 表示用
  const enemyCpuAnswer = typeof cpuHand==="boolean" ? cpuHand : undefined;
  const hideHandsDuringQuestion = !!(qobj && (result==="userWin" || result==="opponentWin"));
  const showHandEnemy = (!hideHandsDuringQuestion) && (revealHands ? cpuHand : null);
  const showHandMe    = (!hideHandsDuringQuestion) && (revealHands ? selMyHand : null);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Battle</h1>
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Home</Link>
      </div>

      <Section title="バトル券">
        <div>残り: {tickets}</div>
        <button onClick={()=>setTickets(3)} className="border px-3 py-1 rounded">回復</button>
      </Section>

      <Section title="対戦">
        <div className="grid grid-cols-1 gap-4">
          <PlayerPanel side="enemy" name="相手" hand={showHandEnemy}/>
          <PlayerPanel side="me" name="あなた" hand={showHandMe}/>
        </div>
      </Section>
    </div>
  );
}
