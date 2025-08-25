import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

const oshiList = [
  { id: "wanwan", name: "ワンワン", image: "/images/wanwan.png" },
  { id: "ponpon", name: "ポンポン", image: "/images/ponpon.png" },
  { id: "pyonpyon", name: "ピョンピョン", image: "/images/pyonpyon.png" },
  { id: "nyannyan", name: "ニャンニャン", image: "/images/nyannyan.png" },
  { id: "chunchun", name: "チュンチュン", image: "/images/chunchun.png" },
];

export default function SelectOshiPage() {
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  const handleSelect = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    setSelected(id);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { oshi: id });

    setTimeout(() => {
      navigate("/child-home");
    }, 1000);
  };

  return (
  <div style={{ textAlign: "center" }}>
    <h2>推しキャラをえらんでね！</h2>
    <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
      {oshiList.map((oshi) => {
        console.log("🧪 表示確認:", oshi.name);
        return (
          <div
            key={oshi.id}
            onClick={() => handleSelect(oshi.id)}
            style={{
              cursor: "pointer",
              border:
                selected === oshi.id ? "4px solid gold" : "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <img src={oshi.image} alt={oshi.name} width={100} />
            <p>{oshi.name}</p>
          </div>
        );
      })}
    </div>
  </div>
); }// ← ⭐⭐ これが足りてなかった！
