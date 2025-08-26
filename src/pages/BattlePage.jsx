// src/pages/BattlePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc, query, where, getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { pickGachaMode, levelWeights, weightedPick, jpDateKey } from "@/utils/battleUtils";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

function Section({ title, children }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

/** CPU正誤の簡易モデル（MVP）
 * 本格的には相手ユーザーの履歴から推定。いまは難易度で補正した確率で判定。
 */
function cpuAnswerCorrect(level) {
  const base = 0.6; // ベース正解率
  const adj = level === 3 ? -0.15 : level === 2 ? 0 : 0.1;
  const p = Math.min(0.95, Math.max(0.05, base + adj));
  return Math.random() < p;
}

export default function BattlePage() {
  const nav = useNavigate();
  const [uid, setUid] = useState(null);
  const [tickets, setTickets] = useState(0);
  const [checking, setChecking] = useState(true);

  // 進行状態
  const [state, setState] = useState("idle"); // idle|janken|question|end
  const [mode, setMode] = useState(null);     // 80/50/30 など
  const [rounds, setRounds] = useState([]);   // [{question, level, janken, asker, cpuAnswerCorrect, resolved}]
  const [winner, setWinner] = useState(null); // user|opponent|draw
  const [busy, setBusy] = useState(false);

  // ログイン＆チケット初期化
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { nav("/login"); return; }
      setUid(u.uid);
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      let data = snap.exists() ? snap.data() : null;
      if (!data) {
        data = { battleTickets: 3, ticketsUpdatedAt: serverTimestamp(), __dateKey: jpDateKey() };
        await setDoc(ref, data, { merge: true });
      }

      const today = jpDateKey(new Date());
      let currentTickets = data.battleTickets ?? 3;
      let updatedKey = data.__dateKey ?? today;
      if (updatedKey !== today) {
        currentTickets = 3;
        updatedKey = today;
        await updateDoc(ref, {
          battleTickets: currentTickets,
          ticketsUpdatedAt: serverTimestamp(),
          __dateKey: updatedKey,
        });
      }
      setTickets(currentTickets);
      setChecking(false);
    });
    return () => unsub();
  }, [nav]);

  // チケット操作
  async function consumeTicket() {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { battleTickets: tickets - 1, ticketsUpdatedAt: serverTimestamp() });
    setTickets((t) => t - 1);
  }
  async function recoverTickets() {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { battleTickets: 3, ticketsUpdatedAt: serverTimestamp() });
    setTickets(3);
    alert("チケットが全回復しました！（デモ）");
  }

  // じゃんけん
  function doJanken(userHand) {
    const hands = ["gu", "choki", "pa"];
    const house = hands[Math.floor(Math.random() * 3)];
    if (userHand === house) return { result: "draw", house };
    const win =
      (userHand === "gu" && house === "choki") ||
      (userHand === "choki" && house === "pa") ||
      (userHand === "pa" && house === "gu");
    return { result: win ? "userWin" : "opponentWin", house };
  }

  // 問題抽選（MVP: 自分の mistakes から or ダミー）
  async function drawQuestion(level) {
    const q = query(collection(db, "mistakes"), where("userId", "==", uid));
    const snap = await getDocs(q);
    const all = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
    if (!all.length) {
      const samples = [
        { text: "3×7 は？", level: 1 },
        { text: "水の化学式は？", level: 1 },
        { text: "分数 3/4 と 2/3 どっちが大？", level: 2 },
        { text: "一次方程式 3x+2=11 の解は？", level: 2 },
        { text: "二次方程式 x^2-5x+6=0 の解は？", level: 3 },
      ];
      const pool = samples.filter(s => s.level === level);
      const pick = pool.length ? pool[Math.floor(Math.random()*pool.length)] : samples[0];
      return { question: pick.text, level: pick.level };
    }
    const picked = all[Math.floor(Math.random() * all.length)];
    const lv = picked.level ?? (1 + Math.floor(Math.random() * 3));
    const text = picked.question?.text ?? picked.q?.text ?? "(no question text)";
    return { question: text, level: lv };
  }

  // バトル開始
  async function startBattle() {
    if (tickets <= 0 || busy) return;
    setBusy(true);
    await consumeTicket();
    setRounds([]);
    setWinner(null);
    setMode(null);
    setState("janken");
    setBusy(false);
  }

  /** 1ターン（じゃんけん→出題者決定→ガチャ→出題→CPU判定）
   *  round を組み立て、nextRounds を返す。勝敗が付いたら resolvedWinner に "user"/"opponent" を返す。
   */
  async function playTurn(userHand) {
    const r = doJanken(userHand);
    if (r.result === "draw") {
      const round = { janken: "draw", asker: null, resolved: false };
      const nextRounds = [...rounds, round];
      setRounds(nextRounds);
      return { resolvedWinner: null, nextRounds };
    }

    const asker = r.result === "userWin" ? "user" : "opponent";

    const currentMode = mode ?? pickGachaMode();
    if (!mode) setMode(currentMode);

    const lv = weightedPick(levelWeights(currentMode));
    const q = await drawQuestion(lv);

    const ok = cpuAnswerCorrect(lv);
    const round = {
      janken: r.result,
      asker,
      question: q.question,
      level: q.level,
      cpuAnswerCorrect: ok,
      resolved: !ok, // CPUが不正解なら出題者の勝ち
    };

    const nextRounds = [...rounds, round];
    setRounds(nextRounds);

    return { resolvedWinner: round.resolved ? asker : null, nextRounds };
  }

  // ターン操作（最大3）
  async function onHand(hand) {
    if (busy) return;
    setBusy(true);

    const { resolvedWinner, nextRounds } = await playTurn(hand);

    if (resolvedWinner) {
      await finishBattle(resolvedWinner, nextRounds);
      setBusy(false);
      return;
    }

    // 引き分け（またはCPU正解）で決着付かず → 有効ラウンド数チェック
    const eff = nextRounds.filter(r => r.janken !== "draw");
    if (eff.length >= 3) {
      await finishBattle("draw", nextRounds);
    }
    setBusy(false);
  }

  async function finishBattle(w, roundsSnapshot = rounds) {
    const normalized = w === "draw" ? "draw" : (w === "user" ? "user" : "opponent");
    setWinner(normalized);
    setState("end");
    await addDoc(collection(db, "battles"), {
      userId: uid,
      opponentId: "cpu-sim",
      start: serverTimestamp(),
      end: serverTimestamp(),
      winner: normalized,
      gacha: { mode: mode ?? null },
      rounds: roundsSnapshot,
      createdAt: serverTimestamp(),
    });
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
          <div>残り：<span className="font-bold">{tickets}</span> / 3</div>
          <button onClick={recoverTickets} className="border px-3 py-1 text-sm rounded hover:bg-gray-50">
            広告視聴で全回復（デモ）
          </button>
        </div>
      </Section>

      <Section title="進行">
        {state === "idle" && (
          <div className="flex items-center gap-3">
            <button
              disabled={tickets<=0}
              onClick={startBattle}
              className={`border px-3 py-2 rounded ${tickets<=0 ? "opacity-50" : "hover:bg-gray-50"}`}
            >
              バトル開始（券を1消費）
            </button>
            {tickets<=0 && <div className="text-sm text-red-600">券が足りません</div>}
          </div>
        )}

        {(state === "idle" || state === "janken" || state === "question") && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">ジャンケンで出題者を決定</div>
            <div className="flex gap-2">
              <button onClick={()=>onHand("gu")} className="border px-3 py-1 rounded hover:bg-gray-50">グー</button>
              <button onClick={()=>onHand("choki")} className="border px-3 py-1 rounded hover:bg-gray-50">チョキ</button>
              <button onClick={()=>onHand("pa")} className="border px-3 py-1 rounded hover:bg-gray-50">パー</button>
            </div>
          </div>
        )}

        {mode && <div className="text-sm">バトルガチャ結果: <b>{mode}% モード</b></div>}

        {!!rounds.length && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">タイムライン</div>
            {rounds.map((r, i)=>(
              <div key={i} className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <div className={`rounded-lg p-2 border ${r.asker==="user" ? "bg-blue-50":"bg-gray-50"}`}>
                    <div className="text-xs text-gray-500">Round {i+1} / ジャンケン: {r.janken}</div>
                    <div className="text-sm">出題者: <b>{r.asker ?? "-"}</b></div>
                    <div className="text-sm">問題(Lv{r.level ?? "-" }): {r.question ?? "-"}</div>
                    <div className="text-sm">CPU解答: {r.cpuAnswerCorrect === undefined ? "-" : (r.cpuAnswerCorrect ? "正解⭕" : "不正解❌")}</div>
                    {r.resolved && <div className="text-sm font-semibold">→ 決着</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {state === "end" && (
          <div className="space-y-2">
            <div className="text-lg font-bold">
              結果：{winner==="draw" ? "引き分け" : (winner==="user" ? "あなたの勝ち！" : "相手の勝ち")}
            </div>
            <button
              onClick={()=>{ setState("idle"); setRounds([]); setMode(null); setWinner(null); }}
              className="border px-3 py-1 rounded hover:bg-gray-50"
            >
              もう一度
            </button>
          </div>
        )}
      </Section>

      <div className="text-xs text-gray-500">
        ※ MVP では CPUの強さは難易度で補正した確率で判定しています。後で「相手の履歴から傾向学習」に差し替え可。
      </div>
    </div>
  );
}
