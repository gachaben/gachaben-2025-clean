// src/pages/TestSupportMail.jsx

import React, { useState } from "react";
import { useSendSupportMail } from "../hooks/useSendSupportMail";

const TestSupportMail = () => {
  const [childName, setChildName] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  const { sendMail, loading, error, success } = useSendSupportMail();

  const handleSend = async () => {
    await sendMail({
      childName,
      messageBody,
      parentEmail,
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📤 テスト送信ページ</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>子どもの名前：</label>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>メッセージ：</label>
        <input
          type="text"
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>保護者のメールアドレス：</label>
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
        />
      </div>

      <button onClick={handleSend} disabled={loading}>
        テストメールを送信
      </button>

      {loading && <p>送信中...</p>}
      {success && <p style={{ color: "green" }}>✅ 送信成功！</p>}
      {error && <p style={{ color: "red" }}>❌ 送信失敗：{error}</p>}
    </div>
  );
};

export default TestSupportMail;
