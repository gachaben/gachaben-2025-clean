import React from "react";

export default function ItemCard({ item, owned, pwMode, onClick }) {
  if (!item) return null;

  const { imageName = "", name, pw = 0, cpt = 0, bpt = 0, stage, seriesId } = item;

  // 拡張子重複防止（imageNameに.pngが入っていてもOK）
  const base = imageName.replace(/\.png$/i, "");
  const img = `/images/${seriesId}/stage${stage}/${base}.png`;

  // ランクとエフェクト
  const isS = base.includes("_S_");
  const isA = base.includes("_A_");
  const isB = base.includes("_B_");
  const rank = isS ? "S" : isA ? "A" : isB ? "B" : "";
  const rankColor = isS ? "#fde047" : isA ? "#e9d5ff" : isB ? "#d1d5db" : "#ffffff";
  const fx = isS ? "S_spark.mp4" : isA ? "A_spark.mp4" : isB ? "B_spark.mp4" : null;

  // ステータス
  const lvl = (x) => (x >= 250 ? 5 : x >= 200 ? 4 : x >= 150 ? 3 : x >= 100 ? 2 : x >= 50 ? 1 : 0);
  const cptLv = lvl(cpt);
  const bptLv = lvl(bpt);

  const dispName = name === "ヘラクレスオオカブト" ? "ヘラクレス\nオオカブト" : name;

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
        background: "transparent",   // ★ カード土台は完全透明
        cursor: pwMode ? "pointer" : "default",
      }}
    >
      {/* 背景エフェクト（最背面。光だけ重ねる） */}
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
            mixBlendMode: "plus-lighter", // 黒画素は出ない
            pointerEvents: "none",
            background: "transparent",
          }}
        />
      )}

      {/* アイテム画像（中央・エフェクトの上に必ず重なる） */}
      <img
        src={img}
        alt={name}
        draggable={false}
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          transform: "translate(-50%, -50%)",
          maxWidth: "92%",
          maxHeight: "62%",
          objectFit: "contain",
          zIndex: 10,                // ★ videoより前
          background: "transparent",
        }}
      />

      {/* ランク（右上） */}
      <div
        style={{
          position: "absolute",
          right: 6,
          top: 4,
          zIndex: 40,
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

      {/* 文字（全部 透明背景。text-shadow だけで可読性UP） */}
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
        {/* 名前は上に置きたい場合は別途 top に配置してOK */}
        <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "pre-line", textShadow: "0 0 3px #000,0 0 6px #000", background: "transparent" }}>
          {dispName}
        </div>
        <div style={{ fontSize: 12, textShadow: "0 0 3px #000,0 0 6px #000", background: "transparent" }}>
          {pw} PW
        </div>
        <div style={{ fontSize: 11, lineHeight: 1, textShadow: "0 0 3px #000,0 0 6px #000", background: "transparent" }}>
          攻撃力：{Array.from({ length: cptLv }).map((_, i) => <span key={i}>🥊</span>)}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1, textShadow: "0 0 3px #000,0 0 6px #000", background: "transparent" }}>
          防御力：{Array.from({ length: bptLv }).map((_, i) => <span key={i}>💪</span>)}
        </div>
      </div>
    </div>
  );
}
