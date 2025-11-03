// src/lib/api.ts
export const API_BASE =
  "http://localhost:5003/gachaben-2025/asia-northeast1/api";

export async function apiPost<T = any>(path: string, body?: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}
