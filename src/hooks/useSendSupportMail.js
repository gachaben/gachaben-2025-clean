import { useState } from "react";
import axios from "axios";

export const useSendSupportMail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

 const sendMail = async ({ childName, messageBody, parentEmail }) => {
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    const res = await axios.post(
      "https://us-central1-gachaben-2025.cloudfunctions.net/sendSupportMail",
      {
        childName,
        messageBody,
        parentEmail // ← ★追加！
      }
    );

      if (res.data.success) {
        setSuccess(true);
      } else {
        throw new Error("送信失敗");
      }
    } catch (err) {
      console.error("送信失敗：", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMail, loading, error, success };
};
