// @KEEP 理由: 柱（❤/ガチャ/ミッション/ランキング/問題履歴）に一致
import GachaResultModal from "../components/GachaResultModal"; // パス調整してね！

// JSX の return の下のほうに：
{showGachaModal && (
  <GachaResultModal
    point={gachaPoint}
    onClose={() => setShowGachaModal(false)}
  />
)}
