import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBQzVwcw7ja89g961b446HTbuEMnaEzEI4",
  authDomain: "hokubu-map.firebaseapp.com",
  projectId: "hokubu-map",
  storageBucket: "hokubu-map.firebasestorage.app",
  messagingSenderId: "130694136889",
  appId: "1:130694136889:web:61ed1e4f8aaed2e285b9e8"
};

// Firebase初期化
const app = initializeApp(firebaseConfig)

// 🔥 ここが重要
export const auth = getAuth(app)
export const db = getFirestore(app)
