import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";

const AwardVictoryPage = () => {
  const [prefecture, setPrefecture] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [allowed, setAllowed] = useState(null); // アクセス許可状態
  const navigate = useNavigate();

  // ✅ アクセス制限チェック（childユーザーのみOK）
  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        navigate("/login");
        return;
      }

      const data = snap.data();
      if (data.role === "child") {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    };

    checkAccess();
  }, [navigate]);

  const handleAward = async () => {
    if (!prefecture) {
      alert("都道府県を選んでください");
      return;
    }

    setLoading(true);
    setMessage("");

    const snapshot = await getDocs(collection(db, "users"));
    let count = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const uid = docSnap.id;

      if (data.prefecture === prefecture) {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
          badgeList: arrayUnion(`🔥 ${prefecture} 優勝県`)
        }, { merge: true });
        count++;
      }
    }

    setLoading(false);
    setMessage(`✅ ${prefecture} の子にバッジを配布しました！(${count}人)`);
  };

  const prefectures = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
    "岐阜県", "静岡県", "愛知県", "三重県",
    "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
    "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県",
    "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
  ];

  // 🔐 アクセス制限結果に応じた表示
  if (allowed === null) {
    return <p className="p-6">アクセス確認中...</p>;
  }

  if (allowed === false) {
    return <p className="p-6 text-red-600 font-bold">🚫 このページにはアクセスできません</p>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 優勝都道府県バッジ配布ページ</h2>

      <select
        value={prefecture}
        onChange={(e) => setPrefecture(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">都道府県を選んでください</option>
        {prefectures.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <button
        onClick={handleAward}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "配布中..." : `${prefecture || "都道府県"} にバッジを配布する`}
      </button>

      {message && <p className="mt-4 text-green-700 font-bold">{message}</p>}
    </div>
  );
};

export default AwardVictoryPage;
