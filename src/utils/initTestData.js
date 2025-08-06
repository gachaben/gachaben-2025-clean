import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const setInitialStage = async (uid) => {
  const ref = doc(db, "userItemPowers", uid);
  await setDoc(ref, {
    items: {
      S001_herakuresu: {
        stage: "stage1",
        pw: 0,
      },
    },
  }, { merge: true });
};
