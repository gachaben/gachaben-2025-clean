// src/fbkit/storage.ts
import { getFirebaseStorage } from "./app";
import {
  ref as sRef,
  getDownloadURL,
  uploadBytes,
  type FirebaseStorage,
} from "firebase/storage";

export const storage: FirebaseStorage = getFirebaseStorage();

export const storageRef = (path: string) => sRef(storage, path);

// 例：画像をアップして URL を取る
export async function uploadAndGetUrl(path: string, file: Blob | ArrayBuffer) {
  const r = storageRef(path);
  await uploadBytes(r, file as any);
  return getDownloadURL(r);
}

export { getDownloadURL };
