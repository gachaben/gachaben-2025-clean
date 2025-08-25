import { useEffect, useState } from "react";
import { db } from "@/fbkit"; // 竊・縺ゅ↑縺溘・firebase險ｭ螳壹↓蜷医ｏ縺帙※繝代せ隱ｿ謨ｴ
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const SpecialQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const auth = getAuth();

  // Firestore縺九ｉ迚ｹ險灘撫鬘後ｒ蜿門ｾ・
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

  // 驕ｸ謚櫁い繧偵け繝ｪ繝・け縺励◆縺ｨ縺阪・蜃ｦ逅・ｼ亥撫鬘後＃縺ｨ縺ｫ邂｡逅・ｼ・
  const handleSelect = (questionId, choiceIndex) => {
    setSelectedIndexes((prev) => ({
      ...prev,
      [questionId]: choiceIndex,
    }));
  };

  // 蝗樒ｭ斐Ο繧ｰ繧巽irestore縺ｫ菫晏ｭ・
  const handleSubmit = async (question) => {
    const user = auth.currentUser;
    if (!user) {
      alert("繝ｭ繧ｰ繧､繝ｳ縺悟ｿ・ｦ√〒縺・);
      return;
    }

    const selected = selectedIndexes[question.id];
    if (selected === undefined) {
      alert("驕ｸ謚槭＠縺ｦ縺上□縺輔＞");
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
      console.error("蝗樒ｭ斐・菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆", error);
      alert("笶・蝗樒ｭ斐・菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆");
    }
  };

  return (
    <div>
      <h2>誓 迚ｹ險灘撫鬘御ｸ隕ｧ</h2>
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
            蝗樒ｭ斐ｒ騾∽ｿ｡
          </button>
        </div>
      ))}
    </div>
  );
};

export default SpecialQuestionsPage;
