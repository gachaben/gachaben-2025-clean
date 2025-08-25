import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { subjectUnits } from "../data/subjectUnits";

const AiCheckPage = () => {
  const navigate = useNavigate();
  const [grade, setGrade] = useState("1年甁E);
  const [subject, setSubject] = useState("国誁E);
  const [unit, setUnit] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = () => {
    navigate("/ai-result", {
      state: { grade, subject, unit, topic }
    });
  };

  const units = Object.keys(subjectUnits[subject] || {});
  const topics = subjectUnits[subject]?.[unit] || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">🧠 AI診断依頼フォーム</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">学年�E�E/label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border p-2 w-full">
          <option>1年甁E/option>
          <option>2年甁E/option>
          <option>3年甁E/option>
          <option>4年甁E/option>
          <option>5年甁E/option>
          <option>6年甁E/option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">教科！E/label>
        <select value={subject} onChange={(e) => {
          setSubject(e.target.value);
          setUnit("");
          setTopic("");
        }} className="border p-2 w-full">
          {Object.keys(subjectUnits).map((subj) => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>
      </div>

      {units.length > 0 && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">単�E�E�E/label>
          <select value={unit} onChange={(e) => {
            setUnit(e.target.value);
            setTopic("");
          }} className="border p-2 w-full">
            <option value="">選んでください</option>
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      )}

      {topics.length > 0 && (
        <div className="mb-6">
          <label className="block font-semibold mb-1">冁E���E�狙ぁE��！E/label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="border p-2 w-full">
            <option value="">選んでください</option>
            {topics.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      <button
        disabled={!grade || !subject || !unit || !topic}
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        ✁E診断へすすむ
      </button>
    </div>
  );
};

export default AiCheckPage;
