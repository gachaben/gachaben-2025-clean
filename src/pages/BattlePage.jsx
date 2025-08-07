// src/pages/BattlePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import ItemCard from "../components/ItemCard";
import PwSelectModal from "../components/PwSelectModal";
import QuestionComponent from "../components/QuestionComponent";

const BattlePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    selectedItem,
    questionCount = 3,
    selectedPw: initialPw,
    enemy = "CPU",
  } = state || {};

  const [selectedPw, setSelectedPw] = useState(initialPw);

  console.log("🧪 BattlePage受信：", selectedItem, questionCount, selectedPw);

  if (!selectedItem) return <p>アイテムが選ばれていません。</p>;

  const [currentRound, setCurrentRound] = useState(1);
  const [question, setQuestion] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [enemyAnswer, setEnemyAnswer] = useState(null);
  const [myItem, setMyItem] = useState(null);
  const [myPw, setMyPw] = useState(1000); // 初期値（あとでFirestoreと同期）
  const [enemyPw, setEnemyPw] = useState(1000); // 仮データ

  // ✅ Firestoreから自分のitemデータをマージしてセット
  useEffect(() => {
    const fetchUserItemPower = async () => {
      if (!selectedItem || !auth.currentUser) return;

      try {
        const docRef = doc(db, "userItemPowers", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        const itemId = selectedItem.itemId;

        let powerData = {};
        if (docSnap.exists()) {
          powerData = docSnap.data()[itemId] || {};
        }

        const merged = {
          ...selectedItem,
          pw: powerData.pw ?? 0,
          cpt: powerData.cpt ?? 0,
          bpt: powerData.bpt ?? 0,
        };

        setMyItem(merged);
        setMyPw(merged.pw ?? 0);
        console.log("✅ マージ済アイテム：", merged);
      } catch (error) {
        console.error("🔥 Firestore取得エラー:", error);
      }
    };

    fetchUserItemPower();
  }, [selectedItem]);

  // ✅ 新しい問題セット（モック）
  useEffect(() => {
    if (selectedPw !== null) {
      setQuestion({
        text: `Round ${currentRound}： 2 + 2 = ?`,
        choices: ["2", "4", "6", "8"],
        correct: "4",
      });
    }
  }, [selectedPw]);

  // ✅ 回答処理
  const handleMyAnswer = (choice) => {
    setMyAnswer(choice);

    // CPUはランダムに1秒後に回答
    setTimeout(() => {
      const randomChoice =
        question.choices[Math.floor(Math.random() * question.choices.length)];
      setEnemyAnswer(randomChoice);
    }, 1000);
  };

  // ✅ 次のラウンドへ
  const handleNext = () => {
    const isMyCorrect = myAnswer === question.correct;
    const isEnemyCorrect = enemyAnswer === question.correct;

    if (isMyCorrect) {
      setEnemyPw((prev) => Math.max(0, prev - selectedPw));
    }
    if (isEnemyCorrect) {
      setMyPw((prev) => Math.max(0, prev - selectedPw));
    }

    if (currentRound >= questionCount) {
      // ✅ バトル終了 → 結果ページへ遷移
      navigate("/battle/result", {
        state: {
          myRemainingPw: myPw - (isEnemyCorrect ? selectedPw : 0),
          enemyRemainingPw: enemyPw - (isMyCorrect ? selectedPw : 0),
        },
      });
    } else {
      setCurrentRound((prev) => prev + 1);
      setSelectedPw(null);
      setQuestion(null);
      setMyAnswer(null);
      setEnemyAnswer(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 bg-gradient-to-b from-yellow-100 to-yellow-50">
      {/* 🔺 相手の情報（上） */}
      <div className="flex flex-col items-center bg-red-200 rounded-lg p-2 sm:p-4 mb-2">
        <h3 className="font-bold text-lg">👑 {enemy}</h3>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <ItemCard item={selectedItem} />
          <p>残りPW：{enemyPw}</p>
        </div>
        {question && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {question.choices.map((choice) => (
              <button
                key={choice}
                disabled
                className={`px-3 py-1 border rounded ${
                  enemyAnswer === choice ? "bg-red-400" : "bg-white"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔻 自分の情報（下） */}
      <div className="flex flex-col items-center bg-blue-200 rounded-lg p-2 sm:p-4">
        <h3 className="font-bold text-lg">🧑 あなた</h3>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <ItemCard item={myItem} />
          <p>残りPW：{myPw}</p>
        </div>

        {/* PW未選択 */}
        {!selectedPw && <PwSelectModal onSelect={(pw) => setSelectedPw(pw)} />}

        {/* 問題出題 */}
        {selectedPw && question && !myAnswer && (
          <div className="mt-3">
            <QuestionComponent
              question={question.text}
              choices={question.choices}
              onSelect={handleMyAnswer}
            />
          </div>
        )}

        {/* 判定表示＋次へ */}
        {myAnswer && enemyAnswer && (
          <div className="mt-4 text-center">
            <p>
              正解：{question.correct} / あなた：{myAnswer} / 相手：
              {enemyAnswer}
            </p>
            <button
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleNext}
            >
              {currentRound < questionCount ? "次の問題へ" : "バトル終了"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattlePage;
