// src/components/BattleStartButton.tsx
import React from "react";
import { apiPost } from "../lib/api";

type Props = {
  onStarted?: (battleId: string) => void; // 親にbattleIdを渡したい時用
  cpuLevel?: "N" | "H" | "EX";
};

export default function BattleStartButton({ onStarted, cpuLevel = "N" }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [lastId, setLastId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<{ ok: boolean; battleId: string }>("/createBattle", {
        uid: "debug-user",
        cpuLevel,
      });
      setLastId(data.battleId);
      onStarted?.(data.battleId);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "作成中..." : "🥊 バトル開始（createBattle）"}
      </button>
      {lastId && (
        <div className="text-sm text-gray-700">
          作成された battleId: <b>{lastId}</b>
        </div>
      )}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}
    </div>
  );
}
