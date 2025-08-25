import { useEffect, useState } from "react";
import { db } from "@/fbkit";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const SpecialAnswerHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞");
        setLoading(false);
        return;
      }

      try {
        // 蝗樒ｭ斐Ο繧ｰ蜿門ｾ・
        const logsQuery = query(
          collection(db, "specialAnswerLogs"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const logsSnap = await getDocs(logsQuery);
        const logsData = logsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogs(logsData);

        // 蝠城｡後ョ繝ｼ繧ｿ蜿門ｾ・
        const qSnap = await getDocs(collection(db, "specialQuestions"));
        const qMap = {};
        qSnap.docs.forEach((doc) => {
          qMap[doc.id] = doc.data();
        });
        setQuestionsMap(qMap);
      } catch (error) {
        console.error("繝・・繧ｿ蜿門ｾ励お繝ｩ繝ｼ・・, error);
        alert("繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // 繧ｯ繝ｪ繝ｼ繝ｳ繧｢繝・・
  }, []);

  if (loading) return <p>隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...</p>;

  const filteredLogs = showOnlyWrong
    ? logs.filter((log) => log.isCorrect === false)
    : logs;

  return (
    <div>
      <h2>祷 蝗樒ｭ泌ｱ･豁ｴ</h2>
      <label>
        <input
          type="checkbox"
          checked={showOnlyWrong}
          onChange={(e) => setShowOnlyWrong(e.target.checked)}
        />
        笶・縺ｾ縺｡縺後▲縺溘ｂ繧薙□縺・縺縺代ｒ陦ｨ遉ｺ
      </label>

      {filteredLogs.length === 0 ? (
        <p>陦ｨ遉ｺ縺ｧ縺阪ｋ螻･豁ｴ縺後≠繧翫∪縺帙ｓ縲・/p>
      ) : (
        <ul>
          {filteredLogs.map((log, i) => {
            const question = questionsMap[log.questionId];
            const isCorrect = log.isCorrect;

            return (
              <li
                key={log.id}
                style={{
                  border: "1px solid #ccc",
                  margin: "10px 0",
                  padding: "10px",
                  backgroundColor: isCorrect ? "#e0ffe0" : "#ffe0e0",
                }}
              >
                <p>
                  <strong>Q{i + 1}.</strong>{" "}
                  {question ? question.question : "・亥撫鬘後′蜑企勁縺輔ｌ縺ｦ縺・∪縺呻ｼ・}
                </p>
                <p>
                  縺ゅ↑縺溘・縺薙◆縺茨ｼ嘴" "}
                  <strong>{question ? question.choices[log.selectedIndex] : "・・}</strong>・・
                  {isCorrect ? "箝輔○縺・°縺・ : "笶後∪縺｡縺後＞"}・・
                </p>
                <p style={{ fontSize: "0.9em", color: "#555" }}>
                  {log.timestamp?.toDate?.().toLocaleString() || "譌･莉倥↑縺・}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SpecialAnswerHistoryPage;
