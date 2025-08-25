// src/pages/ReviewQuickStart.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/fbkit";
import { fullRecoverHearts } from "../lib/hearts";

const COOLDOWN_MIN = 10;

// 縺・ｍ繧薙↑蝙・Date/Timestamp/number/undefined)繧貞ｮ牙・縺ｫ ms 縺ｫ螟画鋤
function tsToMs(v) {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime?.() ?? 0;
  if (typeof v.toMillis === "function") return v.toMillis();
  if (v.seconds != null && v.nanoseconds != null) {
    return v.seconds * 1000 + Math.floor(v.nanoseconds / 1e6);
  }
  try {
    return v.toDate?.().getTime?.() ?? 0;
  } catch {
    return 0;
  }
}

function formatMMSS(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ReviewQuickStart() {
  const navigate = useNavigate();
  const uid = getAuth().currentUser?.uid;

  const [user, setUser] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now()); // 竊・遘偵き繧ｦ繝ｳ繝医ム繧ｦ繝ｳ逕ｨ

  // User doc 雉ｼ隱ｭ
  useEffect(() => {
    if (!uid) return;
    const un = onSnapshot(doc(db, "users", uid), (snap) => {
      setUser(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => un && un();
  }, [uid]);

  // 1遘偵＃縺ｨ縺ｫ縲檎樟蝨ｨ譎ょ綾縲阪ｒ譖ｴ譁ｰ・郁ｻｽ縺・〒縺呻ｼ・
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const hearts = user?.hearts ?? 0;
  const lastAdAtMs = tsToMs(user?.lastAdHeartsAt);

  const cdTotalMs = COOLDOWN_MIN * 60_000;
  const cdRemainMs = Math.max(0, cdTotalMs - (nowMs - lastAdAtMs));
  const canAdRecover = hearts < 5 && cdRemainMs === 0;

  const doAdRecover = async () => {
    if (!uid) return alert("繝ｭ繧ｰ繧､繝ｳ繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞");
    if (hearts >= 5) return alert("笶､縺ｯ貅繧ｿ繝ｳ縺ｧ縺呻ｼ・);
    if (!canAdRecover) return; // 繧ｬ繝ｼ繝・
    try {
      // 譛ｬ譚･縺ｯ蠎・相SDK縺ｮ隕冶・螳御ｺ・う繝吶Φ繝亥ｾ後↓螳溯｡・
      await fullRecoverHearts(uid, { reason: "ad" });
      alert("蠎・相隕冶・繝懊・繝翫せ・壺擘縺悟・蝗槫ｾｩ縺励∪縺励◆・・);
    } catch (e) {
      console.error("ad recover error:", e);
      alert("蝗槫ｾｩ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲よ凾髢薙ｒ縺翫＞縺ｦ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>蠕ｩ鄙偵Δ繝ｼ繝会ｼ・uickStart・・/h2>

      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          margin: "12px 0",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          縺ｾ縺蠕ｩ鄙偵☆繧句撫鬘後・縺ゅｊ縺ｾ縺帙ｓ<span role="img" aria-label="sparkles">笨ｨ</span>
          <br />
          <small>・医∪縺壹・縲後し繝ｳ繝励Ν謚募・縲阪〒蜍穂ｽ懃｢ｺ隱阪＠縺ｦ縺ｿ繧医≧・・/small>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="border px-3 py-2 rounded"
            onClick={() => navigate("/review/seed")}
          >
            繧ｵ繝ｳ繝励Ν謚募・
          </button>
          <Link className="border px-3 py-2 rounded" to="/review/list">
            荳隕ｧ縺ｸ
          </Link>
        </div>
      </div>

      {/* 蠎・相縺ｧ笶､蜈ｨ蝗槫ｾｩ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ */}
      <div
        style={{
          padding: 12,
          border: "1px dashed #bbb",
          borderRadius: 8,
          margin: "12px 0",
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          笶､繧ｹ繧ｿ繝溘リ・嘴hearts} / 5
        </div>
        <button
          className={`px-3 py-2 rounded border ${
            !canAdRecover ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={!canAdRecover}
          onClick={doAdRecover}
        >
          {canAdRecover
            ? "蠎・相縺ｧ笶､蜈ｨ蝗槫ｾｩ・井ｻ翫☆縺蝉ｽｿ逕ｨ蜿ｯ閭ｽ・・
            : `蠎・相縺ｧ笶､蜈ｨ蝗槫ｾｩ・・{COOLDOWN_MIN}蛻・け繝ｼ繝ｫ繝繧ｦ繝ｳ・荏}
        </button>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          {hearts >= 5
            ? "笶､縺ｯ貅繧ｿ繝ｳ縺ｧ縺吶・
            : cdRemainMs > 0
            ? `蜀堺ｽｿ逕ｨ縺ｾ縺ｧ ${formatMMSS(cdRemainMs)}`
            : "莉翫☆縺蝉ｽｿ逕ｨ縺ｧ縺阪∪縺吶・}
        </div>
      </div>

      {/* 縺｡繧・＞繝・ヰ繝・げ・域焚蛟､謚頑升逕ｨ・・*/}
      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: "1px solid #eee",
          borderRadius: 8,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>User Debug</div>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          <div>uid: <code>{uid || "-"}</code></div>
          <div>hearts: <code>{hearts}</code></div>
          <div>battleTickets: <code>{user?.battleTickets ?? "-"}</code></div>
          <div>daily.date: <code>{user?.daily?.date ?? "-"}</code></div>
          <div>
            lastAdHeartsAt:{" "}
            <code>
              {(() => {
                const ms = lastAdAtMs;
                return ms ? new Date(ms).toLocaleString() : "-";
              })()}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
