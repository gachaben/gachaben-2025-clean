import React from "react";

const ItemCard = ({ item, owned = true, pwMode, onClick }) => {
  if (!item) return null;

  const {
    imageName = "",
    name = "",
    pw = 0,
    cpt = 0,
    bpt = 0,
    stage,
    seriesId = "",
    rank,
    rarity,
  } = item;

  // ランク判定（rank/rarity or filename の _S_/_A_/_B_）
  const letter =
    (rarity || rank || "")
      ?.toString()
      ?.trim()
      ?.toUpperCase()?.[0] ||
    ((imageName || "").includes("_S_") ? "S"
      : (imageName || "").includes("_A_") ? "A"
      : (imageName || "").includes("_B_") ? "B"
      : "");

  // 画像パス
  const imagePath = `/images/${seriesId}/stage${stage}/${imageName}.png`;

  // エフェクト候補（/effects → /images/effects の順で試す）
  const fxSources = ["S", "A", "B"].includes(letter)
    ? [
        `/effects/${letter}_spark.mp4`,
        `/images/effects/${letter}_spark.mp4`,
      ]
    : [];

  const toLevel = (v) =>
    v >= 250 ? 5 : v >= 200 ? 4 : v >= 150 ? 3 : v >= 100 ? 2 : v >= 50 ? 1 : 0;

  const cptLevel = toLevel(cpt);
  const bptLevel = toLevel(bpt);

  const rankClass =
    letter === "S"
      ? "text-yellow-300"
      : letter === "A"
      ? "text-purple-300"
      : letter === "B"
      ? "text-gray-300"
      : "text-white";

  return (
    <div
      onClick={pwMode ? onClick : undefined}
      className="relative w-[150px] h-[220px] m-2 border rounded-xl overflow-hidden shadow-md bg-white transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    >
      {/* ランク文字 */}
      <div className={`absolute top-1 right-2 z-30 text-2xl font-bold drop-shadow-md ${rankClass}`}>
        {letter}
      </div>

      {/* エフェクト（前面）。どちらのパスも失敗したら非表示にするだけ */}
      {fxSources.length > 0 && (
        <video
          key={fxSources.join(",")}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 z-20 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 0.55 }}
          onError={(e) => {
            // この <video> がどの <source> でも再生できない時に呼ばれるケースがある
            // ひとまず動画を隠して静かにフォールバックする
            e.currentTarget.style.display = "none";
          }}
        >
          {fxSources.map((src) => (
            <source key={src} src={`${src}?v=${Date.now()}`} type="video/mp4" />
          ))}
        </video>
      )}

      {/* 本体（未所持の薄化は画像だけに適用） */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-2 text-black">
        <div className="text-sm font-bold text-center break-words h-[38px] overflow-hidden leading-tight mt-3 whitespace-pre-line">
          {name === "ヘラクレスオオカブト" ? "ヘラクレス\nオオカブト" : name}
        </div>

        <img
          src={imagePath}
          alt={name}
          className={`w-full h-[90px] object-contain mt-1 ${owned ? "" : "opacity-60 grayscale"}`}
        />

        <div className="text-xs mt-1">{pw} PW</div>
        <div className="text-[11px] leading-none mt-1">
          攻撃力：{Array.from({ length: cptLevel }).map((_, i) => (
            <span key={i}>🥊</span>
          ))}
        </div>
        <div className="text-[11px] leading-none">
          防御力：{Array.from({ length: bptLevel }).map((_, i) => (
            <span key={i}>💪</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
