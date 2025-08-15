// src/lib/linkAnon.ts (jsでもOK)
import { getAuth, EmailAuthProvider, linkWithCredential } from "firebase/auth";

export async function linkAnonToEmail(email, password) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("未ログインです。");
  if (!user.isAnonymous) throw new Error("匿名ユーザーではありません。");

  const cred = EmailAuthProvider.credential(email, password);

  // ここで “リンク” すると UID はそのまま、ログイン方法だけ増える
  const res = await linkWithCredential(user, cred);
  return res.user; // 同じ UID
}
