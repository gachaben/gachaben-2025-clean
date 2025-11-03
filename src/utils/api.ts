// src/utils/api.ts
export async function createBattleEX(uid: string) {
  const apiUrl = import.meta.env.VITE_USE_EMU === "true"
    ? `http://${import.meta.env.VITE_EMU_HOST}:${import.meta.env.VITE_FUNCTIONS_PORT}/gachaben-2025/asia-northeast1/api/createBattle`
    : `https://asia-northeast1-gachaben-2025.cloudfunctions.net/api/createBattle`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });

  if (!res.ok) throw new Error("createBattleEX failed");
  return await res.json();
}
