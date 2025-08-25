// seed.js
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "localhost",
  projectId: "demo-project",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8080);

async function seed() {
  await setDoc(doc(db, "items", "test-item-1"), {
    name: "繝・せ繝域・陌ｫ",
    seriesId: "kontyu",
    rank: "S",
    stage: 3,
    imageName: "kabuto_test",
  });
  console.log("笨・seed螳御ｺ・);
}

seed();
