// ------------------------------------------------------
// 🎵 useDoremiSound.js（完全統一版 / AudioContext管理＋ドレミ再生）
// ------------------------------------------------------

// ------------------------------------------------------
// 🎧 AudioContext 共通管理
// ------------------------------------------------------
let audioCtx;
if (typeof window !== "undefined") {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // 🔊 ページ遷移時に自動停止
  window.addEventListener("beforeunload", () => {
    if (audioCtx && audioCtx.state !== "closed") {
      audioCtx.close();
      console.log("🧹 AudioContext closed on unload");
    }
  });

  // ✅ 初回クリックで resume（LessonPage対策）
  document.addEventListener("click", () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().then(() => {
        console.log("🔊 AudioContext resumed globally");
      });
    }
  });
}

// ------------------------------------------------------
// ✅ 単音再生
// ------------------------------------------------------
export function playNote(note) {
  console.log("🎵 [playNote] 呼び出し:", note);
  const audio = new Audio(`/sounds/doremi/${note}.wav`);
  audio.volume = 0.8;

  audio.play()
    .then(() => {
      console.log(`✅ [playNote] 再生成功: ${note}`);
      // 再生終了後に停止・解放
      audio.addEventListener("ended", () => {
        audio.pause();
        audio.currentTime = 0;
        console.log(`🛑 [playNote] 停止: ${note}`);
      });
    })
    .catch((err) => {
      console.error(`❌ [playNote] 再生失敗 (${note})`, err);
    });
}

// ------------------------------------------------------
// ✅ 全音階再生（ド→ド2）
// ------------------------------------------------------
export function playFullScale() {
  console.log("🎶 [playFullScale] 呼び出し開始");
  const notes = ["do", "re", "mi", "fa", "so", "la", "si", "do2"];
  let i = 0;

  const playNext = () => {
    if (i < notes.length) {
      const note = notes[i];
      console.log(`➡️ [playFullScale] 再生中: ${note}`);
      const audio = new Audio(`/sounds/doremi/${note}.wav`);
      audio.volume = 0.8;
      audio.play()
        .then(() => console.log(`✅ [playFullScale] 再生成功: ${note}`))
        .catch((err) => console.error(`❌ [playFullScale] 再生失敗: ${note}`, err));
      i++;
      setTimeout(playNext, 400);
    }
  };

  playNext();
}
