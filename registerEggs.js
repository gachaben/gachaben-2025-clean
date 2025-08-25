// scripts/registerEggs.js
import { initializeApp } from "firebase/app";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

// ✅ あなたの Firebase 設定に差し替えてください
const firebaseConfig = {
  apiKey: "AIzaSyCYoonUtU7leRNcHx0lKA_azeMWvjFYTuo",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.firebasestorage.app",
  messagingSenderId: "929513375207",
  appId: "1:929513375207:web:94167d7e05eff28b7f2942",
};

const app = initializeApp(firebaseConfig);

// 🥚 登録したい卵の情報をここに並べていきます（imageNameは必ず .png付き！）
const eggDataList = [
  {
    stage: "egg",
    imageName: "001_herakuresu_egg.png",
    name: "ヘラクレスオオカブトのたまご"
  },
  {
    stage: "egg",
    imageName: "002_ageha_egg.png",
    name: "アゲハチョウのたまご"
  },
  {
    stage: "egg",
    imageName: "003_hati_egg.png",
    name: "ハチのたまご"
  },
  {
    stage: "egg",
    imageName: "004_hotaru_egg.png",
    name: "ホタルのたまご"
  },
  {
    stage: "egg",
    imageName: "005_kabuto_egg.png",
    name: "カブトムシのたまご"
  },
  {
    stage: "egg",
    imageName: "006_monsiro_egg.png",
    name: "モンシロチョウのたまご"  
  },
    {
    stage: "egg",
    imageName: "007_semi_egg.png",
    name: "セミのたまご"
  },
  {
    stage: "egg",
    imageName: "008_tentoumusi_egg.png",
    name: "テントウムシのたまご"
  },
  {
    stage: "egg",
    imageName: "009_tombo_egg.png",
    name: "トンボのたまご"    
　},
  {
    stage: "egg",
    imageName: "010_kuwagata_egg.png",
    name: "クワガタムシのたまご"
  }
];

const registerEggs = async () => {
  try {
    for (const item of eggDataList) {
      await addDoc(collection(db, "ownedEggs"), item);
      console.log("登録完了:", item.name);
    }
    console.log("すべての卵を登録しました！");
  } catch (error) {
    console.error("登録中にエラー:", error);
  }
};

registerEggs();
