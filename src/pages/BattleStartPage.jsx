// src/pages/BattleStartPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/fbkit";
import { consumeOneTicket, fullRecoverTickets } from "../lib/tickets";
import { fullRecoverHearts } from "../lib/hearts";

const COOLDOWN_MIN_HEART = 5;
const COOLDOWN_MIN_TICKET = 5;

function makeKey() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// 蝙九ｆ繧峨℃縺ｫ蠑ｷ縺・ms 螟画鋤
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

export default function BattleStartPage() {
  const navigate = useNavigate();
  const uid = getAuth().currentUser?.uid;

  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now()); // 竊・豈守ｧ呈峩譁ｰ縺励※繧ｫ繧ｦ繝ｳ繝医ム繧ｦ繝ｳ

  // User 雉ｼ隱ｭ
  useEffect(() => {
    if (!uid) return;
    const un = onSnapshot(doc(db, "users", uid), (snap) => {
      setUser(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => un && un();
  }, [uid]);

  // 1遘偵ち繧､繝槭・
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const hearts = user?.hearts ?? 0;
  const tickets = user?.battleTickets ?? 0;

  // 笶､ cooldown
  const lastAdHeartsMs = tsToMs(user?.lastAdHeartsAt);
  const cdHeartsTotal = COOLDOWN_MIN_HEART * 60_000;
  const cdHeartsRemain = Math.max(0, cdHeartsTotal - (nowMs - lastAdHeartsMs));
  const canAdRecoverHearts = hearts < 5 && cdHeartsRemain === 0;

  // 蛻ｸ cooldown
  const lastAdTicketsMs = tsToMs(user?.lastAdTicketsAt);
  const cdTicketsTotal = COOLDOWN_MIN_TICKET * 60_000;
  const cdTicketsRemain = Math.max(0, cdTicketsTotal - (nowMs - lastAdTicketsMs));
  const canAdRecoverTickets = tickets < 3 && cdTicketsRemain === 0;

  // 繝舌ヨ繝ｫ髢句ｧ具ｼ亥虻繧・譫壽ｶ郁ｲｻ・・
  const startBattle = async () => {
    if (!uid) return alert("繝ｭ繧ｰ繧､繝ｳ繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞");
    if (tickets <= 0) {
      alert("繝舌ヨ繝ｫ蛻ｸ縺瑚ｶｳ繧翫∪縺帙ｓ縲ょ屓蠕ｩ縺励※縺九ｉ蜀肴倦謌ｦ縺励※縺ｭ・・);
      return;
    }
    try {
      setBusy(true);
      await consumeOneTicket(uid, "battle:" + makeKey());
      navigate("/battle/play");
    } catch (e) {
      console.error("startBattle error:", e);
      if (e?.code === "NO_TICKET") {
        alert("繝舌ヨ繝ｫ蛻ｸ縺・縺ｧ縺吶ょ屓蠕ｩ縺励※縺九ｉ蜀肴倦謌ｦ縺励※縺ｭ・・);
      } else {
        alert("繝舌ヨ繝ｫ髢句ｧ九↓螟ｱ謨励＠縺ｾ縺励◆縲よ凾髢薙ｒ縺翫＞縺ｦ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
      }
    } finally {
      setBusy(false);
    }
  };

  // 蠎・相蝗槫ｾｩ・遺擘・丞虻・・
  const doAdRecoverHearts = async () => {
    if (!uid) return;
    if (!canAdRecoverHearts) return;
    try {
      await fullRecoverHearts(uid, { reason: "ad" });
      alert("蠎・相隕冶・繝懊・繝翫せ・壺擘縺悟・蝗槫ｾｩ縺励∪縺励◆・・);
    } catch (e) {
      console.error("ad recover hearts error:", e);
      alert("蝗槫ｾｩ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲よ凾髢薙ｒ縺翫＞縺ｦ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
    }
  };
  const doAdRecoverTickets = async () => {
    if (!uid) return;
    if (!canAdRecoverTickets) return;
    try {
      await fullRecoverTickets(uid, { reason: "ad" });
      alert("蠎・相隕冶・繝懊・繝翫せ・壹ヰ繝医Ν蛻ｸ縺悟・蝗槫ｾｩ縺励∪縺励◆・・);
    } catch (e) {
      console.error("ad recover tickets error:", e);
      alert("蝗槫ｾｩ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲よ凾髢薙ｒ縺翫＞縺ｦ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>繝舌ヨ繝ｫ髢句ｧ・/h2>

      {/* 繝舌ヨ繝ｫ髢句ｧ九ヶ繝ｭ繝・け */}
      <div style={{ margin: "12px 0", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          繝舌ヨ繝ｫ蛻ｸ・嘴tickets} / 3
        </div>
        <button
          className={`px-4 py-2 rounded border ${tickets <= 0 || busy ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={tickets <= 0 || busy}
          onClick={startBattle}
        >
          {busy ? "髢句ｧ倶ｸｭ..." : "繝舌ヨ繝ｫ髢句ｧ・}
        </button>
        {tickets <= 0 && (
          <div style={{ marginTop: 8, fontSize: 12 }}>
            繝舌ヨ繝ｫ蛻ｸ縺瑚ｶｳ繧翫∪縺帙ｓ縲ゆｸ九・縲悟ｺ・相縺ｧ蝗槫ｾｩ縲阪°縲・Link to="/review">/review</Link> 縺九ｉ蝗槫ｾｩ縺ｧ縺阪∪縺吶・
          </div>
        )}
      </div>

      {/* 笶､繝代ロ繝ｫ */}
      <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 8, margin: "12px 0", background: "#fafafa" }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>笶､繧ｹ繧ｿ繝溘リ・嘴hearts} / 5</div>
        <button
          className={`px-3 py-2 rounded border ${!canAdRecoverHearts ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={!canAdRecoverHearts}
          onClick={doAdRecoverHearts}
        >
          {canAdRecoverHearts ? "蠎・相縺ｧ笶､蜈ｨ蝗槫ｾｩ・井ｻ翫☆縺撰ｼ・ : `蠎・相縺ｧ笶､蜈ｨ蝗槫ｾｩ・・{COOLDOWN_MIN_HEART}蛻・け繝ｼ繝ｫ繝繧ｦ繝ｳ・荏}
        </button>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          {hearts >= 5 ? "笶､縺ｯ貅繧ｿ繝ｳ縺ｧ縺吶・ : cdHeartsRemain > 0 ? `蜀堺ｽｿ逕ｨ縺ｾ縺ｧ ${formatMMSS(cdHeartsRemain)}` : "莉翫☆縺蝉ｽｿ逕ｨ縺ｧ縺阪∪縺吶・}
        </div>
      </div>

      {/* 繝舌ヨ繝ｫ蛻ｸ繝代ロ繝ｫ */}
      <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 8, margin: "12px 0", background: "#fafafa" }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>繝舌ヨ繝ｫ蛻ｸ・嘴tickets} / 3</div>
        <button
          className={`px-3 py-2 rounded border ${!canAdRecoverTickets ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={!canAdRecoverTickets}
          onClick={doAdRecoverTickets}
        >
          {canAdRecoverTickets ? "蠎・相縺ｧ繝舌ヨ繝ｫ蛻ｸ 蜈ｨ蝗槫ｾｩ・井ｻ翫☆縺撰ｼ・ : `蠎・相縺ｧ繝舌ヨ繝ｫ蛻ｸ 蜈ｨ蝗槫ｾｩ・・{COOLDOWN_MIN_TICKET}蛻・け繝ｼ繝ｫ繝繧ｦ繝ｳ・荏}
        </button>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          {tickets >= 3 ? "繝舌ヨ繝ｫ蛻ｸ縺ｯ貅繧ｿ繝ｳ縺ｧ縺吶・ : cdTicketsRemain > 0 ? `蜀堺ｽｿ逕ｨ縺ｾ縺ｧ ${formatMMSS(cdTicketsRemain)}` : "莉翫☆縺蝉ｽｿ逕ｨ縺ｧ縺阪∪縺吶・}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link to="/">繝帙・繝縺ｸ</Link>
      </div>
    </div>
  );
}
