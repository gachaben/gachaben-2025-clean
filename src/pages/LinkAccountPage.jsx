import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function LinkAccountPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [uid, setUid] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || "");
      setIsAnon(!!u?.isAnonymous);
    });
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    setMsg("");
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setMsg("譛ｪ繝ｭ繧ｰ繧､繝ｳ縺ｧ縺吶ゅ∪縺壼諺蜷阪Ο繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
      return;
    }
    if (!user.isAnonymous) {
      setMsg("縺吶〒縺ｫ蛹ｿ蜷阪Θ繝ｼ繧ｶ繝ｼ縺ｧ縺ｯ縺ゅｊ縺ｾ縺帙ｓ・医Μ繝ｳ繧ｯ荳崎ｦ・ｼ峨・);
      return;
    }
    if (!email || !pw) {
      setMsg("繝｡繝ｼ繝ｫ縺ｨ繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
      return;
    }

    try {
      setBusy(true);
      const cred = EmailAuthProvider.credential(email, pw);
      const res = await linkWithCredential(user, cred);
      setMsg(`繝ｪ繝ｳ繧ｯ螳御ｺ・ｼ・UID縺ｯ邯咏ｶ・ ${res.user.uid}`);
      // 縺昴・縺ｾ縺ｾ謌ｻ繧九↑繧会ｼ・
      // navigate("/review");
    } catch (e) {
      // 莉｣陦ｨ逧・↑繧ｨ繝ｩ繝ｼ縺縺大・縺九ｊ繧・☆縺・
      const code = e?.code || "";
      if (code === "auth/email-already-in-use") {
        setMsg("縺薙・繝｡繝ｼ繝ｫ縺ｯ譌｢蟄倥い繧ｫ繧ｦ繝ｳ繝医〒菴ｿ繧上ｌ縺ｦ縺・∪縺吶ゅョ繝ｼ繧ｿ遘ｻ陦鯉ｼ医・繝ｼ繧ｸ・峨′蠢・ｦ√〒縺吶・);
      } else if (code === "auth/invalid-email") {
        setMsg("繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｮ蠖｢蠑上′豁｣縺励￥縺ゅｊ縺ｾ縺帙ｓ縲・);
      } else if (code === "auth/weak-password") {
        setMsg("繝代せ繝ｯ繝ｼ繝峨′蠑ｱ縺吶℃縺ｾ縺呻ｼ・譁・ｭ嶺ｻ･荳翫↓・峨・);
      } else if (code === "auth/requires-recent-login") {
        setMsg("螳牙・縺ｮ縺溘ａ蜀阪Ο繧ｰ繧､繝ｳ縺悟ｿ・ｦ√〒縺吶ゅ＞縺｣縺溘ｓ繧ｵ繧､繝ｳ繧､繝ｳ縺礼峩縺励※縺上□縺輔＞縲・);
      } else {
        setMsg(`繝ｪ繝ｳ繧ｯ螟ｱ謨・ ${code || e.message}`);
      }
      console.error("[link] error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 520 }}>
      <h1 className="text-xl font-bold mb-2">蛹ｿ蜷阪い繧ｫ繧ｦ繝ｳ繝医ｒ繝｡繝ｼ繝ｫ縺ｫ繝ｪ繝ｳ繧ｯ</h1>

      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
        迴ｾ蝨ｨ縺ｮUID: <code>{uid || "窶・}</code>{" "}
        {uid ? (isAnon ? "(蛹ｿ蜷・" : "(蛹ｿ蜷阪〒縺ｯ縺ｪ縺・") : ""}
      </div>

      <form onSubmit={handleLink} style={{ display: "grid", gap: 8 }}>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="繝代せ繝ｯ繝ｼ繝会ｼ・譁・ｭ嶺ｻ･荳奇ｼ・
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #09f",
            background: busy ? "#09f3" : "#09f2",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "繝ｪ繝ｳ繧ｯ荳ｭ窶ｦ" : "蛹ｿ蜷坂・繝｡繝ｼ繝ｫ縺ｫ繝ｪ繝ｳ繧ｯ縺吶ｋ"}
        </button>
      </form>

      {msg && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Link to="/review">竊・蠕ｩ鄙剃ｸ隕ｧ縺ｸ謌ｻ繧・/Link>
      </div>
    </div>
  );
}
