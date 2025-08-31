[1mdiff --git a/src/pages/ReviewPlayPage.jsx b/src/pages/ReviewPlayPage.jsx[m
[1mindex 1377989..c9dfe41 100644[m
[1m--- a/src/pages/ReviewPlayPage.jsx[m
[1m+++ b/src/pages/ReviewPlayPage.jsx[m
[36m@@ -1,154 +1,262 @@[m
[31m-import React, { useEffect, useState, useRef } from "react";[m
[31m-import { useLocation, useNavigate } from "react-router-dom";[m
[32m+[m[32m// src/pages/ReviewPlayPage.jsx[m
[32m+[m[32mimport React, { useEffect, useMemo, useState } from "react";[m
[32m+[m[32mimport { useNavigate, useParams } from "react-router-dom";[m
 import { getFirebaseAuth } from "@/fbkit";[m
[31m-import { db } from "@/fbkit";[m
[31m-import {[m
[31m-  collection, doc, getDoc,[m
[31m-  writeBatch, addDoc, serverTimestamp[m
[31m-} from "firebase/firestore";[m
[31m-[m
[31m-// 各ビュー[m
[31m-import McqView from "@/components/review/McqView";[m
[31m-import KeypadView from "@/components/review/KeypadView";[m
[32m+[m[32mimport { db } from "@/fbkit";[m
[32m+[m[32mimport { doc, getDoc } from "firebase/firestore";[m
 import SequenceView from "@/components/review/SequenceView";[m
[31m-import TextInputView from "@/components/review/TextInputView";[m
[32m+[m[32mimport GroupView from "@/components/review/GroupView";[m
 [m
[31m-// 出題タイプごとのレジストリ[m
[31m-const registry = {[m
[31m-  mcq: McqView,[m
[31m-  keypad: KeypadView,[m
[31m-  sequence: SequenceView,[m
[31m-  text: TextInputView,[m
[31m-};[m
[32m+[m[32m/* =========================[m
[32m+[m[32m   子コンポーネント（外に出す）[m
[32m+[m[32m   ========================= */[m
[32m+[m[32mfunction MCQView({ text, options = [], answer, setDebugYou, isCorrectAnswer, onCorrect, onWrong }) {[m
[32m+[m[32m  const [picked, setPicked] = useState(null);[m
 [m
[32m+[m[32m  const labelOf = (op) => String(op?.label ?? op?.value ?? op);[m
[32m+[m
[32m+[m[32m  const handlePick = (idx) => {[m
[32m+[m[32m    const lbl = labelOf(options[idx]);[m
[32m+[m[32m    console.log("[MCQ] pick:", idx, lbl);[m
[32m+[m[32m    setPicked(idx);[m
[32m+[m[32m    setDebugYou(lbl);[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  const confirm = () => {[m
[32m+[m[32m    console.log("[MCQ] confirm clicked. picked =", picked);[m
[32m+[m[32m    if (picked == null) return;[m
[32m+[m[32m    const you = labelOf(options[picked]);[m
[32m+[m[32m    console.log("[MCQ] you=", you, "answer=", answer);[m
[32m+[m[32m    setDebugYou(you);[m
[32m+[m[32m    isCorrectAnswer(you, answer) ? onCorrect() : onWrong();[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  const isDisabled = picked == null;[m
[32m+[m
[32m+[m[32m  return ([m
[32m+[m[32m    <div className="space-y-3">[m
[32m+[m[32m      <div className="text-lg font-semibold mb-2">{text}</div>[m
[32m+[m
[32m+[m[32m      <div className="flex flex-col gap-2" role="radiogroup" aria-label="choices">[m
[32m+[m[32m        {options.map((op, idx) => {[m
[32m+[m[32m          const label = labelOf(op);[m
[32m+[m[32m          const active = picked === idx;[m
[32m+[m[32m          return ([m
[32m+[m[32m            <button[m
[32m+[m[32m              key={idx}[m
[32m+[m[32m              type="button"[m
[32m+[m[32m              role="radio"[m
[32m+[m[32m              aria-checked={active}[m
[32m+[m[32m              onClick={() => handlePick(idx)}[m
[32m+[m[32m              className={`px-3 py-2 rounded-md border text-left ${active ? "ring-2 ring-offset-1" : ""}`}[m
[32m+[m[32m            >[m
[32m+[m[32m              {label}[m
[32m+[m[32m            </button>[m
[32m+[m[32m          );[m
[32m+[m[32m        })}[m
[32m+[m[32m      </div>[m
[32m+[m
[32m+[m[32m      <button[m
[32m+[m[32m        type="button"[m
[32m+[m[32m        onClick={confirm}[m
[32m+[m[32m        disabled={isDisabled}[m
[32m+[m[32m        aria-disabled={isDisabled}[m
[32m+[m[32m        className={`px-4 py-2 rounded-md border mt-2 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}[m
[32m+[m[32m      >[m
[32m+[m[32m        確定[m
[32m+[m[32m      </button>[m
[32m+[m
[32m+[m[32m      <div className="text-xs opacity-70 mt-1">[m
[32m+[m[32m        picked: <code>{String(picked)}</code>[m
[32m+[m[32m      </div>[m
[32m+[m[32m    </div>[m
[32m+[m[32m  );[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mfunction TextView({ text, answer, setDebugYou, isCorrectAnswer, onCorrect, onWrong }) {[m
[32m+[m[32m  const [val, setVal] = useState("");[m
[32m+[m[32m  const confirm = () => (isCorrectAnswer(val, answer) ? onCorrect() : onWrong());[m
[32m+[m[32m  return ([m
[32m+[m[32m    <div className="space-y-3">[m
[32m+[m[32m      <div className="text-lg font-semibold mb-2">{text}</div>[m
[32m+[m[32m      <input[m
[32m+[m[32m        type="text"[m
[32m+[m[32m        value={val}[m
[32m+[m[32m        onChange={(e) => {[m
[32m+[m[32m          setVal(e.target.value);[m
[32m+[m[32m          setDebugYou(e.target.value);[m
[32m+[m[32m        }}[m
[32m+[m[32m        className="px-3 py-2 rounded-md border w-full"[m
[32m+[m[32m        placeholder="ここに入力"[m
[32m+[m[32m      />[m
[32m+[m[32m      <button[m
[32m+[m[32m        type="button"[m
[32m+[m[32m        onClick={confirm}[m
[32m+[m[32m        disabled={!val}[m
[32m+[m[32m        className={`px-4 py-2 rounded-md border ${!val ? "opacity-50 cursor-not-allowed" : ""}`}[m
[32m+[m[32m      >[m
[32m+[m[32m        確定[m
[32m+[m[32m      </button>[m
[32m+[m[32m    </div>[m
[32m+[m[32m  );[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/* =========================[m
[32m+[m[32m   親コンポーネント[m
[32m+[m[32m   ========================= */[m
 export default function ReviewPlayPage() {[m
[31m-  const { state } = useLocation();[m
[32m+[m[32m  const { mid } = useParams();[m
   const navigate = useNavigate();[m
[32m+[m[32m  const uid = getAuth().currentUser?.uid;[m
 [m
[31m-  const passedIds = Array.isArray(state?.ids) ? state.ids.filter(Boolean) : [];[m
[31m-  const [ids, setIds] = useState(passedIds);[m
[31m-  const [cursor, setCursor] = useState(0);[m
[31m-  const [current, setCurrent] = useState(null);[m
[31m-  const [feedback, setFeedback] = useState("");[m
[31m-  const [result, setResult] = useState([]);[m
[31m-  const resultsRef = useRef([]); // finish用：常に最新[m
[32m+[m[32m  const [loading, setLoading] = useState(true);[m
[32m+[m[32m  const [mistake, setMistake] = useState(null);[m
[32m+[m[32m  const [error, setError] = useState("");[m
[32m+[m[32m  const [debugYou, setDebugYou] = useState("");[m
[32m+[m
[32m+[m[32m  const q = mistake ?? {};[m
 [m
[31m-  // 初期ロード[m
   useEffect(() => {[m
[32m+[m[32m    let alive = true;[m
     (async () => {[m
[31m-      const useIds = Array.isArray(passedIds) ? passedIds.filter(Boolean) : [];[m
[31m-      if (useIds.length === 0) {[m
[31m-        navigate("/review-list", { replace: true });[m
[31m-        return;[m
[32m+[m[32m      try {[m
[32m+[m[32m        if (!mid) throw new Error("IDが不正です");[m
[32m+[m[32m        const ref = doc(db, "mistakes", mid);[m
[32m+[m[32m        const snap = await getDoc(ref);[m
[32m+[m[32m        if (!snap.exists()) throw new Error("データが見つかりません");[m
[32m+[m[32m        const data = { id: snap.id, ...snap.data() };[m
[32m+[m[32m        if (uid && data.uid && data.uid !== uid) throw new Error("アクセス権がありません");[m
[32m+[m[32m        if (!alive) return;[m
[32m+[m[32m        setMistake(data);[m
[32m+[m[32m        setLoading(false);[m
[32m+[m[32m      } catch (e) {[m
[32m+[m[32m        console.error("[ReviewPlay] load error:", e);[m
[32m+[m[32m        if (!alive) return;[m
[32m+[m[32m        setError(e?.message || "読み込みに失敗しました");[m
[32m+[m[32m        setLoading(false);[m
       }[m
[31m-