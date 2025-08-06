// src/pages/EvolveCardPage.jsx
import React from "react";
import { getImageByStage } from "../utils/getImageByStage";

const allEggIds = [
  "egg001", "egg002", "egg003", "egg004", "egg005",
  "egg006", "egg007", "egg008", "egg009", "egg010",
];

// シャッフル関数（Fisher–Yates）
const shuffleArray = (array) => {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};

const evolveItems = shuffleArray(allEggIds).map((eggId, index) => ({
  id: eggId,
  stage: "egg",
  image: getImageByStage("egg", eggId),
}));

const EvolveCardPage = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">カードをタップしてしんかをチェック！</h2>
      <CardGameComponent selectCount={3} evolveItems={evolveItems} />
    </div>
  );
};

export default EvolveCardPage;
