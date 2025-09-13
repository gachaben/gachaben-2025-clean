// src/pages/BattlePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection, addDoc, serverTimestamp,
  doc, getDoc, setDoc,
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { onAuthStateChanged } from "firebase/auth";
import { jpDateKey } from "@/utils/battleUtils";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

// ---- 背景（今は未使用だが残しておく） ----
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

// ---- Mistake保存（uid必須） ----
async function recordMistake(q, userAnswer) {
  const uid = auth.currentUser?.uid;
  if (!uid) { console.warn("[mistake] skip: no currentUser"); return; }

  await addDoc(collection(db, "mistakes"), {
    uid,
    qid: q.id ?? null,
    subject: q.subject ?? "general",
    grade: q.grade ?? null,
    seriesId: q.seriesId ?? null,
    prompt: q.prompt ?? q.question ?? "",
    choices: Array.isArray(q.choices) ? q.choices : [],
    answerIndex: typeof q.answerIndex === "number" ? q.answerIndex : null,
    correctAnswer:
      q.correctAnswer ??
      (typeof q.answerIndex === "number" && q.choices ? q.choices[q.answerIndex] : null),
    userAnswer: userAnswer ?? null,
    wasCorrect: false,
    source: "battle",
    createdAt: serverTimestamp(),
  });
}

// ---- メイン ----
export default function BattlePage() {
  const nav = useNavigate();

  // 認証・券
  const [checking,setChecking] = useState(true);
  const [tickets,setTickets] = useState(0);

  // じゃんけん状態
  const [started,setStarted] = useState(false);
  const [myHand,setMyHand] = useState(null);
  const [cpuHand,setCpuHand] = useState(null);
  const [reveal,setReveal] = useState(false);
  const [judge,setJudge] = useState(null); // "userWin" | "opponentWin" | "draw" | null

  // 出題状態
  const [qobj,setQobj] = useState(null);
  const [myAnswer,setMyAnswer] = useState(null);

  // 認証 & users 初期化
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if (!u) { nav("/login"); return; }
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { battleTickets: 3, __dateKey: jpDateKey(), email: u.email ?? null }, { merge: true });
        setTickets(3);
      } else {
        setTickets(snap.data()?.battleTickets ?? 3);
      }
      setChecking(false);
    });
    return ()=>unsub();
  }, [nav]);

  // ① バトル開始
  function handleStart() {
    setStarted(true);
    setReveal(false);
    setJudge(null);
    setMyHand(null);
    setCpuHand(null);

    // デバッグ用の1問（ここに本番の出題取得ロジックを繋げればOK）
    setQobj({
      id: "dbg-1",
      subject: "math",
      prompt: "2 + 3 = ?",
      choices: ["4","5","6","7"],
      answerIndex: 1, // 正解は "5"
    });
    setMyAnswer(null);
  }

  // ② ぽん！
  function handlePon() {
    if (!myHand) return;
    const c = HANDS[Math.floor(Math.random()*3)];
    setCpuHand(c);
    setReveal(true);
    const win =
      (myHand==="gu" && c==="choki") ||
      (myHand==="choki" && c==="pa") ||
      (myHand==="pa" && c==="gu");
    const draw = myHand===c;
    setJudge(draw ? "draw" : win ? "userWin" : "opponentWin");
  }

  // ③ 答え合わせ（不正解なら mistakes 保存）
  async function checkMyAnswer() {
    if (!qobj || myAnswer==null) return;
    const correct = Number(myAnswer) === qobj.answerIndex;
    if (!correct) {
      try { await recordMistake(qobj, Number(myAnswer)); } catch(e) { console.error("recordMistake failed:", e); }
    }
    alert(correct ? "正解！" : "不正解→mistakesへ保存しました");
  }

  if (checking) return <div className="p-4">確認中…</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Battle</h1>
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Home</Link>
      </div>

      <Section title="バトル券">
        <div className="flex items-center gap-3">
          <div>残り: {tickets}</div>
          <button onClick={()=>setTickets(3)} className="border px-3 py-1 rounded">回復</button>
          <button onClick={handleStart} className="ml-auto px-3 py-1 rounded bg-black text-white">
            バトルする
          </button>
        </div>
      </Section>

      <Section title="対戦">
        {!started ? (
          <div className="text-gray-500">「バトルする」を押して開始</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {/* 相手 */}
              <div className="rounded-xl border p-3 bg-gray-50">
                <div className="font-bold mb-2">相手</div>
                <div className="min-h-[96px] flex items-center justify-center">
                  {reveal && cpuHand ? <HandIcon hand={cpuHand}/> : <div className="text-gray-400">待機中…</div>}
                </div>
              </div>

              {/* 自分 */}
              <div className="rounded-xl border p-3 bg-blue-50">
                <div className="font-bold mb-2">あなた</div>
                <div className="flex gap-3 items-center">
                  {HANDS.map(h=>(
                    <button key={h}
                      onClick={()=>setMyHand(h)}
                      className={`rounded border p-1 ${myHand===h ? "ring-2 ring-blue-500" : ""}`}>
                      <HandIcon hand={h} className="w-12 h-12"/>
                    </button>
                  ))}
                  <button onClick={handlePon}
                    className="ml-auto px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    disabled={!myHand}>
                    ぽん！
                  </button>
                </div>
                {!!judge && <div className="mt-2 text-sm">
                  判定: {judge==="draw" ? "あいこ" : judge==="userWin" ? "あなたの勝ち" : "相手の勝ち"}
                </div>}
              </div>
            </div>

            {/* 出題（簡易1問） */}
            {qobj && (
              <div className="mt-4 rounded-xl border p-3">
                <div className="font-semibold mb-2">問題: {qobj.prompt}</div>
                <div className="flex flex-wrap gap-2">
                  {qobj.choices.map((c,idx)=>(
                    <button key={idx}
                      onClick={()=>setMyAnswer(idx)}
                      className={`px-3 py-1 rounded border ${myAnswer===idx?"bg-blue-100 border-blue-400":"bg-white"}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <button
                  onClick={checkMyAnswer}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  disabled={myAnswer==null}
                >
                  答え合わせ
                </button>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
