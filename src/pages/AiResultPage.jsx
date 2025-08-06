import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const AiResultPage = () => {
  const location = useLocation();
  const { grade, subject, unit, topic } = location.state || {};

  useEffect(() => {
    const saveToFirestore = async () => {
      if (!grade || !subject || !unit || !topic) return;

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "aiProblemLogs"), {
        createdAt: new Date(),
        grade,
        subject,
        unit,
        topic,
        uid: user.uid
      });
    };

    saveToFirestore();
  }, [grade, subject, unit, topic]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">✅ 診断結果</h2>
      <p className="mb-2">学年：{grade}</p>
      <p className="mb-4">苦手な教科：{subject}</p>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="font-semibold">👪 保護者の方へ：</p>
        <p>
          お子さまは「{unit}」に苦手意識があるようです。
          <br />
          この傾向にあわせて、AIが特訓問題を作成することができます。
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          🤖 AIで特訓問題を作成（100円）
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          🤖 AIで特訓問題を作成（100円）
        </button>
      </div>

      <h3 className="text-lg font-bold mb-2">🐽 とっくんもんだい</h3>
      <p className="text-sm border p-4">
        1. このきょうかには まだ もんだいが ありません
      </p>
    </div>
  );
};

export default AiResultPage;

