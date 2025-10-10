// src/constants/noteKinds.js
export const NOTE_KIND = {
  login: {
    glyph: "♪",
    color: "#f59e0b", // オレンジ
    name: "ログイン音符",
    sound: "/sounds/note_login.mp3",
  },
  active: {
    glyph: "♫",
    color: "#60a5fa", // 青
    name: "稼働音符",
    sound: "/sounds/note_active.mp3",
  },
  study: {
    glyph: "♩",
    color: "#f472b6", // ピンク
    name: "学習音符",
    sound: "/sounds/note_study.mp3",
  },
  challenge: {
    glyph: "♬",
    color: "#fb7185", // 赤
    name: "チャレンジ音符",
    sound: "/sounds/note_challenge.mp3",
  },
  premium: {
    glyph: "𝄞",
    gradient: "rainbow",
    name: "プレミア音符",
    sound: "/sounds/note_premium.mp3",
  },
};
