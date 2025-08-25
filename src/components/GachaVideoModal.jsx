import React, { useEffect, useRef } from "react";

const GachaVideoModal = ({ onClose, onFinish }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((e) => {
        console.error("蜍慕判縺ｮ閾ｪ蜍募・逕溘↓螟ｱ謨・", e);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded shadow-lg w-full max-w-xl">
        <h2 className="text-lg font-bold mb-2 text-center text-gray-700">
          磁 繝励Ξ繝溘い繧ｬ繝√Ε繝√Ε繝ｬ繝ｳ繧ｸ・・
        </h2>
        <video
          ref={videoRef}
          src="/videos/gacha_challenge.mp4"
          className="w-full rounded"
          controls
          onEnded={onFinish}
        />
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ﾃ・
        </button>
      </div>
    </div>
  );
};

export default GachaVideoModal;
