// src/pages/DoReMiBoard.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "@/styles/doremi.css";

const allNotes = [
  { id: "do",  label: "ド"  },
  { id: "re",  label: "レ"  },
  { id: "mi",  label: "ミ"  },
  { id: "fa",  label: "ファ"},
  { id: "so",  label: "ソ"  },
  { id: "ra",  label: "ラ"  },
  { id: "si",  label: "シ"  },
  { id: "do2", label: "高ド"},
];

const noteBg = {
  do:  "#FFE082",
  re:  "#80DEEA",
  mi:  "#C5E1A5",
  fa:  "#FFCCBC",
  so:  "#B39DDB",
  ra:  "#F48FB1",
  si:  "#AED581",
  do2: "#FFD54F",
};

export default function DoReMiBoard() {
  const [earned, setEarned] = useState([]);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [rippleNote, setRippleNote] = useState("");
  const [completed, setCompleted] = useState(false); // ← 追加：全音クリア状態

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const notes = data?.login?.earnedNotes || [];
          setEarned(notes);

          // 🔔 全音揃ったら自動再生（初回のみ）
          if (notes.length === allNotes.length && !completed) {
            setCompleted(true);
            setTimeout(() => playScale(true), 800); // 少し遅延して再生
          }
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [completed]);

  const playNote = (noteId) => {
    const audio = new Audio(`/sounds/doremi/${noteId}.wav`);
    audio.currentTime = 0;
    audio.play();
  };

  // 🟡 ドレミファソラシド自動再生（completeMode=trueのとき光演出あり）
  const playScale = async (completeMode = false) => {
    for (const n of allNotes) {
      if (earned.includes(n.label)) {
        playNote(n.id);
        if (completeMode) triggerRipple(n.label);
        await new Promise((r) => setTimeout(r, n.id === "do2" ? 800 : 300));
      }
    }

    if (completeMode) {
      // 虹背景フェード（クラス付与）
      document.body.classList.add("rainbow-bg");
      setTimeout(() => {
        document.body.classList.remove("rainbow-bg");
      }, 3000);
    }
  };

  const triggerRipple = (label) => {
    setRippleNote(label);
    setTimeout(() => setRippleNote(""), 500);
  };

  if (loading) return <div className="text-center mt-10">読み込み中...</div>;

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>🎵 どれみ音システム（学習連動）</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {allNotes.map((note) => {
          const unlocked = earned.includes(note.label);
          const isRipple = rippleNote === note.label;
          return (
            <button
              key={note.id}
              onClick={() => unlocked && (playNote(note.id), triggerRipple(note.label))}
              className={isRipple ? "ripple-active" : ""}
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
                fontSize: 18,
                fontWeight: "bold",
                background: unlocked ? noteBg[note.id] : "#ccc",
                opacity: unlocked ? 1 : 0.6,
                cursor: unlocked ? "pointer" : "not-allowed",
                transition: "box-shadow .3s ease",
              }}
              disabled={!unlocked}
            >
              {note.label}
            </button>
          );
        })}
      </div>

      <br />
      <button
        onClick={() => playScale()}
        style={{
          padding: "10px 20px",
          fontSize: 18,
          background: "#cce",
          borderRadius: 8,
        }}
      >
        ▶️ ドレミファソラシド 再生
      </button>

      <p className="mt-4 text-gray-600 text-sm">
        uid: {uid} / earned: {earned.join(", ")}
      </p>
    </div>
  );
}
