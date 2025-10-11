// ------------------------------------------------------
// src/state/battleChallenge.ts
// ドレミチャレンジバトル用 Zustand ストア
// ------------------------------------------------------
import { create } from "zustand";

export type Level = 1 | 2 | 3;
export type NoteStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type CardKind = "cut" | "extend" | "reroll" | "boost" | "revive";
export type Step = "idle" | "select-level" | "asking" | "judging" | "revive" | "result";

interface Problem {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  level: Level;
}

interface BattleChallengeState {
  step: Step;
  selectedLevel: Level | null;
  noteStep: NoteStep;
  comboActive: boolean;
  cardsLeft: number;
  usedCards: Partial<Record<CardKind, number>>;
  timeLimitSec: number;
  currentQuestion: Problem | null;
  answerResult: "correct" | "wrong" | null;

  // アクション
  setLevel: (lv: Level) => void;
  setStep: (s: Step) => void;
  nextNote: (add: number) => void;
  resetBattle: () => void;
  useCard: (kind: CardKind) => void;
  setQuestion: (q: Problem | null) => void;
  setAnswerResult: (r: "correct" | "wrong" | null) => void;
}

export const useBattleChallenge = create<BattleChallengeState>((set, get) => ({
  step: "idle",
  selectedLevel: null,
  noteStep: 0,
  comboActive: true,
  cardsLeft: 3,
  usedCards: {},
  timeLimitSec: 15,
  currentQuestion: null,
  answerResult: null,

  setLevel: (lv) => set({ selectedLevel: lv, step: "asking", noteStep: get().noteStep }),
  setStep: (s) => set({ step: s }),
  nextNote: (add) => {
  const current = get().noteStep;
  const total = Math.min(7, current + add) as NoteStep; // ← 明示的に型指定！
  set({ noteStep: total });
  if (total === 7) set({ step: "result" });
},

  resetBattle: () =>
    set({
      step: "select-level",
      selectedLevel: null,
      noteStep: 0,
      comboActive: true,
      cardsLeft: 3,
      usedCards: {},
      timeLimitSec: 15,
      currentQuestion: null,
      answerResult: null,
    }),
  useCard: (kind) => {
    const { cardsLeft, usedCards } = get();
    if (kind === "revive") return; // 復活カードはカウント対象外
    if (cardsLeft <= 0) return;
    set({
      cardsLeft: cardsLeft - 1,
      usedCards: { ...usedCards, [kind]: (usedCards[kind] || 0) + 1 },
    });
  },
  setQuestion: (q) => set({ currentQuestion: q }),
  setAnswerResult: (r) => set({ answerResult: r }),
}));