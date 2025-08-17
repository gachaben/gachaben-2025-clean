import React from "react";
import { itemNames } from "../data/itemNames.js";

export default function ItemCard({ item, owned, pwMode, onClick }) {
  if (!item) return null;

  const { imageName = "", name = "", pw = 0, cpt = 0, bpt = 0, stage } = item;

  // 画像パス & ベース名（.png を除去）
  const base = String(imageName).replace(/\.png$/i, "");
  const fileBase = base.replace(/^\d{4}_/, "");
  const stageNum = stage ?? Number(base.match(/_stage(\d+)/)?.[1] ?? 1);
  const imagePath = `/images/2508/stage${stageNum}/${fileBase}.png`;

  // ランク & エフェクト
  const isS = base.includes("_S_");
  const isA = base.includes("_A_");
  const isB = base.includes("_B_");
  const rank = isS ? "S" : isA ? "A" : isB ? "B" : "";
  const rankColor = isS ? "#fde047" : isA ? "#e9d5ff" : isB ? "#d1d5db" : "#ffffff";
  const fx = isS ? "S_spark.mp4" : isA ? "A_spark.mp4" : isB ? "B_spark.mp4" : null;

  // レベル
  const lvl = (x) => (x >= 250 ? 5 : x >= 200 ? 4 : x >= 150 ? 3 : x >= 100 ? 2 : x >= 50 ? 1 : 0);
  const cptLv = lvl(cpt);
  const bptLv = lvl(bpt);

  // ===== 名前解決：優先順位 name → itemNames[base] → base =====
  const resolvedName = (name && name.trim()) || itemNames[base] || base;

  // 2行化（ヘラクレスは手動、他は中央で二分）
  const nameLines = (() => {
    if (resolvedName === "ヘラクレスオオカブト") return ["ヘラクレス", "オオカブト"];
    if (resolvedName.length > 8) {
      const mid = Math.ceil(resolvedName.length / 2);
      return [resolvedName.slice(0, mid), resolvedName.slice(mid)];
    }
    return [resolvedName];
  })();

  return (
    <div
      onClick={pwMode ? onClick : undefined}
      className={`${owned ? "" : "opacity-60 grayscale"}`}
      style={{
        position: "relative",
        isolation: "isolate",
        width: 150,
        height: 220,
        margin: 8,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(0,0,0,.25)",
        background: "transparent",
        cursor: pwMode ? "pointer" : "default",
      }}
    >
      {/* 背景エフェクト（光だけ加算） */}
      {fx && (
        <video
          src={`/images/effects/${fx}`}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            mixBlendMode: "plus-lighter",
            pointerEvents: "none",
            background: "transparent",
          }}
        />
      )}

      {/* アイテム画像（中央） */}
      <img
        src={imagePath}
        alt={resolvedName}
        draggable={false}
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          transform: "translate(-50%, -50%)",
          maxWidth: "92%",
          maxHeight: "62%",
          objectFit: "contain",
          zIndex: 10,
          background: "transparent",
        }}
      />

      {/* ランク（右上） */}
      <div
        style={{
          position: "absolute",
          right: 6,
          top: 4,
          zIndex: 50,
          fontFamily: "serif",
          fontWeight: 800,
          fontSize: 28,
          color: rankColor,
          textShadow: "0 0 4px #000,0 0 8px #000",
          pointerEvents: "none",
        }}
      >
        {rank}
      </div>

      {/* 名前：中央上（2行対応） */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 6,
          transform: "translateX(-50%)",
          zIndex: 60,
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.05,
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "pre-line",
          textShadow: "0 0 4px #000, 0 0 10px #000",
          background: "transparent",
          maxWidth: "90%",
          pointerEvents: "none",
        }}
      >
        {nameLines.join("\n")}
      </div>

      {/* PW／攻撃／防御（下・透明背景） */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 6,
          zIndex: 30,
          display: "grid",
          gap: 4,
          justifyItems: "center",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 12, textShadow: "0 0 3px #000,0 0 6px #000" }}>{pw} PW</div>
        <div style={{ fontSize: 11, lineHeight: 1, textShadow: "0 0 3px #000,0 0 6px #000" }}>
          攻撃力：{Array.from({ length: cptLv }).map((_, i) => (
            <span key={i}>🥊</span>
          ))}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1, textShadow: "0 0 3px #000,0 0 6px #000" }}>
          防御力：{Array.from({ length: bptLv }).map((_, i) => (
            <span key={i}>💪</span>
          ))}
        </div>
      </div>
    </div>
  );
}
