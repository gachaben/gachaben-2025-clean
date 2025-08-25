// src/pages/SupportHistoryPage.jsx

import React, { useEffect, useState } from "react";
import { db } from "@/fbkit";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth"; // 繝ｭ繧ｰ繧､繝ｳ荳ｭ縺ｮ蟄舌←繧ょ叙蠕礼畑

const SupportHistoryPage = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser || !currentUser.uid) return;

      const q = query(
        collection(db, "supportMessages"),
        where("childUid", "==", currentUser.uid),
        orderBy("sentAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(result);
    };

    fetchMessages();
  }, [currentUser]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>当 蠢懈抄繝｡繝・そ繝ｼ繧ｸ螻･豁ｴ</h2>

      {messages.length === 0 ? (
        <p>繝｡繝・そ繝ｼ繧ｸ縺ｯ縺ｾ縺縺ゅｊ縺ｾ縺帙ｓ縲・/p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((msg) => (
            <li
              key={msg.id}
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f1f2f6",
                borderRadius: "8px",
              }}
            >
              <div>笨会ｸ・<strong>{msg.message}</strong></div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                套 {msg.sentAt?.toDate().toLocaleString() || "譌･譎ゆｸ肴・"}
              </div>
              <div style={{ fontSize: "12px", color: "#636e72" }}>
                側 騾∽ｿ｡閠・ｼ嘴msg.parentEmail}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SupportHistoryPage;
