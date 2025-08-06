import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Bptを加算する関数
export const addBptToUser = async (amount) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "userStats", user.uid);
  const snap = await getDoc(ref);

  const prevData = snap.exists() ? snap.data() : {};
  const currentBpt = prevData.bpt || 0;

  await setDoc(ref, {
    ...prevData,
    bpt: currentBpt + amount,
  });
};
