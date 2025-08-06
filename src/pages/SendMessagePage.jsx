import React, { useState } from "react";
import { useSendSupportMail } from "../hooks/useSendSupportMail";

const SendMessagePage = () => {
  const { sendSupportMail } = useSendSupportMail();
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    const res = await sendSupportMail({
      parentEmail: "hogehoge@gmail.com",
      childName: "たろう",
      messageBody: "いつもおうえんありがとう！",
    });

    if (res.success) {
      setStatus("📨 メール送信に成功しました！");
    } else {
      setStatus("⚠️ 送信に失敗しました…");
    }
  };

  return (
    <div>
      <h2>保護者にメッセージを送る</h2>
      <button onClick={handleSend}>メッセージを送信</button>
      <p>{status}</p>
    </div>
  );
};

export default SendMessagePage;
