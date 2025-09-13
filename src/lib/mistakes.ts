import { getFirestoreDb } from "@/fbkit";
import {
  collection, query, where, orderBy, limit, getDocs, onSnapshot,
  type DocumentData, type QueryDocumentSnapshot, type Query
} from "firebase/firestore";

const db = getFirestoreDb();

export type Mistake = {
  id: string;
  uid: string;
  question?: string;
  prompt?: string;
  answer?: string;
  correctAnswer?: string;
  createdAt?: any;
  subject?: string;
  unit?: string;
  status?: string;
  isReviewed?: boolean;
  reviewStatus?: string;
  [k: string]: any;
};

export function normalizeMistake(d: QueryDocumentSnapshot<DocumentData>): Mistake {
  const m = d.data() || {};
  return {
    id: d.id,
    uid: m.uid ?? m.userId ?? "",
    question: m.question ?? m.prompt ?? m.text ?? "",
    answer: m.userAnswer ?? m.answer ?? m.picked ?? "",
    correctAnswer: m.correctAnswer ?? m.answer ?? m.solution ?? "",
    createdAt: m.createdAt,
    subject: m.subject,
    unit: m.unit,
    status: m.status,
    isReviewed: m.isReviewed,
    reviewStatus: m.reviewStatus,
    ...m,
  };
}

export function baseQuery(uid: string, opts?: {subject?:string, unit?:string, pageSize?:number}): Query {
  const conds = [where("uid","==", uid)];
  if (opts?.subject) conds.push(where("subject","==", opts.subject));
  if (opts?.unit) conds.push(where("unit","==", opts.unit));
  return query(
    collection(db,"mistakes"),
    ...conds,
    orderBy("createdAt","desc"),
    limit(opts?.pageSize ?? 20)
  );
}
