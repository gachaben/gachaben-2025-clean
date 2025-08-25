import React, { useState } from "react";
import { useSendSupportMail } from "../hooks/useSendSupportMail";

const SendMessagePage = () => {
  const { sendSupportMail } = useSendSupportMail();
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    const res = await sendSupportMail({
      parentEmail: "hogehoge@gmail.com",
      childName: "たろぁE,
      messageBody: "ぁE��もおぁE��んありがとぁE��E,
    });

    if (res.success) {
      setStatus("📨 メール送信に成功しました�E�E);
    } else {
      setStatus("⚠�E�E送信に失敗しました…");
    }
  };

  return (
    <div>
      <h2>保護老E��メチE��ージを送る</h2>
      <button onClick={handleSend}>メチE��ージを送信</button>
      <p>{status}</p>
    </div>
  );
};

export default SendMessagePage;
