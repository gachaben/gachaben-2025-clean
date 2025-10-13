import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";

export async function initUserData(uid, email) {
  const db = getFirestoreDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: email ?? "",
      role: "child",
      hearts: 5,
      lastAdHeartsAt: null,
      battleTickets: 3,
      lastAdTicketsAt: null,
      doremiPoints: 0,
      doremiRank: "ビギナー",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ user initialized:", uid);
  }
}
