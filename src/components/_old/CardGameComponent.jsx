import React, { useState, useEffect } from "react";
import "../styles/CardGame.css";
import backImg from "/src/assets/images/card_back.png";
import superSound from "/src/sounds/super_evolve.mp3";
import ultraSound from "/src/sounds/ultra_evolve.mp3";

const CardGameComponent = ({ selectCount, evolveItems }) => {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!evolveItems || evolveItems.length === 0) return;

    const shuffled = evolveItems
      .map((item) => ({
        ...item,
        uid: Math.random(),
        flipped: false,
      }))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    setCards(shuffled);
  }, [evolveItems]);

  // 🎵 音を鳴らす関数（Safari対応）
  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch((e) => console.warn("音が再生されません:", e));
  };

  // 📳 バイブレーション関数
  const vibrate = (pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleCardClick = (card) => {
    if (selected.length >= selectCount || card.flipped) return;

    const updated = cards.map((c) =>
      c.uid === card.uid ? { ...c, flipped: true } : c
    );
    setCards(updated);
    setSelected([...selected, card.uid]);

    // 🎵 進化ステージごとに演出
    if (card.stage === "evolve2") {
      playSound(superSound);
      vibrate(300);
    }

    if (card.stage === "evolve3") {
      playSound(ultraSound);
      vibrate([200, 100, 200, 100, 300]);

      // 🌈 視覚演出（bodyにクラスを一瞬追加）
      const body = document.body;
      body.classList.add("flash-rainbow");
      setTimeout(() => body.classList.remove("flash-rainbow"), 800);
    }
  };

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <div
          key={card.uid}
          className={`card ${card.flipped ? "flipped" : ""}`}
          onClick={() => handleCardClick(card)}
        >
          <div className="card-inner">
            <div className="card-front">
              <img src={backImg} alt="うら" />
            </div>
            <div className="card-back">
              <img
                src={card.image}
                alt="しんか画像"
                onError={(e) => {
                  console.warn("画像読み込みエラー:", card.image);
                  e.target.src = "/images/fallback.png"; // 存在しない場合は適当な画像でOK
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGameComponent;
