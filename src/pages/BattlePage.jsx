// src/pages/BattlePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc, query, where, getDocs, onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { jpDateKey } from "@/utils/battleUtils";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

// ---- 背景（PNG想定） ----
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

// ---- タイミング（調整OK） ----
const T = {
  afterPon: 600,     // 「ポン！」押下後、勝敗テキストを出すまで
  cpuThink: 900,
  judgePause: 800,   // 「答え合わせ」解禁までの小休止
};

// ---- バイブ（対応端末のみ） ----
const VIB = {
  short: 80,                 // あいこ
  win: [180, 80, 180],       // 勝ち（長め）
  good: [200],               // 自分に有利なとき
};
const buzz = (pat) => {
  try { if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pat); } catch {}
};

// ---- ジャンケン ----
const HANDS = ["gu", "choki", "pa"];
const HAND_LABEL = { gu: "グー", choki: "チョキ", pa: "パー" };
const HandIcon = ({ hand, className = "w-16 h-16 md:w-24 md:h-24" }) =>
  <img src={`/images/janken/${hand}.png`} alt={HAND_LABEL[hand]} className={className} draggable={false} />;
const usePreloadJankenIcons = () => {
  useEffect(()=>{ HANDS.forEach(h => { const img = new Image(); img.src = `/images/janken/${h}.png`; }); },[]);
};
const doJanken = (userHand) => {
  const house = HANDS[Math.floor(Math.random()*3)];
  if (userHand === house) return { result: "draw", house };
  const win =
    (userHand === "gu" && house === "choki") ||
    (userHand === "choki" && house === "pa") ||
    (userHand === "pa" && house === "gu");
  return { result: win ? "userWin" : "opponentWin", house };
};

// ---- ガチャ（80/50/30） ----
const rollBattleGacha = () => (Math.random()<0.4?"80":Math.random()<0.5?"50":"30");
const levelWeightsByGacha = {
  "80": { 1: 5,  2: 15, 3: 80 },
  "50": { 1: 15, 2: 35, 3: 50 },
  "30": { 1: 30, 2: 40, 3: 30 },
};
function pickLevelByGacha(gacha) {
  const w = levelWeightsByGacha[gacha] || levelWeightsByGacha["50"];
  const sum = w[1] + w[2] + w[3];
  let r = Math.random()*sum;
  for (const lv of [1,2,3]) { if (r < w[lv]) return lv; r -= w[lv]; }
  return 2;
}

// ---- プロフ＆マッチング（安全：失敗→CPU） ----
async function getMyProfile(db, uid) {
  const snap = await getDoc(doc(db, "users", uid));
  const u = snap.data() || {};
  return { grade: typeof u.grade === "number" ? u.grade : 0, winRate: typeof u.winRate === "number" ? u.winRate : 0.5 };
}
async function pickOpponentWithMatch(db, myUid, my) {
  try {
    const allSnap = await getDocs(collection(db, "users"));
    const all = allSnap.docs.filter(d=>d.id!==myUid).map(d=>({id:d.id, ...(d.data()||{})}));
    const byGrade = all.filter(u => (u.grade ?? 0) === my.grade);
    const takeClose = (pool, delta) => {
      const lo = my.winRate-delta, hi = my.winRate+delta;
      const a = pool.filter(u => {
        const wr = typeof u.winRate === "number" ? u.winRate : 0.5;
        return wr>=lo && wr<=hi;
      }).sort((x,y)=>Math.abs((x.winRate??0.5)-my.winRate)-Math.abs((y.winRate??0.5)-my.winRate));
      if (!a.length) return null;
      return a[Math.floor(Math.random()*Math.min(a.length,10))].id;
    };
    return takeClose(byGrade,0.10) ?? takeClose(byGrade,0.20) ??
           (byGrade.length ? byGrade[Math.floor(Math.random()*byGrade.length)].id : null) ??
           (all.length ? all[Math.floor(Math.random()*all.length)].id : null);
  } catch { return null; }
}
async function loadOpponentAccuracy(db, opponentId) {
  try {
    const qy = query(collection(db, "mistakes"), where("userId","==",opponentId));
    const snap = await getDocs(qy);
    if (snap.empty) return {1:0.85,2:0.70,3:0.45};
    const c={1:0,2:0,3:0}; snap.forEach(d=>{const lv=d.data()?.level??2; if(c[lv]!=null) c[lv]++;});
    const total=c[1]+c[2]+c[3], s=Math.min(1,total/50);
    return {1:Math.max(0.5,0.92-0.25*s),2:Math.max(0.4,0.80-0.30*s),3:Math.max(0.25,0.65-0.35*s)};
  } catch { return {1:0.85,2:0.70,3:0.45}; }
}

// --- 演出コンポーネント ---
function ThinkingDots({ className = "" }) {
  return (
    <span className={`inline-flex gap-1 ${className}`} aria-label="thinking">
      <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></span>
    </span>
  );
}
function ProgressBar({ progress = 0 }) {
  return (
    <div className="w-56 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <div
        className="h-full bg-gray-700 transition-[width] duration-100 ease-linear"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
}

// ---- UI小物 ----
const Section = ({title, children}) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <div className="font-semibold mb-2">{title}</div>{children}
  </div>
);
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

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

// ---- 回答UI ----
function AnswerArea({ q, onSubmit }) {
  const [text, setText] = useState("");
  if (q?.choices?.length) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {q.choices.map((c,idx)=>(
          <button
            key={idx}
            onClick={()=>onSubmit({type:"choice", index: idx, value: c})}
            className="px-3 py-2 border rounded bg-white hover:bg-gray-50"
          >{c}</button>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={e=>setText(e.target.value)}
        className="flex-1 px-3 py-2 border rounded"
        placeholder="ここに回答を入力"
      />
      <button
        onClick={()=>onSubmit({type:"text", value: text})}
        className="px-3 py-2 border rounded bg-white hover:bg-gray-50"
      >回答する</button>
    </div>
  );
}

// ---- 出題（出題者の履歴から） ----
async function drawQuestionFrom(userId, gachaResult, lastQuestionId = null) {
  const wantLv = pickLevelByGacha(gachaResult);
  if (!userId) {
    const samples = [
      { id:"d1", text:"3×7 は？", level:1, choices:["20","21","24"], answerIndex:1 },
      { id:"d2", text:"水の化学式は？", level:1, choices:["H2O","CO2","NaCl"], answerIndex:0 },
      { id:"d3", text:"一次方程式 3x+2=11 の解は？", level:2, choices:["x=2","x=3","x=4"], answerIndex:1 },
      { id:"d4", text:"二次方程式 x^2-5x+6=0 の解は？", level:3, choices:["x=2,3","x=1,6","x=−2,3"], answerIndex:0 },
    ];
    const pool = samples.filter(s=>s.level===wantLv);
    const p = (pool.length?pool:samples)[Math.floor(Math.random()*(pool.length?pool.length:samples.length))];
    return { questionId:p.id, question:p.text, level:p.level, choices:p.choices, answerIndex:p.answerIndex };
  }

  const qy = query(collection(db, "mistakes"), where("userId","==",userId));
  const snap = await getDocs(qy);
  const all = snap.docs.map(d=>({ id:d.id, ...(d.data()||{}) }));
  const candidatesLv = all.filter(x => (x.level ?? 2) === wantLv && x.id !== lastQuestionId);
  const pickFrom = candidatesLv.length ? candidatesLv : all.filter(x=>x.id!==lastQuestionId);

  if (!pickFrom.length) {
    return drawQuestionFrom(null, gachaResult, null);
  }
  const p = pickFrom[Math.floor(Math.random()*pickFrom.length)];
  const text = p.question?.text ?? p.q?.text ?? p.text ?? "(no question text)";
  const lvl = p.level ?? wantLv;
  return { questionId:p.id, question:text, level:lvl };
}

export default function BattlePage() {
  const nav = useNavigate();
  const [uid, setUid] = useState(null);
  const [tickets, setTickets] = useState(0);
  const [checking, setChecking] = useState(true);
  const [revealHands, setRevealHands] = useState(false); // ポンするまで手を隠す

  // 出題フェーズ演出
  const [checkReady, setCheckReady] = useState(false);   // 「答え合わせ」ボタン解禁
  const [phaseProgress, setPhaseProgress] = useState(0); // プログレス表示用（0-100）

  const [state, setState] = useState("idle"); // idle|janken|end
  const [rounds, setRounds] = useState([]);
  const [winner, setWinner] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 演出
  const [isEvent, setIsEvent] = useState(false);
  const bgUrl = isEvent ? BG.event : BG[getSeasonKey()];
  const [banner, setBanner] = useState("");

  // 対戦相手
  const [opponentId, setOpponentId] = useState(null);
  const [opponentAcc, setOpponentAcc] = useState({1:0.85,2:0.7,3:0.45});

  // 進行中ラウンドの状態
  const [selMyHand, setSelMyHand] = useState(null);
  const [cpuHand, setCpuHand] = useState(null);
  const [result, setResult] = useState(null);        // "userWin" | "opponentWin" | "draw"
  const [showPonBtn, setShowPonBtn] = useState(false);
  const [gacha, setGacha] = useState(null);
  const [qobj, setQobj] = useState(null);            // {questionId, question, level, choices?, answerIndex?}
  const [cpuAnswer, setCpuAnswer] = useState(undefined);
  const [lastQuestionId, setLastQuestionId] = useState(null);

  // 出題フェーズの二段階用ステート
  const [enemyHasAnswered, setEnemyHasAnswered] = useState(false);     // 相手の解答が完了（未採点）
  const [plannedCpuCorrect, setPlannedCpuCorrect] = useState(null);    // 相手の予定結果（未公開）
  const [myHasAnswered, setMyHasAnswered] = useState(false);           // 自分が回答済み（未採点）
  const [myPendingAnswer, setMyPendingAnswer] = useState(null);        // 自分の回答保持（未採点）

  usePreloadJankenIcons();

  // 認証＆初期化
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { nav("/login"); return; }
      setUid(u.uid);
      try {
        const ref = doc(db,"users",u.uid);
        const snap = await getDoc(ref);
        let data = snap.exists()?snap.data():null;
        if (!data) {
          data = { battleTickets:3, ticketsUpdatedAt:serverTimestamp(), __dateKey:jpDateKey(), grade:0, winRate:0.5 };
          await setDoc(ref, data, { merge:true });
        }
        const today = jpDateKey(new Date());
        let currentTickets = data.battleTickets ?? 3;
        let updatedKey = data.__dateKey ?? today;
        if (updatedKey !== today) {
          currentTickets = 3; updatedKey = today;
          await updateDoc(ref, { battleTickets:currentTickets, ticketsUpdatedAt:serverTimestamp(), __dateKey:updatedKey });
        }
        setTickets(currentTickets);
      } catch (e) { setErrorMsg(String(e?.message||e)); }
      finally { setChecking(false); }
    });
    return () => unsub();
  }, [nav]);

  // イベントフラグ
  useEffect(()=> {
    let unsub = () => {};
    try {
      const ref = doc(db,"settings","general");
      unsub = onSnapshot(ref, s=>setIsEvent(!!(s.data()?.isEvent)), ()=>setIsEvent(false));
    } catch { setIsEvent(false); }
    return () => unsub();
  },[]);

  // CPU正誤
  const cpuAnswerCorrect = (level) => {
    const base = opponentAcc[level] ?? 0.6;
    const p = Math.min(0.98, Math.max(0.05, base + (isEvent?0.03:0)));
    return Math.random() < p;
  };

  // バトル開始
  async function startBattle() {
    if (tickets<=0 || busy) return;
    setBusy(true);
    try {
      const uref = doc(db,"users",uid);
      const usnap = await getDoc(uref);
      if (!usnap.exists()) {
        await setDoc(uref, { battleTickets:3, ticketsUpdatedAt:serverTimestamp(), __dateKey:jpDateKey(), grade:0, winRate:0.5 }, { merge:true });
      }
      await updateDoc(uref, { battleTickets:tickets-1, ticketsUpdatedAt:serverTimestamp() });
      setTickets(t=>t-1);

      const my = await getMyProfile(db, uid);
      const oid = await pickOpponentWithMatch(db, uid, my);
      setOpponentId(oid);
      const acc = oid ? await loadOpponentAccuracy(db, oid) : {1:0.8,2:0.65,3:0.4};
      setOpponentAcc(acc);

      // リセット
      setRounds([]); setWinner(null); setState("janken");
      setSelMyHand(null); setCpuHand(null); setResult(null);
      setShowPonBtn(false); setGacha(null); setQobj(null); setCpuAnswer(undefined);
      setBanner(""); setLastQuestionId(null); setRevealHands(false);

      setEnemyHasAnswered(false); setPlannedCpuCorrect(null);
      setMyHasAnswered(false); setMyPendingAnswer(null);
      setCheckReady(false); setPhaseProgress(0);
    } catch (e) {
      setErrorMsg(String(e?.message||e));
      alert(`バトル開始に失敗しました。\n${String(e?.message||e)}`);
    } finally { setBusy(false); }
  }

  // 手選択
  function onSelectHand(hand) {
    if (busy || state!=="janken") return;
    setSelMyHand(hand);
    setShowPonBtn(true);
    setRevealHands(false);
  }

  // ポン → 同時表示 → 勝敗
  async function onPon() {
    if (!selMyHand || busy) return;
    setBusy(true);
    const r = doJanken(selMyHand);
    setCpuHand(r.house);
    setRevealHands(true);

    if (r.result==="userWin") buzz(VIB.win);
    else if (r.result==="draw") buzz(VIB.short);

    setShowPonBtn(false);
    setBanner("ポン！");
    await sleep(T.afterPon);
    setBanner(r.result==="userWin" ? "あなたの勝ち！" : r.result==="draw" ? "あいこ！" : "相手の勝ち…");
    setResult(r.result);
    setBusy(false);
  }

  // あいこ → 再ジャンケン
  function retryJanken() {
    setSelMyHand(null); setCpuHand(null); setResult(null);
    setShowPonBtn(false); setGacha(null); setQobj(null);
    setCpuAnswer(undefined); setBanner(""); setRevealHands(false);

    setEnemyHasAnswered(false); setPlannedCpuCorrect(null);
    setMyHasAnswered(false); setMyPendingAnswer(null);
    setCheckReady(false); setPhaseProgress(0);
  }

  // 「問題へ」
  async function toQuestion() {
    if (!result || busy) return;
    if (result==="draw") {
      setRounds(prev => [...prev, { janken:"draw", asker:null, resolved:false, myHand:selMyHand, cpuHand }]);
      setSelMyHand(null); setCpuHand(null); setResult(null); setBanner("");
      setShowPonBtn(false); setGacha(null); setQobj(null); setCpuAnswer(undefined);
      setRevealHands(false);
      setEnemyHasAnswered(false); setPlannedCpuCorrect(null);
      setMyHasAnswered(false); setMyPendingAnswer(null);
      setCheckReady(false); setPhaseProgress(0);
      return;
    }

    setBusy(true);
    setBanner("バトルガチャ…");
    const g = rollBattleGacha();
    setGacha(g);
    const askerId = result==="userWin" ? uid : opponentId;
    const q = await drawQuestionFrom(askerId, g, lastQuestionId);
    setQobj(q);
    setLastQuestionId(q.questionId);
    setBanner(result==="userWin" ? "あなたが出題！" : "相手が出題！");
    setBusy(false);
  }

  // 自分が出題 → 相手の解答（演出つき）
  async function enemyAnswer() {
    if (busy || !qobj || result!=="userWin" || enemyHasAnswered) return;
    setBusy(true);
    setBanner("相手が考え中…");
    setCheckReady(false);
    setPhaseProgress(0);

    // プログレス
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / T.cpuThink) * 100);
      setPhaseProgress(p);
    }, 100);

    await sleep(T.cpuThink);
    clearInterval(tick);
    setPhaseProgress(100);

    // 正誤を保持（まだ公開しない）
    const ok = cpuAnswerCorrect(qobj.level);
    setPlannedCpuCorrect(ok);
    setEnemyHasAnswered(true);

    // 採点前の一呼吸
    await sleep(T.judgePause);
    setCheckReady(true);
    setBusy(false);
    setBanner("");
  }

  async function checkEnemyAnswer() {
    if (!enemyHasAnswered || plannedCpuCorrect === null || busy) return;
    setBusy(true);

    const ok = plannedCpuCorrect;
    setCpuAnswer(ok);                 // ここで公開
    if (!ok) buzz(VIB.good);          // 自分に有利 → バイブ

    const committed = {
      janken: "userWin",
      asker: "user",
      gacha,
      questionId: qobj.questionId,
      question: qobj.question,
      level: qobj.level,
      cpuAnswerCorrect: ok,
      userAnswerCorrect: undefined,
      resolved: !ok,
      myHand: selMyHand,
      cpuHand,
    };
    const nextRounds = [...rounds, committed];
    setRounds(nextRounds);
    setBanner(ok ? "正解…" : "不正解！");

    const eff = nextRounds.filter(r=>r.janken!=="draw");
    const resolvedWinner = committed.resolved ? "user" : null;
    await sleep(400);
    if (resolvedWinner || eff.length >= 3) {
      await finishBattle(resolvedWinner || "draw", nextRounds);
    } else {
      // 次ラウンドへ
      setSelMyHand(null); setCpuHand(null); setResult(null);
      setShowPonBtn(false); setGacha(null); setQobj(null); setCpuAnswer(undefined);
      setBanner(""); setRevealHands(false);
      setEnemyHasAnswered(false); setPlannedCpuCorrect(null);
      setMyHasAnswered(false); setMyPendingAnswer(null);
      setCheckReady(false); setPhaseProgress(0);
    }
    setBusy(false);
  }

  // 相手が出題 → 自分の解答（演出つき）
  function submitMyAnswer(ans) {
    if (busy || !qobj || result!=="opponentWin" || myHasAnswered) return;
    setMyPendingAnswer(ans);
    setMyHasAnswered(true);
    setCheckReady(false);
    setPhaseProgress(0);
    setBanner("");

    // 軽い演出タイマー
    const total = Math.max(600, T.judgePause);
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / total) * 100);
      setPhaseProgress(p);
    }, 100);

    (async () => {
      await sleep(total);
      clearInterval(tick);
      setPhaseProgress(100);
      setCheckReady(true);
    })();
  }

  async function checkMyAnswer() {
    if (!myHasAnswered || !qobj || busy || result!=="opponentWin") return;
    setBusy(true);

    // 採点（サンプルのみ厳密 / Firestoreは採点不可→正解扱い）
    let correct = true;
    if (Array.isArray(qobj.choices) && typeof qobj.answerIndex==="number") {
      correct = myPendingAnswer?.type==="choice" && myPendingAnswer.index === qobj.answerIndex;
    } else if (typeof qobj.answer === "string") {
      correct = (String(myPendingAnswer?.value||"").trim() === qobj.answer.trim());
    }
    if (correct) buzz(VIB.good); // 自分が正解＝自分に有利 → バイブ

    const committed = {
      janken: "opponentWin",
      asker: "opponent",
      gacha,
      questionId: qobj.questionId,
      question: qobj.question,
      level: qobj.level,
      cpuAnswerCorrect: undefined,
      userAnswerCorrect: correct,
      resolved: !correct, // 自分がミスったら相手の勝ちで決着
      myHand: selMyHand,
      cpuHand,
    };
    const nextRounds = [...rounds, committed];
    setRounds(nextRounds);
    setBanner(correct ? "正解！" : "不正解…");

    const eff = nextRounds.filter(r=>r.janken!=="draw");
    const resolvedWinner = committed.resolved ? "opponent" : null;
    await sleep(400);
    if (resolvedWinner || eff.length >= 3) {
      await finishBattle(resolvedWinner || "draw", nextRounds);
    } else {
      // 次ラウンドへ
      setSelMyHand(null); setCpuHand(null); setResult(null);
      setShowPonBtn(false); setGacha(null); setQobj(null); setCpuAnswer(undefined);
      setBanner(""); setRevealHands(false);
      setEnemyHasAnswered(false); setPlannedCpuCorrect(null);
      setMyHasAnswered(false); setMyPendingAnswer(null);
      setCheckReady(false); setPhaseProgress(0);
    }
    setBusy(false);
  }

  async function finishBattle(w, roundsSnapshot = rounds) {
    const normalized = w==="draw" ? "draw" : (w==="user" ? "user" : "opponent");
    setWinner(normalized);
    setState("end");
    await addDoc(collection(db,"battles"),{
      userId: uid,
      opponentId: opponentId || "cpu-sim",
      start: serverTimestamp(),
      end: serverTimestamp(),
      winner: normalized,
      rounds: roundsSnapshot,
      createdAt: serverTimestamp(),
    });
    setBanner("");
  }

  if (checking) return <div className="p-4">確認中…</div>;

  // 表示用
  const enemyCpuAnswer = typeof cpuAnswer==="boolean" ? cpuAnswer : undefined;

  // 出題フェーズ中は手を隠す
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
        <div className="flex items-center gap-3">
          <div>残り：<span className="font-bold">{tickets}</span> / 3</div>
          <button
            onClick={async ()=>{
              if (!uid) return;
              await updateDoc(doc(db,"users",uid), { battleTickets:3, ticketsUpdatedAt:serverTimestamp() });
              setTickets(3);
              alert("チケットが全回復しました！（デモ）");
            }}
            className="border px-3 py-1 text-sm rounded hover:bg-gray-50"
          >広告視聴で全回復（デモ）</button>
          {state==="idle" && (
            <button
              disabled={tickets<=0}
              onClick={startBattle}
              className={`border px-3 py-2 rounded ${tickets<=0?"opacity-50":"hover:bg-gray-50"}`}
            >バトル開始（券を1消費）</button>
          )}
        </div>
        {!!errorMsg && <div className="mt-2 text-xs text-red-600 break-all">エラー: {errorMsg}</div>}
      </Section>

      <Section title="対戦">
        <div className="text-xs text-gray-600 mb-1">対戦相手: {opponentId ?? "未決定（開始で自動抽選）"}</div>

        <div
          className="relative rounded-2xl p-3 md:p-4 border shadow-inner bg-center bg-cover overflow-hidden isolate"
          style={{ backgroundImage:`url(${bgUrl})` }}
        >
          <div className="absolute inset-0 z-0 bg-white/25 pointer-events-none" />

          {/* 勝敗などのバナー（カード間のやや下） */}
          {banner && (
            <div className="absolute inset-x-0 z-30 flex items-center justify-center pointer-events-none"
                 style={{ top: "55%", transform: "translateY(-50%)" }}>
              <div className="px-5 py-2 rounded-full bg-black/70 backdrop-blur text-white text-xl md:text-2xl font-bold tracking-widest">
                {banner}
              </div>
            </div>
          )}

          {/* 見出し「ジャンケン」＋ 右にポンボタン */}
          {state === "janken" && (
            <div className="mb-2 flex items-center justify-center gap-3">
              <div className="text-2xl md:text-3xl font-extrabold tracking-widest drop-shadow">ジャンケン</div>
              <button
                type="button"
                onClick={onPon}
                disabled={!selMyHand || busy || !showPonBtn}
                className={`px-5 py-2 rounded-full border shadow bg-white hover:bg-gray-50
                            ${(!selMyHand || busy || !showPonBtn) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ポン！
              </button>
            </div>
          )}

          {/* 上下パネル */}
          <div className="relative z-10 grid grid-rows-[1fr_auto_1fr] gap-10">
            <PlayerPanel
              side="enemy"
              name="相手（他ユーザー）"
              hand={showHandEnemy}
              question={result==="opponentWin" ? qobj?.question : undefined}
              cpuAnswer={result==="userWin" ? enemyCpuAnswer : undefined}
            />
            <div className="h-1" />
            <PlayerPanel
              side="me"
              name="あなた"
              hand={showHandMe}
              question={result==="userWin" ? qobj?.question : undefined}
              extra={
                (state==="janken" && result==="opponentWin" && qobj && !myHasAnswered)
                  ? <AnswerArea q={qobj} onSubmit={submitMyAnswer}/>
                  : null
              }
            />
          </div>
        </div>
      </Section>

      {state==="janken" && (
        <Section title="進行">
          {/* 手を選ぶ */}
          {!selMyHand && (
            <>
              <div className="text-sm text-gray-600 mb-2">
                ジャンケンの手を選んでね（「ポン！」を押すと同時に両方の手が表示されます）
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                {HANDS.map(h=>(
                  <button
                    key={h}
                    onClick={()=>onSelectHand(h)}
                    className="rounded-xl p-2 md:p-3 border shadow bg-white/85 backdrop-blur hover:bg-white disabled:opacity-50"
                    disabled={busy}
                  >
                    <HandIcon hand={h}/><div className="mt-1 text-center text-sm md:text-base">{HAND_LABEL[h]}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* 「問題へ」ボタン（勝敗表示後） */}
          {!!selMyHand && !!cpuHand && result && (
            <div className="mt-3 flex justify-center relative z-10 pointer-events-auto">
              {result === "draw" ? (
                <button
                  type="button"
                  onClick={retryJanken}
                  className="px-4 py-2 rounded-lg border shadow bg-white hover:bg-gray-50"
                >
                  あいこで もう一度
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toQuestion}
                  className="px-4 py-2 rounded-lg border shadow bg-white hover:bg-gray-50"
                >
                  問題へ
                </button>
              )}
            </div>
          )}

          {/* 自分が出題（userWin） → 二段階UI */}
          {result === "userWin" && qobj && (
            <div className="mt-3 flex flex-col items-center gap-3 relative z-10 pointer-events-auto">
              <div className="text-sm text-gray-700">ガチャ: <b>{gacha}%</b> / Lv{qobj.level}</div>

              {!enemyHasAnswered ? (
                <button
                  type="button"
                  onClick={enemyAnswer}
                  disabled={busy}
                  className="px-4 py-2 rounded-lg border shadow bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  相手の解答
                </button>
              ) : (
                <>
                  {!checkReady ? (
                    <div className="flex flex-col items-center gap-2">
                      <ThinkingDots />
                      <ProgressBar progress={phaseProgress} />
                      <div className="text-xs text-gray-500">採点準備中…</div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={checkEnemyAnswer}
                      disabled={busy}
                      className="px-4 py-2 rounded-lg border shadow bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      答え合わせ
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* 相手が出題（opponentWin） → 二段階UI */}
          {result==="opponentWin" && qobj && (
            <div className="mt-3 flex flex-col items-center gap-3">
              <div className="text-sm text-gray-700">ガチャ: <b>{gacha}%</b> / Lv{qobj.level}</div>

              {!myHasAnswered ? (
                <div className="w-full max-w-md">
                  <AnswerArea q={qobj} onSubmit={submitMyAnswer}/>
                </div>
              ) : (
                <>
                  {!checkReady ? (
                    <div className="flex flex-col items-center gap-2">
                      <ThinkingDots />
                      <ProgressBar progress={phaseProgress} />
                      <div className="text-xs text-gray-500">採点準備中…</div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={checkMyAnswer}
                      disabled={busy}
                      className="px-4 py-2 rounded-lg border shadow bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      答え合わせ
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </Section>
      )}

      {!!rounds.length && (
        <Section title="タイムライン">
          <div className="space-y-2">
            {[...rounds].slice().reverse().map((r,i)=>(
              <div key={i} className="rounded-lg p-2 border bg-gray-50">
                <div className="text-xs text-gray-500">
                  Round {i+1} / ジャンケン: {r.janken} / 出題者: <b>{r.asker??"-"}</b> / ガチャ: {r.gacha??"-"}%
                </div>
                <div className="text-xs text-gray-600">
                  あなた: {r.myHand ? HAND_LABEL[r.myHand]:"-"} / 相手: {r.cpuHand ? HAND_LABEL[r.cpuHand]:"-"}
                </div>
                <div className="text-sm">問題(Lv{r.level??"-"}): {r.question??"-"}</div>
                {typeof r.cpuAnswerCorrect==="boolean" && (
                  <div className="text-sm">CPU解答: {r.cpuAnswerCorrect ? "正解⭕":"不正解❌"}</div>
                )}
                {typeof r.userAnswerCorrect==="boolean" && (
                  <div className="text-sm">あなたの解答: {r.userAnswerCorrect ? "正解⭕":"不正解❌"}</div>
                )}
                {r.resolved && <div className="text-sm font-semibold">→ 決着（{r.asker==="user"?"あなた":"相手"}のポイント）</div>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {state==="end" && (
        <Section title="結果">
          <div className="space-y-2">
            <div className="text-lg font-bold">
              {winner==="draw" ? "引き分け" : (winner==="user" ? "あなたの勝ち！" : "相手の勝ち")}
            </div>
            <button
              onClick={()=>{
                setState("idle");
                setRounds([]); setWinner(null);
                setSelMyHand(null); setCpuHand(null); setResult(null);
                setShowPonBtn(false); setGacha(null); setQobj(null); setCpuAnswer(undefined);
                setBanner(""); setLastQuestionId(null); setRevealHands(false);

                setEnemyHasAnswered(false); setPlannedCpuCorrect(null);
                setMyHasAnswered(false); setMyPendingAnswer(null);
                setCheckReady(false); setPhaseProgress(0);
              }}
              className="border px-3 py-1 rounded hover:bg-gray-50"
            >もう一度</button>
          </div>
        </Section>
      )}

      <div className="text-xs text-gray-500">
        ※ 流れ：①手選択 → ②「ポン！」で両者の手が同時表示 → ③勝敗表示 → ④出題／回答（各2段階：解答→答え合わせ）。<br/>
        自分に有利な結果（相手不正解・自分正解）のときにバイブします。
      </div>
    </div>
  );
}
