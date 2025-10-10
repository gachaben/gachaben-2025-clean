// ------------------------------------------------------
// 🎵 NOTE_KIND 定義（v1.3.1 準拠）
// ------------------------------------------------------
// すべての音符演出をこの共通定義から参照する。
// 例）<NoteBurst type="study" /> や <NoteBurst type="active" quiet />

export type NoteKindType =
  | "login"
  | "active"
  | "study"
  | "challenge"
  | "premium";

export interface NoteKind {
  glyph: string;
  color?: string;
  gradient?: string;
  name: string;
}

export const NOTE_KIND: Record<NoteKindType, NoteKind> = {
  login: {
    glyph: "♪",
    color: "#f59e0b",
    name: "八分音符", // ログイン時：1日の起点
  },
  active: {
    glyph: "♫",
    color: "#60a5fa",
    name: "連符", // 稼働中の進行演出（5分ごと）
  },
  study: {
    glyph: "♩",
    color: "#f472b6",
    name: "四分音符", // 学習・正答時
  },
  challenge: {
    glyph: "♬",
    color: "#fb7185",
    name: "複連符", // チャレンジ成功時
  },
  premium: {
    glyph: "𝄞",
    gradient: "rainbow",
    name: "ト音記号", // プレミア確定時
  },
};

// ------------------------------------------------------
// 💡 ユーティリティ
// ------------------------------------------------------

/**
 * NOTE_KINDを安全に取得（typeが不明な場合はstudyを返す）
 */
export const getNoteKind = (type?: string): NoteKind => {
  if (!type || !(type in NOTE_KIND)) return NOTE_KIND.study;
  return NOTE_KIND[type as NoteKindType];
};
