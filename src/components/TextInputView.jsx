import React, { useState, useMemo } from "react";

/**
 * 險倩ｿｰ蠑上ン繝･繝ｼ・・ype: 'text'・・
 * - 豁｣隗｣縺ｯ question.correctAnswer・域枚蟄怜・・・
 * - 隍・焚豁｣隗｣繧定ｨｱ縺励◆縺・ｴ蜷医・ question.altAnswers (string[]) 繧貞茜逕ｨ・井ｻｻ諢擾ｼ・
 * - 螟ｧ譁・ｭ怜ｰ乗枚蟄・遨ｺ逋ｽ/蜈ｨ隗貞濠隗偵・繧・ｉ縺弱ｒ蜷ｸ蜿弱＠縺ｦ豈碑ｼ・
 */
export default function TextInputView({ question, onCorrect, onWrong }) {
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState("");

  const answers = useMemo(() => {
    const main = String(question.correctAnswer ?? "");
    const alts = Array.isArray(question.altAnswers) ? question.altAnswers : [];
    return [main, ...alts].map(normalize);
  }, [question.id]);

  function normalize(s) {
    // 蜑榊ｾ檎ｩｺ逋ｽ髯､蜴ｻ 竊・蜈ｨ隗停・蜊願ｧ・竊・蜈ｨ縺ｦ蟆乗枚蟄・
    return String(s ?? "")
      .trim()
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\s+/g, " "); // 騾｣邯夂ｩｺ逋ｽ縺ｯ1縺､縺ｫ
  }

  function submit() {
    const ok = answers.includes(normalize(val));
    if (ok) {
      setMsg("OK!");
      onCorrect();
    } else {
      setMsg("縺｡縺後≧窶ｦ 繧ゅ≧荳蠎ｦ縲・);
      onWrong();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") submit();
  }

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="縺薙％縺ｫ蜈･蜉・
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ccc",
          fontSize: 16
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ccc" }}>
          騾∽ｿ｡
        </button>
        <button onClick={() => setVal("")} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ccc" }}>
          繧ｯ繝ｪ繧｢
        </button>
      </div>
      <div style={{ minHeight: 22, color: "#666" }}>{msg}</div>
    </div>
  );
}
