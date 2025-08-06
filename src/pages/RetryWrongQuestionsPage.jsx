import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const RetryWrongQuestionsPage = () => {
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const auth = getAuth();

  // 間違った問題を取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("ログインしてください");
        return;
      }

      try {
        // 間違いログを取得
        const logsQuery = query(
          collection(db, "specialAnswerLogs"),
          where("userId", "==", user.uid),
          where("isCorrect", "==", false),
          orderBy("timestamp", "desc")
        );
        const logsSnap = await getDocs(logsQuery);
        const wrongLogs = logsSnap.docs.map((doc) => doc.data());

        // questionIdをユニークにして再取得
        const questionIds = [...new Set(wrongLogs.map((log) => log.questionId))];

        const questions = [];
        for (const id of questionIds) {
          const qDoc = await getDoc(doc(db, "specialQuestions", id));
          if (qDoc.exists()) {
            questions.push({ id, ...qDoc.data() });
          }
        }

        setWrongQuestions(questions);
      } catch (error) {
        console.error("読み込みエラー:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelect = (questionId, choiceIndex) => {
    setSelectedIndexes((prev) => ({
      ...prev,
      [questionId]: choiceIndex,
    }));
  };

  const handleSubmit = async (question) => {
    const user = auth.currentUser;
    const selected = selectedIndexes[question.id];
    if (selected === undefined) {
      alert("こたえをえらんでください");
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
      console.error("保存エラー:", error);
      alert("❌ 回答の保存に失敗しました");
    }
  };

  return (
    <div>
      <h2>🔁 まちがったもんだいに もういちど チャレンジ！</h2>
      {wrongQuestions.length === 0 ? (
        <p>まちがったもんだいは ありません。</p>
      ) : (
        wrongQuestions.map((q, index) => (
          <div
            key={q.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>
              <strong>Q{index + 1}.</strong> {q.question}
            </p>
            {q.choices.map((choice, i) => (
              <button
                key={i}
                style={{
                  marginRight: "5px",
                  marginBottom: "5px",
                  backgroundColor:
                    selectedIndexes[q.id] === i ? "#f99" : "#eee",
                }}
                onClick={() => handleSelect(q.id, i)}
              >
                {choice}
              </button>
            ))}
            <br />
            <button
              onClick={() => handleSubmit(q)}
              style={{ marginTop: "5px" }}
            >
              回答を送信
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default RetryWrongQuestionsPage;
