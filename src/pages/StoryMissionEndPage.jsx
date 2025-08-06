import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

const allEggs = [
  { id: "egg001", name: "スーパー1", rarity: "スーパープレミアム" },
  { id: "egg002", name: "スーパー2", rarity: "スーパープレミアム" },
  { id: "egg003", name: "レア1", rarity: "レア" },
  { id: "egg004", name: "レア2", rarity: "レア" },
  { id: "egg005", name: "ノーマルA", rarity: "ノーマル" },
  { id: "egg006", name: "ノーマルB", rarity: "ノーマル" },
  { id: "egg007", name: "ノーマルC", rarity: "ノーマル" },
  { id: "egg008", name: "ノーマルD", rarity: "ノーマル" },
  { id: "egg009", name: "ノーマルE", rarity: "ノーマル" },
  { id: "egg010", name: "ノーマルF", rarity: "ノーマル" },
];

const StoryMissionEndPage = () => {
  const [selectedEgg, setSelectedEgg] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();
  const user = getAuth().currentUser;

  useEffect(() => {
    const drawEgg = async () => {
      if (!user) return;

      const ownedRef = collection(db, "ownedEggs");
      const q = query(ownedRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const ownedIds = snapshot.docs.map((doc) => doc.data().eggId);

      const notOwnedEggs = allEggs.filter((egg) => !ownedIds.includes(egg.id));
      let candidates;

      if (notOwnedEggs.length === 0) {
        candidates = allEggs;
      } else {
        // スーパープレミアムが出にくいようにフィルタ
        candidates = notOwnedEggs.filter(
          (egg) =>
            egg.rarity !== "スーパープレミアム" ||
            notOwnedEggs.length <= 2 // 最後には出す
        );
      }

      const randomIndex = Math.floor(Math.random() * candidates.length);
      const egg = candidates[randomIndex];
      setSelectedEgg(egg);

      // Firestoreに保存
      await addDoc(ownedRef, {
        uid: user.uid,
        eggId: egg.id,
        timestamp: new Date(),
      });
    };

    drawEgg();
  }, [user, db]);

  if (!selectedEgg) return <p>たまご抽選中...</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>ストーリーミッションおわり！</h2>
      <p>がんばったね！</p>
      <p>ごほうびのたまごをゲットしよう！</p>
      <p>
        🎉 あたったたまご：{selectedEgg.name}（{selectedEgg.rarity}）🎉
        <br />
        (ID: {selectedEgg.id})
      </p>
      <img
        src={`/images/kontyu/eggs/${selectedEgg.id}.png`}
        alt={selectedEgg.name}
        style={{ width: "150px", marginTop: "20px" }}
      />
    </div>
  );
};

export default StoryMissionEndPage;
