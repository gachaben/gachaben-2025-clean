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

const rippleVars = {
  do:  { "--r1":"rgba(255,224,130,.8)", "--r2":"rgba(255,224,130,.5)", "--r3":"rgba(255,224,130,.3)" },
  re:  { "--r1":"rgba(128,222,234,.8)", "--r2":"rgba(128,222,234,.5)", "--r3":"rgba(128,222,234,.3)" },
  mi:  { "--r1":"rgba(197,225,165,.8)", "--r2":"rgba(197,225,165,.5)", "--r3":"rgba(197,225,165,.3)" },
  fa:  { "--r1":"rgba(255,204,188,.8)", "--r2":"rgba(255,204,188,.5)", "--r3":"rgba(255,204,188,.3)" },
  so:  { "--r1":"rgba(179,157,219,.8)", "--r2":"rgba(179,157,219,.5)", "--r3":"rgba(179,157,219,.3)" },
  ra:  { "--r1":"rgba(244,143,177,.8)", "--r2":"rgba(244,143,177,.5)", "--r3":"rgba(244,143,177,.3)" },
  si:  { "--r1":"rgba(174,213,129,.8)", "--r2":"rgba(174,213,129,.5)", "--r3":"rgba(174,213,129,.3)" },
  do2: { "--r1":"rgba(255,213,79,.8)",  "--r2":"rgba(255,213,79,.5)",  "--r3":"rgba(255,213,79,.3)"  },
};

export default function DoReMiBoard() {
  const [earned, setEarned] = useState([]);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [rippleNote, setRippleNote] = useState("");

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
          setEarned(data?.login?.earnedNotes || []);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const playNote = (noteId) => {
    const audio = new Audio(`/sounds/doremi/${noteId}.wav`);
    audio.currentTime = 0;
    audio.play();
  };

  // 解放済みのみ自動再生（高ドは長め）
  const playScale = async () => {
    for (const n of allNotes) {
      if (earned.includes(n.label)) {
        playNote(n.id);
        await new Promise((r) => setTimeout(r, n.id === "do2" ? 700 : 300));
      }
    }
  };

  const triggerRipple = (label) => {
    setRippleNote(label);
    setTimeout(() => setRippleNote(""), 1000);
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
                ...rippleVars[note.id],
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
        onClick={playScale}
        style={{ padding: "10px 20px", fontSize: 18, background: "#cce", borderRadius: 8 }}
      >
        ▶️ ドレミファソラシド 再生
      </button>

      <p className="mt-4 text-gray-600 text-sm">
        uid: {uid} / earned: {earned.join(", ")}
      </p>
    </div>
  );
}
