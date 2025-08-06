import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// 🔥 今月のスコアIDを生成（例：monthlyScore_202507）
const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 例：monthlyScore_202507
};
// 🧠 Firestoreにスコアを加算する関数
const addMonthlyScore = async (points) => {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const scoreKey = getCurrentMonthScoreKey();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  let currentScore = 0;
  if (userSnap.exists()) {
    currentScore = userSnap.data()[scoreKey] || 0;
  }

  await setDoc(userRef, { [scoreKey]: currentScore + points }, { merge: true });
};





// 問題が正解した時の処理
const handleCorrectAnswer = async () => {
  // 正解！得点 +100 パワー
  await addMonthlyScore(100); // ←ここでスコア加算！

  alert("せいかい！ パワー +100");
};
