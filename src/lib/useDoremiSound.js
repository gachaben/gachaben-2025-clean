// ------------------------------------------------------
// 🎵 useDoremiSound.js（完全安定版 / 自動AudioContext再開）
// ------------------------------------------------------

let audioCtx;

// ✅ AudioContextの取得・再開
function getCtx() {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

const freq = {
  do: 261.63,
  re: 293.66,
  mi: 329.63,
  fa: 349.23,
  so: 392.0,
  la: 440.0,
  si: 493.88,
  do2: 523.25,
};

// ✅ 音を鳴らす
export async function playNote(note, duration = 0.25) {
  const ctx = getCtx();
  if (!freq[note]) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq[note];
  gain.gain.setValueAtTime(0.3, ctx.currentTime);

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);

  return new Promise((resolve) => (osc.onended = resolve));
}

// ✅ ドレミファソラシドを順に再生
export async function playFullScale(interval = 300) {
  const notes = ["do", "re", "mi", "fa", "so", "la", "si", "do2"];
  for (const n of notes) {
    await playNote(n, 0.23);
    await new Promise((r) => setTimeout(r, interval));
  }
}

// ✅ 不正解音
export async function playFail() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.value = 200;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);

  return new Promise((resolve) => (osc.onended = resolve));
}
