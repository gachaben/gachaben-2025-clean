// src/App.jsx
import { Routes, Route } from "react-router-dom";
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
      <Route path="/battle" element={<BattleStartPage />} />
      <Route path="/battle/play" element={<BattlePlayPage />} />
    </Routes>
  );
}
