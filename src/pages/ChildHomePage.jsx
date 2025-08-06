// src/pages/ChildHomePage.jsx

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth"; // ログイン中の子ども取得用

const ChildHomePage = () => {
  const { currentUser } = useAuth();
  const [supportUnread, setSupportUnread] = useState(false);
  const [supportMessage, setSupportMessage] = useState(null);

  // 🔍 supportUnread チェック
  useEffect(() => {
    const fetchUnread = async () => {
      if (!currentUser || !currentUser.uid) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().supportUnread) {
          setSupportUnread(true);
        }
      } catch (err) {
        console.error("Firestore 読み込みエラー:", err);
      }
    };

    fetchUnread();
  }, [currentUser]);

  // 📨 通知クリック → supportUnread を false にしてメッセージ取得
 const handleSupportClick = async () => {
  setSupportUnread(false);

  const userRef = doc(db, "users", currentUser.uid);
  await updateDoc(userRef, { supportUnread: false });

  const latestMsgId = await getLatestSupportMessageId(currentUser.uid);
  if (!latestMsgId) return;

  const msgRef = doc(db, "supportMessages", latestMsgId);
  const msgSnap = await getDoc(msgRef);
  if (!msgSnap.exists()) return;

  const msgData = msgSnap.data();
  setSupportMessage(msgData.message);

  // ✅ ここが追加部分：報酬未付与なら pw+100 & rewarded:true に更新
  if (!msgData.rewarded) {
    const userSnap = await getDoc(userRef);
    const currentPw = userSnap.data()?.pw || 0;

    // pwを+100
    await updateDoc(userRef, {
      pw: currentPw + 100,
    });

    // メッセージに rewarded フラグを立てる
    await updateDoc(msgRef, {
      rewarded: true,
    });
  }
};



  // 📬 supportMessagesから最新1件を取得
  const getLatestSupportMessageId = async (uid) => {
    const q = query(
      collection(db, "supportMessages"),
      where("childUid", "==", uid),
      orderBy("sentAt", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0]?.id;
  };

  return (
    <div>
      {/* 🔔 通知アイコン（右上） */}
      <div style={{ position: "relative", textAlign: "right", padding: "12px" }}>
        <div
          onClick={handleSupportClick}
          style={{ display: "inline-block", cursor: "pointer", position: "relative" }}
        >
          <span style={{ fontSize: "28px" }}>🔔</span>
          {supportUnread && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              1
            </span>
          )}
        </div>
      </div>

      {/* ✉️ 応援メッセージがあるとき表示 */}
      {supportMessage && (
        <div
          style={{
            backgroundColor: "#dfe6e9",
            padding: "16px",
            borderRadius: "12px",
            margin: "16px",
            textAlign: "center",
            fontSize: "18px",
            animation: "fadeIn 1s ease-out",
          }}
        >
          📝 応援メッセージ：<br />
          「{supportMessage}」
        </div>
      )}
    </div>
  );
};

export default ChildHomePage;
