import { useEffect, useState } from "react";
import { db } from "../legacy_deprecated/firebase"; // ← あなたのfirebase設定に合わせてパス調整
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const SpecialQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const auth = getAuth();

  // Firestoreから特訓問題を取得
  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "specialQuestions"));
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(fetched);
    };
    fetchQuestions();
  }, []);

  // 選択肢をクリックしたときの処理（問題ごとに管理）
  const handleSelect = (questionId, choiceIndex) => {
    setSelectedIndexes((prev) => ({
      ...prev,
      [questionId]: choiceIndex,
    }));
  };

  // 回答ログをFirestoreに保存
  const handleSubmit = async (question) => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインが必要です");
      return;
    }

    const selected = selectedIndexes[question.id];
    if (selected === undefined) {
      alert("選択してください");
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
      alert("✅ 回答を保存しました！");
    } catch (error) {
      console.error("回答の保存に失敗しました", error);
      alert("❌ 回答の保存に失敗しました");
    }
  };

  return (
    <div>
      <h2>🐾 特訓問題一覧</h2>
      {questions.map((q, index) => (
        <div key={q.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
          <p>
            <strong>Q{index + 1}.</strong> {q.question}
          </p>
          {q.choices.map((choice, i) => (
            <button
              key={i}
              style={{
                marginRight: "5px",
                marginBottom: "5px",
                backgroundColor: selectedIndexes[q.id] === i ? "#f99" : "#eee",
              }}
              onClick={() => handleSelect(q.id, i)}
            >
              {choice}
            </button>
          ))}
          <br />
          <button onClick={() => handleSubmit(q)} style={{ marginTop: "5px" }}>
            回答を送信
          </button>
        </div>
      ))}
    </div>
  );
};

export default SpecialQuestionsPage;
