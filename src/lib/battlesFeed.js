// src/lib/battlesFeed.js
import {
  collection, query, orderBy, limit, onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";

/** 最新 N 件を購読（デフォ20） */
export function subscribeRecentBattles(onData, onError, size = 20) {
  const q = query(
    collection(db, "battles"),
    orderBy("createdAt", "desc"),
    limit(size)
  );
  // onData: (rows: Array<{id:string, ...data}>) => void
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(rows);
    },
    (err) => onError?.(err)
  );
}
