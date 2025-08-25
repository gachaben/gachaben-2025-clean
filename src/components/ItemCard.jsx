import React from "react";
import { itemNames } from "../data/itemNames.js";

export default function ItemCard({ item, owned, pwMode, onClick }) {
  if (!item) return null;

  const { imageName = "", name = "", pw = 0, cpt = 0, bpt = 0, stage } = item;

  // 逕ｻ蜒上ヱ繧ｹ & 繝吶・繧ｹ蜷搾ｼ・png 繧帝勁蜴ｻ・・
  const base = String(imageName).replace(/\.png$/i, "");
  const fileBase = base.replace(/^\d{4}_/, "");
  const stageNum = stage ?? Number(base.match(/_stage(\d+)/)?.[1] ?? 1);
  const imagePath = `/images/2508/stage${stageNum}/${fileBase}.png`;

  // 繝ｩ繝ｳ繧ｯ & 繧ｨ繝輔ぉ繧ｯ繝・
  const isS = base.includes("_S_");
  const isA = base.includes("_A_");
  const isB = base.includes("_B_");
  const rank = isS ? "S" : isA ? "A" : isB ? "B" : "";
  const rankColor = isS ? "#fde047" : isA ? "#e9d5ff" : isB ? "#d1d5db" : "#ffffff";
  const fx = isS ? "S_spark.mp4" : isA ? "A_spark.mp4" : isB ? "B_spark.mp4" : null;

  // 繝ｬ繝吶Ν
  const lvl = (x) => (x >= 250 ? 5 : x >= 200 ? 4 : x >= 150 ? 3 : x >= 100 ? 2 : x >= 50 ? 1 : 0);
  const cptLv = lvl(cpt);
  const bptLv = lvl(bpt);

  // ===== 蜷榊燕隗｣豎ｺ・壼━蜈磯・ｽ・name 竊・itemNames[base] 竊・base =====
  const resolvedName = (name && name.trim()) || itemNames[base] || base;

  // 2陦悟喧・医・繝ｩ繧ｯ繝ｬ繧ｹ縺ｯ謇句虚縲∽ｻ悶・荳ｭ螟ｮ縺ｧ莠悟・・・
  const nameLines = (() => {
    if (resolvedName === "繝倥Λ繧ｯ繝ｬ繧ｹ繧ｪ繧ｪ繧ｫ繝悶ヨ") return ["繝倥Λ繧ｯ繝ｬ繧ｹ", "繧ｪ繧ｪ繧ｫ繝悶ヨ"];
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
      {/* 閭梧勹繧ｨ繝輔ぉ繧ｯ繝茨ｼ亥・縺縺大刈邂暦ｼ・*/}
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

      {/* 繧｢繧､繝・Β逕ｻ蜒擾ｼ井ｸｭ螟ｮ・・*/}
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

      {/* 繝ｩ繝ｳ繧ｯ・亥承荳奇ｼ・*/}
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

      {/* 蜷榊燕・壻ｸｭ螟ｮ荳奇ｼ・陦悟ｯｾ蠢懶ｼ・*/}
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

      {/* PW・乗判謦・ｼ城亟蠕｡・井ｸ九・騾乗・閭梧勹・・*/}
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
          謾ｻ謦・鴨・嘴Array.from({ length: cptLv }).map((_, i) => (
            <span key={i}>･・/span>
          ))}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1, textShadow: "0 0 3px #000,0 0 6px #000" }}>
          髦ｲ蠕｡蜉幢ｼ嘴Array.from({ length: bptLv }).map((_, i) => (
            <span key={i}>潮</span>
          ))}
        </div>
      </div>
    </div>
  );
}
