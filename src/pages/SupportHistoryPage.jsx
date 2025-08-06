// src/pages/SupportHistoryPage.jsx

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth"; // ログイン中の子ども取得用

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
      <h2>📖 応援メッセージ履歴</h2>

      {messages.length === 0 ? (
        <p>メッセージはまだありません。</p>
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
              <div>✉️ <strong>{msg.message}</strong></div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                📅 {msg.sentAt?.toDate().toLocaleString() || "日時不明"}
              </div>
              <div style={{ fontSize: "12px", color: "#636e72" }}>
                👤 送信者：{msg.parentEmail}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SupportHistoryPage;
