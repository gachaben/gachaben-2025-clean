import React from "react";
import { useNavigate } from "react-router-dom";

const ZukanTopPage = () => {
  const navigate = useNavigate();

  const handleClick = (seriesId) => {
    navigate(`/zukan-list?series=${seriesId}`);
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🎒 がくしゅう図鑑へ ようこそ！</h1>
      <p style={subTitleStyle}>シリーズをえらんでね ✨</p>

      <div style={buttonGroupStyle}>
        <button onClick={() => handleClick("kontyu")} style={buttonStyle}>
          🐛 昆虫シリーズ
        </button>

        {/* 🔜 他シリーズを追加するなら以下のように増やせるよ
        <button onClick={() => handleClick("kyouryuu")} style={buttonStyle}>
          🦖 恐竜シリーズ
        </button>
        <button onClick={() => handleClick("sweets")} style={buttonStyle}>
          🍰 スイーツシリーズ
        </button>
        */}
      </div>
    </div>
  );
};

const containerStyle = {
  padding: "40px",
  textAlign: "center",
  background: "#fdf6e3", // 明るくてやさしい背景色
  minHeight: "100vh",
};

const titleStyle = {
  fontSize: "32px",
  color: "#333",
  marginBottom: "10px",
};

const subTitleStyle = {
  fontSize: "18px",
  color: "#555",
  marginBottom: "30px",
};

const buttonGroupStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const buttonStyle = {
  margin: "12px",
  padding: "14px 28px",
  fontSize: "20px",
  backgroundColor: "#f48fb1", // ピンク系
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
  transition: "transform 0.2s",
};

export default ZukanTopPage;
