// ------------------------------------------------------
// 🎵 useDoremiSound.js（v3.0 / 完全統一版・AudioContext安定管理）
// ------------------------------------------------------

// ✅ AudioContext をアプリ全体で共有
let audioCtx;

if (typeof window !== "undefined") {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // 🧹 ページ遷移時に停止・解放
  window.addEventListener("beforeunload", () => {
    if (audioCtx && audioCtx.state !== "closed") {
      audioCtx.close();
      console.log("🧹 AudioContext closed on unload");
    }
  });

  // 🟢 初回クリックで resume（モバイル再生ブロック対策）
  document.addEventListener("click", () => {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().then(() => console.log("🔊 AudioContext resumed globally"));
    }
  });
}

// ------------------------------------------------------
// ✅ 単音再生（効果音・個別音符）
// ------------------------------------------------------
export function playNote(note) {
  if (!note) return;
  try {
    const audio = new Audio(`/sounds/doremi/${note}.wav`);
    audio.volume = 0.8;
    audio.play().catch((err) => console.warn(`⚠️ playNote(${note}) failed`, err));

    // 自動停止・メモリ解放
    audio.addEventListener("ended", () => {
      audio.pause();
      audio.currentTime = 0;
    });
  } catch (err) {
    console.error(`❌ playNote(${note}) error`, err);
  }
}

// ------------------------------------------------------
// ✅ 全音階再生（ド→ド2）
// ------------------------------------------------------
export function playFullScale(speed = 400) {
  const notes = ["do", "re", "mi", "fa", "so", "la", "si", "do2"];
  let index = 0;

  const playNext = () => {
    if (index >= notes.length) return;
    playNote(notes[index]);
    index++;
    setTimeout(playNext, speed);
  };

  playNext();
}

// ------------------------------------------------------
// ✅ 成功・再挑戦ショート効果音
// ------------------------------------------------------
export const playSuccess = () => playNote("so");  // 成功時（爽やか）
export const playRetry = () => playNote("mi");    // 再挑戦（温かみ）
export const playFail = () => playNote("fa");     // 失敗時（軽い落ち着き）

// ------------------------------------------------------
// ✅ カスタムスケール再生（任意音列）
// ------------------------------------------------------
export function playSequence(sequence = [], interval = 350) {
  if (!sequence.length) return;
  let i = 0;
  const playNext = () => {
    if (i < sequence.length) {
      playNote(sequence[i]);
      i++;
      setTimeout(playNext, interval);
    }
  };
  playNext();
}
