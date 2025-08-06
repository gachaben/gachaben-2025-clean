import GachaResultModal from "../components/GachaResultModal"; // パス調整してね！

// JSX の return の下のほうに：
{showGachaModal && (
  <GachaResultModal
    point={gachaPoint}
    onClose={() => setShowGachaModal(false)}
  />
)}
