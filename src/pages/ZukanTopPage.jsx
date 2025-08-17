// src/pages/ZukanTopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ZukanTopPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">シリーズを選ぼう</h1>
      <div className="space-x-3">
        <Link to="/zukan/rank/S" className="underline">Sランクをみる</Link>
        <Link to="/zukan/rank/A" className="underline">Aランクをみる</Link>
        <Link to="/zukan/rank/B" className="underline">Bランクをみる</Link>
      </div>
    </div>
  );
}
