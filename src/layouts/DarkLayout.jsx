// src/layouts/DarkLayout.jsx
import React from "react";

export default function DarkLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
