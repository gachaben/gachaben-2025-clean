// src/pages/ProblemsTestPage.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { getFirestoreDb, getFirebaseAuth } from "@/fbkit";

function ProblemsTestPage() {
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  // Firestoreから問題を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestoreDb();
        const q = query(collection(db, "problems"), where("category", "==", "textbook"));
        const snap = await getDocs(q);
        const rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProblems(rows);
        console.log("✅ Firestoreから問題取得:", rows);
      } catch (e) {
        console.error("❌ Firestore取得エラー:", e);
      }
    };
    fetchData();
  }, []);

  // 回答処理
  const handleAnswer = async (userAnswer, problem) => {
    setSelected(userAnswer);
    const correct = problem.body.a;

    if (userAnswer === correct) {
      setResult("正解！🎉");
    } else {
      setResult(`不正解 ❌（正解は ${correct}）`);
      try {
        const db = getFirestoreDb();
        const auth = getFirebaseAuth();
        const user = auth.currentUser;

        await addDoc(collection(db, "mistakes"), {
          uid: user?.uid || "guest",
          problemId: problem.id,
          question: problem.body.q,
          answer: userAnswer,
          correct,
          createdAt: new Date().toISOString(),
        });
        console.log("🔥 mistake saved!");
      } catch (e) {
        console.error("⚠️ mistake保存エラー:", e);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Firestoreから取得した問題 (category=textbook)
      </h2>

      {Array.isArray(problems) && problems.length > 0 ? (
        problems.map((p) => (
          <div key={p.id} className="mb-8 border-b pb-4">
            <p className="text-lg font-semibold mb-4">Q: {p.body.q}</p>
            <div className="flex flex-wrap gap-4">
              {[p.body.a, Number(p.body.a) + 1, Number(p.body.a) - 1]
                .sort(() => Math.random() - 0.5)
                .map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(choice.toString(), p)}
                    disabled={selected !== null}
                    className={`px-6 py-3 rounded-xl text-lg font-bold border-2 transition duration-200
                      ${
                        selected === choice.toString()
                          ? choice.toString() === p.body.a
                            ? "bg-green-500 text-white border-green-600"
                            : "bg-red-500 text-white border-red-600"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                      }
                      ${selected !== null && selected !== choice.toString() ? "opacity-50" : ""}
                    `}
                  >
                    {choice}
                  </button>
                ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">問題がありません。</p>
      )}

      {result && (
        <p className="mt-6 text-lg font-bold text-center">
          {result}
        </p>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setSelected(null);
            setResult(null);
            window.location.reload();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          再読込
        </button>
      </div>
    </div>
  );
}

// ✅ ← ここが重要！（定義のあとで export）
export default ProblemsTestPage;
