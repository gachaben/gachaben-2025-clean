// src/debug/writeTestBattle.js
import {
  addDoc, collection, serverTimestamp,
  waitForPendingWrites, getDocFromServer, doc
} from "firebase/firestore";

export async function writeTestBattle() {
  const ref = await addDoc(collection(db, "battles"), {
    createdAt: serverTimestamp(),
    me: "test-user",
    enemy: "cpu",
    result: "win",
    rounds: 3,
  });
  console.log("笨・local write ok docId:", ref.id);

  // 繧ｵ繝ｼ繝仙渚譏蠕・■・医お繝溘Η縺ｫ螻翫°縺ｪ縺・→縺薙％縺ｧ螟ｱ謨・繝上Φ繧ｰ縺ｮ縺ｯ縺夲ｼ・
  await waitForPendingWrites(db);

  // 縲後し繝ｼ繝舌阪°繧芽ｪｭ繧薙〒蟄伜惠遒ｺ隱搾ｼ・騾壻ｿ｡逋ｺ逕溘ｒ蠑ｷ蛻ｶ・・
  const snap = await getDocFromServer(doc(db, "battles", ref.id));
  console.log("笨・server read ok:", snap.exists());
}
