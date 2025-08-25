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
      <h2>豆 繝・せ繝磯∽ｿ｡繝壹・繧ｸ</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>蟄舌←繧ゅ・蜷榊燕・・/label>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>繝｡繝・そ繝ｼ繧ｸ・・/label>
        <input
          type="text"
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>菫晁ｭｷ閠・・繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ・・/label>
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
        />
      </div>

      <button onClick={handleSend} disabled={loading}>
        繝・せ繝医Γ繝ｼ繝ｫ繧帝∽ｿ｡
      </button>

      {loading && <p>騾∽ｿ｡荳ｭ...</p>}
      {success && <p style={{ color: "green" }}>笨・騾∽ｿ｡謌仙粥・・/p>}
      {error && <p style={{ color: "red" }}>笶・騾∽ｿ｡螟ｱ謨暦ｼ嘴error}</p>}
    </div>
  );
};

export default TestSupportMail;
