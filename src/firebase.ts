// src/firebase.ts
// 互換プロキシ: すべて "@/fbkit" に委譲（default も用意）

export * from "@/fbkit";
import compat from "@/fbkit";
export default compat;
