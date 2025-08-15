// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth, ensureSignedIn } from "../firebase";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReviewPlayPage() {
  const { id: questionId } = useParams(); // URLの :id = questionId
  const navigate = useNavigate();
  const loc = useLocation();

  // 画面状態
  const [state, setState] = useState("loading"); // loading | ready | empty | error
  const [msg, setMsg] = useState("");

  // 表示するミス1件
  const [mistake, setMistake] = useState(null);

  // UI状態
  const [revealed, setRevealed] = useState(false);
  const [choices, setChoices] = useState([]);       // 残っている選択肢
  const [picked, setPicked] = useState(null);       // 直近にクリックした選択肢
  const [isCorrect, setIsCorrect] = useState(null); // null | true | false
  const [tries, setTries] = useState(0);

  // /review 側から state で渡ってきたデータ（即時表示のため）
  const seed = useMemo(() => {
    const s = loc.state || {};
    if (s && typeof s === "object" && (s.text || s.correct || s.mistakeId)) {
      return s;
    }
    return null;
  }, [loc.state]);

  // Firestore読込
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSignedIn();
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("not signed in");

        const qy = query(
          collection(db, "mistakes"),
          where("uid", "==", uid),
          where("questionId", "==", questionId),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const snap = await getDocs(qy);

        if (cancelled) return;

        if (snap.empty && !seed) {
          setState("empty");
          return;
        }

        const dataFromDb = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
        const m = dataFromDb ?? {
          id: seed.mistakeId ?? "(local)",
          questionId,
          text: seed.text ?? "",
          correct: seed.correct ?? "",
          subject: seed.subject ?? null,
          unit: seed.unit ?? null,
          options: seed.options ?? null,
          done: false,
          createdAt: null,
        };

        setMistake(m);
        setState("ready");
      } catch (e) {
        console.error(e);
        setMsg(e.message);
        setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, [questionId, seed]);

  // 選択肢の初期化（mistakeが入ったら）
  useEffect(() => {
    if (!mistake) return;
    // options が保存/受け渡しされていればそれを、なければ最小限のフォールバック
    const baseOpts = Array.isArray(mistake.options) && mistake.options.length > 0
      ? [...mistake.options]
      : (mistake.correct ? [mistake.correct] : []);
    // 念のため正解を含める
    if (mistake.correct && !baseOpts.includes(mistake.correct)) baseOpts.push(mistake.correct);
    setChoices(shuffle(baseOpts));
    setRevealed(false);
    setPicked(null);
    setIsCorrect(null);
    setTries(0);
  }, [mistake?.id]); // 新しい問題に来たらリセット

  const onPick = (opt) => {
    if (!mistake) return;
    if (isCorrect === true) return;        // 既に正解ならロック
    if (!choices.includes(opt)) return;    // もう消された選択肢は無視

    setPicked(opt);
    setTries((t) => t + 1);

    if (opt === mistake.correct) {
      setIsCorrect(true);
      setRevealed(true);
    } else {
      setIsCorrect(false);
      // 不正解ならその選択肢を取り除いて再挑戦
      setChoices((prev) => prev.filter((c) => c !== opt));
    }
  };

  const markDone = async () => {
    if (!mistake?.id || mistake.id === "(local)") return;
    try {
      await updateDoc(doc(db, "mistakes", mistake.id), {
        done: true,
        doneAt: serverTimestamp(),
      });
      setMistake((m) => ({ ...m, done: true }));
    } catch (e) {
      console.error("markDone failed:", e);
      alert("完了にできませんでした");
    }
  };

  if (state === "loading") {
    return (
      <div className="p-4">
        読み込み中… <button onClick={() => navigate(-1)} className="underline ml-3">← 戻る</button>
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="p-4 text-red-600">
        Error: {msg} <button onClick={() => navigate(-1)} className="underline ml-3">← 戻る</button>
      </div>
    );
  }
  if (state === "empty") {
    return (
      <div className="p-4">
        データが見つかりませんでした。<button onClick={() => navigate(-1)} className="underline ml-2">← 戻る</button>
      </div>
    );
  }

  const canChoice = Array.isArray(choices) && choices.length >= 2;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm underline">← 戻る</button>

      <div className="text-xs text-gray-500">
        問題ID: <b>{mistake?.questionId}</b>
        {mistake?.subject && (
          <span className="ml-2 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            科目: {mistake.subject}
          </span>
        )}
        {mistake?.unit && (
          <span className="ml-2 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            単元: {mistake.unit}
          </span>
        )}
        {mistake?.done && (
          <span className="ml-2 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            完了済み
          </span>
        )}
      </div>

      <div className="p-4 border rounded bg-white">
        <div className="text-base font-semibold mb-2">
          {mistake?.text || "（問題文がありません）"}
        </div>

        {/* 4択 or フォールバック */}
        {canChoice ? (
          <div className="flex flex-wrap gap-2">
            {choices.map((opt) => {
              const selected = picked === opt;
              const correctNow = isCorrect === true && opt === mistake.correct;
              const wrongNow = isCorrect === false && selected;
              const style = correctNow
                ? "bg-green-600 text-white border-green-600"
                : wrongNow
                ? "bg-red-600 text-white border-red-600"
                : "bg-white hover:bg-gray-50";
              return (
                <button
                  key={opt}
                  onClick={() => onPick(opt)}
                  disabled={isCorrect === true}
                  className={`px-4 py-2 rounded border ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="px-4 py-2 rounded bg-emerald-600 text-white"
              >
                答えを見る
              </button>
            ) : (
              <div className="mt-3 p-3 rounded bg-emerald-50 border border-emerald-200">
                正解：<b>{mistake?.correct || "（未登録）"}</b>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              ※ この問題には選択肢が未登録です（保存時に options を付けると4択で出せます）
            </div>
          </>
        )}

        {/* フィードバック */}
        {isCorrect === true && (
          <div className="mt-3 p-2 text-sm rounded bg-emerald-50 border border-emerald-200">
            正解！（{tries} 回目で到達）
          </div>
        )}
        {isCorrect === false && (
          <div className="mt-3 p-2 text-sm rounded bg-red-50 border border-red-200">
            不正解… 別の選択肢を選んでみよう（選んだ肢は消えました）
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {!mistake?.done && (
            <button
              onClick={markDone}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              title="正解まで到達したら完了にするのがおすすめ"
            >
              この問題は完了にする
            </button>
          )}
          <button
            onClick={() => navigate("/review")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            一覧へ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
