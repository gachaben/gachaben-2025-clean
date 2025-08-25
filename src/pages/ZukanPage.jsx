import React from "react";
import { useNavigate } from "react-router-dom";

const ZukanTopPage = () => {
  const navigate = useNavigate();

  const handleClick = (seriesId) => {
    navigate(`/zukan-list?series=${seriesId}`);
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>賜 縺後￥縺励ｅ縺・峙髑代∈ 繧医≧縺薙◎・・/h1>
      <p style={subTitleStyle}>繧ｷ繝ｪ繝ｼ繧ｺ繧偵∴繧峨ｓ縺ｧ縺ｭ 笨ｨ</p>

      <div style={buttonGroupStyle}>
        <button onClick={() => handleClick("kontyu")} style={buttonStyle}>
          菅 譏・勠繧ｷ繝ｪ繝ｼ繧ｺ
        </button>

        {/* 莫 莉悶す繝ｪ繝ｼ繧ｺ繧定ｿｽ蜉縺吶ｋ縺ｪ繧我ｻ･荳九・繧医≧縺ｫ蠅励ｄ縺帙ｋ繧・
        <button onClick={() => handleClick("kyouryuu")} style={buttonStyle}>
          ｦ・諱千ｫ懊す繝ｪ繝ｼ繧ｺ
        </button>
        <button onClick={() => handleClick("sweets")} style={buttonStyle}>
          魂 繧ｹ繧､繝ｼ繝・す繝ｪ繝ｼ繧ｺ
        </button>
        */}
      </div>
    </div>
  );
};

const containerStyle = {
  padding: "40px",
  textAlign: "center",
  background: "#fdf6e3", // 譏弱ｋ縺上※繧・＆縺励＞閭梧勹濶ｲ
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
  backgroundColor: "#f48fb1", // 繝斐Φ繧ｯ邉ｻ
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
  transition: "transform 0.2s",
};

export default ZukanTopPage;
