// src/lib/mistakes.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

/**
 * バトルで間違えたときに記録する
 */
export async function recordMistake(question, userAnswer) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    await addDoc(collection(db, "mistakes"), {
      userId: uid,
      text: question.text || "(no text)",
      options: question.options || [],
      answer: question.answer,
      picked: userAnswer,
      type: question.type || "mcq",
      createdAt: serverTimestamp(),
      status: "open",
      times: 1,
    });
    console.log("[mistakes] added:", question.text);
  } catch (e) {
    console.error("[mistakes] add error:", e);
  }
}
