// ------------------------------------------------------
// 🎵 soundPlayer.js（ドレスタ共通サウンド管理）
// ------------------------------------------------------
// 使い方：
// playSfx("correct");               → 効果音（/public/sounds/effects）
// playFullScale();                  → ドレミファソラシド×2 再生
// playNote("do" or "re" ... "si");  → 単音再生（/public/sounds/doremi）
// ------------------------------------------------------

export function playSfx(name, volume = 0.6) {
  const path = `/sounds/effects/${name}.mp3`;
  const audio = new Audio(path);
  audio.volume = volume;
  audio.play().catch(() => {});
}

// ------------------------------------------------------
// 🎶 ドレミ単音（教育・演出用）
// ------------------------------------------------------
export function playNote(note = "do", volume = 0.7) {
  const path = `/sounds/doremi/${note}.mp3`;
  const audio = new Audio(path);
  audio.volume = volume;
  audio.play().catch(() => {});
}

// ------------------------------------------------------
// 🌈 全音ファンファーレ（ドレミファソラシド×2）
// ------------------------------------------------------
export async function playFullScale(volume = 0.8, delay = 180) {
  const notes = ["do", "re", "mi", "fa", "so", "ra", "si", "do2"];
  for (let i = 0; i < 2; i++) {
    for (const note of notes) {
      playNote(note, volume);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
