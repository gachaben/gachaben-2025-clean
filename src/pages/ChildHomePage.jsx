// src/pages/ChildHomePage.jsx

import React, { useEffect, useState } from "react";
import { auth, db } from "@/fbkit";
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
import { useAuth } from "../hooks/useAuth"; // 繝ｭ繧ｰ繧､繝ｳ荳ｭ縺ｮ蟄舌←繧ょ叙蠕礼畑

const ChildHomePage = () => {
  const { currentUser } = useAuth();
  const [supportUnread, setSupportUnread] = useState(false);
  const [supportMessage, setSupportMessage] = useState(null);

  // 剥 supportUnread 繝√ぉ繝・け
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
        console.error("Firestore 隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ:", err);
      }
    };

    fetchUnread();
  }, [currentUser]);

  // 鐙 騾夂衍繧ｯ繝ｪ繝・け 竊・supportUnread 繧・false 縺ｫ縺励※繝｡繝・そ繝ｼ繧ｸ蜿門ｾ・
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

  // 笨・縺薙％縺瑚ｿｽ蜉驛ｨ蛻・ｼ壼ｱ驟ｬ譛ｪ莉倅ｸ弱↑繧・pw+100 & rewarded:true 縺ｫ譖ｴ譁ｰ
  if (!msgData.rewarded) {
    const userSnap = await getDoc(userRef);
    const currentPw = userSnap.data()?.pw || 0;

    // pw繧・100
    await updateDoc(userRef, {
      pw: currentPw + 100,
    });

    // 繝｡繝・そ繝ｼ繧ｸ縺ｫ rewarded 繝輔Λ繧ｰ繧堤ｫ九※繧・
    await updateDoc(msgRef, {
      rewarded: true,
    });
  }
};



  // 闘 supportMessages縺九ｉ譛譁ｰ1莉ｶ繧貞叙蠕・
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
      {/* 粕 騾夂衍繧｢繧､繧ｳ繝ｳ・亥承荳奇ｼ・*/}
      <div style={{ position: "relative", textAlign: "right", padding: "12px" }}>
        <div
          onClick={handleSupportClick}
          style={{ display: "inline-block", cursor: "pointer", position: "relative" }}
        >
          <span style={{ fontSize: "28px" }}>粕</span>
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

      {/* 笨会ｸ・蠢懈抄繝｡繝・そ繝ｼ繧ｸ縺後≠繧九→縺崎｡ｨ遉ｺ */}
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
          統 蠢懈抄繝｡繝・そ繝ｼ繧ｸ・・br />
          縲鶏supportMessage}縲・
        </div>
      )}
    </div>
  );
};

export default ChildHomePage;
