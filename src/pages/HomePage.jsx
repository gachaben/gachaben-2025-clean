// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">Home</h1>
      <div className="flex gap-3">
        <Link to="/history" className="underline text-blue-600">History</Link>
        <Link to="/review"  className="underline text-blue-600">Review</Link>
        <Link to="/battle"  className="underline text-blue-600">Battle</Link>
      </div>
      <p className="text-sm text-gray-600">トップページ（暫定）。必要に応じて差し替えてOK。</p>
    </div>
  );
}
