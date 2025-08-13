// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import { writeTestBattle } from "./debug/writeTestBattle";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
      </Routes>

      <div style={{ padding: "1rem" }}>
        <h1>Test Firestore Write</h1>
        <button onClick={writeTestBattle}>Write battles test</button>
      </div>
    </>
  );
}
