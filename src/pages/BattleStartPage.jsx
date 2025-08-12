import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

// /zukan から { state: { selectedItem } } を受け取る前提
export default function BattleStartPage() {
  const navigate = useNavigate();
  const loc = useLocation();

  // 前画面から来た選択アイテム（なければnull）
  const [selectedItem, setSelectedItem] = useState(loc.state?.selectedItem ?? null);

  // 試合数（1/3/5問）
  const [questionCount, setQuestionCount] = useState(3);

  // 一応、直接アクセス時はダミーでも動くようにする
  useEffect(() => {
    if (!selectedItem) {
      setSelectedItem({
        itemId: "kabuto_S_01",
        name: "カブト（S）",
        pw: 300,
        rank: "S",
        imageName: "kabuto_S_aomushi",
        seriesId: "kontyu",
      });
    }
  }, [selectedItem]);

  const handleStart = () => {
    if (!selectedItem) return;

    const initialMyPw = selectedItem?.pw ?? 300;
    const initialEnemyPw = 300;

    const enemyItem = {
      id: "cpu001",
      name: "カブトムシくん",
      power: initialEnemyPw,
    };

    navigate("/battle/play", {
      state: {
        selectedItem,
        enemyItem,
        myPwLeft: initialMyPw,
        enemyPwLeft: initialEnemyPw,
        questionCount,
      },
    });
  };

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold">バトル準備</h1>
        <div />
      </header>

      {/* あなたの代表 */}
      <section className="mb-6">
        <div className="text-sm text-gray-600 mb-2">あなたの代表アイテム</div>
        <div className="flex items-center gap-4">
          {selectedItem ? (
            <ItemCard item={selectedItem} owned={true} />
          ) : (
            <div className="p-3 rounded border bg-gray-50 text-gray-500">アイテム未選択</div>
          )}
          <div className="text-sm text-gray-600">
            残PW 初期値: <span className="font-semibold">{selectedItem?.pw ?? 300}</span>
          </div>
        </div>
      </section>

      {/* 試合数 */}
      <section className="mb-8">
        <div className="text-sm font-bold mb-2">バトルの問題数をえらんでね</div>
        <div className="flex gap-2">
          {[1, 3, 5].map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={`px-4 py-2 rounded-full border font-bold ${
                questionCount === n ? "bg-green-600 text-white border-green-600" : "bg-white text-green-700 border-green-600"
              }`}
            >
              {n}問
            </button>
          ))}
        </div>
      </section>

      {/* 開始ボタン */}
      <div>
        <button
          onClick={handleStart}
          disabled={!selectedItem}
          className={`px-6 py-3 rounded-lg font-bold shadow ${
            selectedItem ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          バトルスタート！
        </button>
      </div>
    </div>
  );
}
