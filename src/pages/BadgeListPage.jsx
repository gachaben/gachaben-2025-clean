import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const BadgeListPage = () => {
  const [badgeList, setBadgeList] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchBadges = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const uid = user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setBadgeList(data.badgeList || []);
        setUserName(data.name || "あなた");
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">🎖 {userName} のバッジ一覧</h2>
      {badgeList.length === 0 ? (
        <p>まだバッジを持っていません 🐣</p>
      ) : (
        <ul className="space-y-2">
          {badgeList.map((badge, index) => (
            <li key={index} className="bg-yellow-100 p-2 rounded shadow text-lg">
              {badge}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BadgeListPage;
