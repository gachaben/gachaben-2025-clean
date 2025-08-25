import { useEffect, useState } from "react";
import { db } from "@/fbkit";
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

  // 髢馴＆縺｣縺溷撫鬘後ｒ蜿門ｾ・
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞");
        return;
      }

      try {
        // 髢馴＆縺・Ο繧ｰ繧貞叙蠕・
        const logsQuery = query(
          collection(db, "specialAnswerLogs"),
          where("userId", "==", user.uid),
          where("isCorrect", "==", false),
          orderBy("timestamp", "desc")
        );
        const logsSnap = await getDocs(logsQuery);
        const wrongLogs = logsSnap.docs.map((doc) => doc.data());

        // questionId繧偵Θ繝九・繧ｯ縺ｫ縺励※蜀榊叙蠕・
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
        console.error("隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ:", error);
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
      alert("縺薙◆縺医ｒ縺医ｉ繧薙〒縺上□縺輔＞");
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
      alert("笨・蝗樒ｭ斐ｒ菫晏ｭ倥＠縺ｾ縺励◆・・);
    } catch (error) {
      console.error("菫晏ｭ倥お繝ｩ繝ｼ:", error);
      alert("笶・蝗樒ｭ斐・菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆");
    }
  };

  return (
    <div>
      <h2>煤 縺ｾ縺｡縺後▲縺溘ｂ繧薙□縺・↓ 繧ゅ≧縺・■縺ｩ 繝√Ε繝ｬ繝ｳ繧ｸ・・/h2>
      {wrongQuestions.length === 0 ? (
        <p>縺ｾ縺｡縺後▲縺溘ｂ繧薙□縺・・ 縺ゅｊ縺ｾ縺帙ｓ縲・/p>
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
              蝗樒ｭ斐ｒ騾∽ｿ｡
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default RetryWrongQuestionsPage;
