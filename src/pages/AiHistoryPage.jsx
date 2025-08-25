// src/pages/AiHistoryPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "@/fbkit";
import { getAuth } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const AiHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "aiProblemLogs"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistory(logs);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">祷 驕主悉縺ｮ險ｺ譁ｭ螻･豁ｴ</h2>
      {loading ? (
        <p>隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...</p>
      ) : history.length === 0 ? (
        <p>螻･豁ｴ縺後≠繧翫∪縺帙ｓ縲・/p>
      ) : (
        <ul className="space-y-4">
          {history.map((log) => (
            <li key={log.id} className="border p-4 rounded">
              <p>套 {log.createdAt?.toDate().toLocaleString()}</p>
              <p>ｧ・蟄ｦ蟷ｴ・嘴log.grade}</p>
              <p>答 謨咏ｧ托ｼ嘴log.subject}</p>
              <p>当 蜊伜・・嘴log.unit}</p>
              <p>劇 繝医ヴ繝・け・嘴log.topic}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AiHistoryPage;
