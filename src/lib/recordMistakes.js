// src/lib/recordMistakes.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";

export async function recordMistake(p) {
  const { uid, question, picked, source = "battle" } = p || {};
  if (!uid || !question?.text) {
    console.warn("[mistake] skip write: missing uid or question");
    return;
  }
  try {
    const ref = await addDoc(collection(db, "mistakes"), {
      uid,
      text: question.text,
      options: question.options ?? [],
      answer: question.answer,
      picked,
      source,
      createdAt: serverTimestamp(),
    });
    console.log("[mistake] saved:", ref.id);
  } catch (e) {
    console.error("[mistake] save failed:", e);
  }
}
