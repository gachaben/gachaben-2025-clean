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

// 例：画像をアチE�Eして URL を取めE
export async function uploadAndGetUrl(path: string, file: Blob | ArrayBuffer) {
  const r = storageRef(path);
  await uploadBytes(r, file as any);
  return getDownloadURL(r);
}

export { getDownloadURL };
