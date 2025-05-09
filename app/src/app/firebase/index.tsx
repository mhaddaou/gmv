// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyB8IH_S99zAUgdyBokV4PcRb6zan58eql4",
  authDomain: "gmb-v2-30596.firebaseapp.com",
  projectId: "gmb-v2-30596",
  storageBucket: "gmb-v2-30596.firebasestorage.app",
  messagingSenderId: "1084506021295",
  appId: "1:1084506021295:web:83e183cc4b45f396fd235a",
  measurementId: "G-28WCP62CHM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  // Firestore initialization
export const storage = getStorage(app);  // Firebase Storage