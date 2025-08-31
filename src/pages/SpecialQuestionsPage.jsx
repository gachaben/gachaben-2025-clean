// src/pages/SpecialQuestionsPage.jsx
import React, { useEffect, useState } from "react";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function SpecialQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState({});

  // fbkit からインスタンス取得（直 getAuth/getFirestore は使わない）
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  // Firestore から特訓問題を取得
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "specialQuestions"));
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setQuestions(fetched);
    })();
  }, [db]);

  // 選択肢クリック
  const handleSelect = (questionId, choiceIndex) => {
    setSelectedIndexes((prev) => ({ ...prev, [questionId]: choiceIndex }));
  };

  // 回答ログを Firestore に保存
  const handleSubmit = async (question) => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインが必要です。先にログインしてください。");
      return;
    }

    const selected = selectedIndexes[question.id];
    if (selected === undefined) {
      alert("選択肢を選んでください。");
      return;
    }

    const isCorrect = selected === question.answerIndex;

    try {
      await addDoc(collection(db, "specialAnswerLogs"), {
        userId: user.uid,
        questionId: question.id,
        selectedIndex: selected,
        isCorrect,
        timestamp: serverTimestamp(),
      });
      alert("✅ 回答を保存しました。");
    } catch (err) {
      console.error("回答の保存に失敗:", err);
      alert("❌ 回答の保存に失敗しました。");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🐾 特訓問題一覧</h2>

      {questions.length === 0 ? (
        <p>問題がありません。</p>
      ) : (
        questions.map((q, idx) => (
          <div
            key={q.id}
            className="border rounded p-4 mb-4 bg-white"
            style={{ maxWidth: 720 }}
          >
            <p className="mb-2">
              <strong>Q{idx + 1}.</strong> {q.question ?? "（問題文なし）"}
            </p>

            {(q.choices ?? []).map((choice, i) => {
              const active = selectedIndexes[q.id] === i;
              return (
                <button
                  key={i}
                  className={`px-3 py-1 mr-2 mb-2 rounded ${
                    active ? "bg-red-300" : "bg-gray-200"
                  }`}
                  onClick={() => handleSelect(q.id, i)}
                >
                  {choice}
                </button>
              );
            })}

            <div>
              <button
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleSubmit(q)}
              >
                回答を送信
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
