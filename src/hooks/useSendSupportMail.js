// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
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
        parentEmail // 竊・笘・ｿｽ蜉・・
      }
    );

      if (res.data.success) {
        setSuccess(true);
      } else {
        throw new Error("騾∽ｿ｡螟ｱ謨・);
      }
    } catch (err) {
      console.error("騾∽ｿ｡螟ｱ謨暦ｼ・, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMail, loading, error, success };
};
