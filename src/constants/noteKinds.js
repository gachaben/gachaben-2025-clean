// ------------------------------------------------------
// 🎵 src/constants/noteKinds.js（2025-10-11 最終版）
// ------------------------------------------------------
// 各モードの音符タイプ定義
//  - login: 🌈 ト音記号（虹・プレミアム象徴）
//  - study: ♪ 学習モード（柔らかい進行）
//  - challenge: ♫ チャレンジモード（緊張と集中）
//  - battle: ♬ バトルモード（連打と勝負）
//  - active: ♩ 稼働時間（時間の流れ）
// ------------------------------------------------------

export const NOTE_KIND = {
  login: {
    glyph: "𝄞",
    gradient:
      "linear-gradient(90deg,#ff3b3b,#fbbf24,#34d399,#60a5fa,#a78bfa,#ec4899)",
    name: "ログイン（ト音記号）",
    sound: "/sounds/note_login.mp3",
  },
  study: {
    glyph: "♪",
    color: "#f472b6", // ピンク
    name: "学習問題",
    sound: "/sounds/note_study.mp3",
  },
  challenge: {
    glyph: "♫",
    color: "#fb7185", // 赤
    name: "チャレンジ問題",
    sound: "/sounds/note_challenge.mp3",
  },
  battle: {
    glyph: "♬",
    color: "#facc15", // 金
    name: "バトルモード",
    sound: "/sounds/note_battle.mp3",
  },
  active: {
    glyph: "♩",
    color: "#60a5fa", // 青
    name: "稼働時間",
    sound: "/sounds/note_active.mp3",
  },
};
