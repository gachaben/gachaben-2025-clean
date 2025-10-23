const handleCreateBattle = async () => {
  console.log("🎯 createBattle 呼び出し開始");

  try {
    const res = await fetch(
        "http://127.0.0.1:5002/us-central1/createBattle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentId: "cpu-normal",
          cpuLevel: "N",
          startPw: 1000,
        }),
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    console.log("✅ createBattle 成功:", result);
    alert(`バトル作成OK！ID: ${result.id}`);
  } catch (err) {
    console.error("❌ createBattle エラー:", err);
    alert(`エラー発生: ${err.message}`);
  }
};
