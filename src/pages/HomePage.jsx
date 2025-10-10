// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import DoReMiBoard from "@/pages/DoReMiBoard.jsx";
import NoteBurst from "@/components/NoteBurst";

export default function HomePage() {
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    // ログイン直後に一度だけ音符演出を表示
    setShowNotes(true);
    const timer = setTimeout(() => setShowNotes(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-blue-300 overflow-hidden">
      <DoReMiBoard />

      {showNotes && <NoteBurst type="login" />}
    </div>
  );
}
