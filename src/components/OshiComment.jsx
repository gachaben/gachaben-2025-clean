// src/components/OshiComment.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const OshiComment = ({ message }) => {
  const [oshiImage, setOshiImage] = useState(null);

  useEffect(() => {
    const fetchOshi = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const image = data.oshi || "nyannyan"; // fallback
        setOshiImage(`/images/${image}.png`);
      }
    };

    fetchOshi();
  }, []);

  return (
    <div className="flex items-center p-2 bg-yellow-100 rounded-xl shadow-md my-4">
      {oshiImage && (
        <img src={oshiImage} alt="ナビキャラ" className="w-16 h-16 mr-3" />
      )}
      <p className="text-base font-bold text-gray-800">{message}</p>
    </div>
  );
};

export default OshiComment;
