// src/lib/linkAnon.ts
import { EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/fbkit"; // ← あなたのプロジェクト構成に合わせて追加

/**
 * 匿名ユーザーを Email/Password にリンクする。
 * 成功すると UID はそのまま、ログイン方法だけ追加される。
 */
export async function linkAnonToEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("未ログインです。まず匿名ログインしてください。");
  if (!user.isAnonymous) throw new Error("匿名ユーザーではありません。");

  const cred = EmailAuthProvider.credential(email, password);

  // ここで「リンク」すると UID はそのまま、ログイン方法だけ増える
  const res = await linkWithCredential(user, cred);
  return res.user; // 同じ UID が返る
}
