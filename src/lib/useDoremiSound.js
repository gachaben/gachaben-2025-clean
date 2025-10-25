// ------------------------------------------------------
// 🎧 useDoremiSound.js
// ドレミファソラシド（/public/sounds/doremi/）管理ユーティリティ
// ------------------------------------------------------

const basePath = "/sounds/doremi/";

const notes = [
  "do",  // ド
  "re",  // レ
  "mi",  // ミ
  "fa",  // ファ
  "so",  // ソ
  "ra",  // ラ
  "si",  // シ
  "do2", // 高音ド
];

// ------------------------------------------------------
// 🎵 1音だけ再生
// ------------------------------------------------------
export function playNote(noteName) {
  try {
    const audio = new Audio(`${basePath}${noteName}.mp3`);
    audio.volume = 0.8;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn("[useDoremiSound] 再生エラー:", e);
  }
}

// ------------------------------------------------------
// 🎶 全音スケール再生（ドレミファソラシド×2）
// ------------------------------------------------------
export function playFullScale() {
  let index = 0;
  const interval = setInterval(() => {
    if (index < notes.length) {
      playNote(notes[index]);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 300); // 各音の間隔（ms）
}

// ------------------------------------------------------
// 🎶 任意の長さ・速度でスケール再生
// （チャレンジ用や特殊演出にも利用可能）
// ------------------------------------------------------
export function playScaleSequence(customNotes = notes, intervalMs = 300) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < customNotes.length) {
      playNote(customNotes[index]);
      index++;
    } else {
      clearInterval(interval);
    }
  }, intervalMs);
}
