// src/utils/updateItemStage.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/fbkit";

export const updateItemStage = async (uid, itemId, newStage) => {
  try {
    const itemRef = doc(db, "userItemPowers", uid);
    await updateDoc(itemRef, {
      [`items.${itemId}.stage`]: newStage,
    });
    console.log("繧ｹ繝・・繧ｸ繧呈峩譁ｰ縺励∪縺励◆・・);
  } catch (error) {
    console.error("繧ｹ繝・・繧ｸ縺ｮ譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆:", error);
  }
};
