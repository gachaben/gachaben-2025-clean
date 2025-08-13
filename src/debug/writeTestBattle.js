// src/debug/writeTestBattle.js
import { db } from "../firebase";
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
  console.log("✅ local write ok docId:", ref.id);

  // サーバ反映待ち（エミュに届かないとここで失敗/ハングのはず）
  await waitForPendingWrites(db);

  // 「サーバ」から読んで存在確認（=通信発生を強制）
  const snap = await getDocFromServer(doc(db, "battles", ref.id));
  console.log("✅ server read ok:", snap.exists());
}
