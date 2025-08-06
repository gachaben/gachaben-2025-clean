// src/components/GachaAnimation.jsx
import React, { useEffect, useState } from "react";

const GachaAnimation = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onFinish(); // 演出が終わったら結果表示
    }, 2000); // 2秒間表示

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <img src="/images/capsule.gif" alt="ガチャ演出" className="w-64 h-64" />
    </div>
  );
};

export default GachaAnimation;
