// src/components/TopBar.jsx
import React from "react";
import { useHearts } from "@/context/HeartsContext";

export default function TopBar() {
  const { hearts, loading } = useHearts();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end gap-3 px-4 py-2 bg-white/70 backdrop-blur-md shadow">
      <div className="text-sm text-gray-500">ハート</div>
      <div
        className="px-3 py-1 rounded-full font-bold"
        style={{ background: hearts > 0 ? "#ffe0e6" : "#eee", color: "#d6336c" }}
        title="学習やバトルで1消費／広告視聴で全回復"
      >
        ❤️ {loading ? "-" : hearts}
      </div>
    </div>
  );
}
