// ------------------------------------------------------
// 🎵 NoteBurst.jsx（v1.3.4 再発火対応版）
// ------------------------------------------------------
// - "burst" : 音符が舞う
// - "sequence" : 順次点灯 → 全点灯で波 → 初期化ループ（確実に再発火）
// ------------------------------------------------------

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as noteKinds from "@/constants/noteKinds";

const NOTE_KIND = noteKinds.NOTE_KIND || {};
const getNoteKind =
  noteKinds.getNoteKind ||
  ((t) => NOTE_KIND[t] || NOTE_KIND.study || { color: "#fff", glyph: "♪" });

export default function NoteBurst({
  type = "study",
  quiet = false,
  mode = "burst", // "burst" | "sequence"
  labels = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"],
  intervalMs = 3000,
  waveDelayMs = 800,
  waveStepMs = 90,
}) {
  const kind = getNoteKind(type);

  // ========== burst（既存） ==========
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    if (mode !== "burst") return;
    const count = quiet ? 3 : 6;
    const items = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      size: 16 + Math.random() * 16,
      rotate: Math.random() * 360,
    }));
    setNotes(items);
    return () => setNotes([]);
  }, [type, quiet, mode]);

  // ========== sequence（波演出） ==========
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isWave, setIsWave] = useState(false);
  const timers = useRef([]);
  const waveRef = useRef(null); // ← 波アニメ制御用ref

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    if (mode !== "sequence") {
      clearTimers();
      setActiveIndex(-1);
      setIsWave(false);
      return;
    }

    clearTimers();
    setActiveIndex(-1);
    setIsWave(false);

    labels.forEach((_, idx) => {
      timers.current.push(
        setTimeout(() => setActiveIndex(idx), idx * intervalMs)
      );
    });

    const allLitAt = (labels.length - 1) * intervalMs;

    // 全点灯後、波開始
    timers.current.push(
      setTimeout(() => {
        // === 🌈 リペイント強制でアニメ再発火 ===
        if (waveRef.current) {
          waveRef.current.style.animation = "none";
          // eslint-disable-next-line no-unused-expressions
          waveRef.current.offsetHeight; // ← ここでリセット！
        }
        setIsWave(true);
      }, allLitAt + waveDelayMs)
    );

    // 波終了 → 初期化ループ
    const waveTotal = labels.length * waveStepMs + 1000;
    timers.current.push(
      setTimeout(() => {
        setIsWave(false);
        setActiveIndex(-1);
      }, allLitAt + waveDelayMs + waveTotal)
    );

    return clearTimers;
  }, [mode, type, labels, intervalMs, waveDelayMs, waveStepMs]);

  // ========== スタイル ==========
  const rainbowStyle = useMemo(
    () => ({
      background:
        "linear-gradient(90deg,#f87171,#fbbf24,#34d399,#60a5fa,#a78bfa,#ec4899,#f472b6)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }),
    []
  );
  const litStyle = kind.gradient ? rainbowStyle : { color: kind.color || "#fff" };
  const dimStyle = { color: "rgba(255,255,255,0.25)" };

  // ========== Render ==========
  if (mode === "sequence") {
    return (
      <div
        ref={waveRef}
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 9999 }}
      >
        <div className="flex gap-3">
          {labels.map((label, i) => {
            const lit = i <= activeIndex;
            const waveDelay = i * waveStepMs;
            return (
              <span
                key={i}
                className="text-3xl font-bold select-none inline-block"
                style={{
                  ...(lit ? litStyle : dimStyle),
                  animation: isWave
                    ? `pulseWave 1.1s ease-in-out ${waveDelay}ms 3 both`
                    : "none",
                  textShadow: lit ? "0 0 8px rgba(255,255,255,0.75)" : "none",
                  transition: "all 300ms ease",
                  willChange: "transform, filter",
                }}
              >
                {label}
              </span>
            );
          })}
        </div>

        <style>{`
          @keyframes pulseWave {
            0%   { transform: scale(1);   filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
            40%  { transform: scale(1.25); filter: drop-shadow(0 0 12px rgba(255,255,255,0.9)); }
            100% { transform: scale(1);   filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
          }
        `}</style>
      </div>
    );
  }

  // ========== burst ==========
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {notes.map((n) => (
        <span
          key={n.id}
          style={{
            position: "absolute",
            left: `${n.left}%`,
            bottom: 0,
            fontSize: `${n.size}px`,
            animation: `floatUp ${n.duration}s ease-out ${n.delay}s forwards`,
            transform: `rotate(${n.rotate}deg)`,
            ...(kind.gradient ? rainbowStyle : { color: kind.color || "#fff" }),
            opacity: 0.9,
          }}
        >
          {kind.glyph}
        </span>
      ))}

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 1; }
          100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

