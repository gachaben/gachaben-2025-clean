import React from "react";
import ItemCard from "../components/ItemCard.jsx";

export default function Battle() {
  const testItem = {
    rank: "S",
    seriesId: "kontyu",
    stage: 1,
    imageName: "2508_A_005_kabuto_stage1.png",
    bpt: 3,
    cpt: 2,
    pwValue: 200,
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>バトル準備</h1>

      <div
        style={{
          display: "inline-block",
          background: "black",
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <ItemCard item={testItem} />
      </div>
    </div>
  );
}
