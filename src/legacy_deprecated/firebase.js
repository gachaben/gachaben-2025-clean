// src/legacy deprecated/firebase.js
// 旧コードが参照しているレガシー入口を、新しいハブ（@/firebase）にブリッジする
export *from "@/firebase" // named export（db, auth, storage, ensureSignedIn など）
export { default } from "@/firebase"; // default import対策
