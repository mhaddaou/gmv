// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyAYRlPT1faKB7GZMsFYdlZvVulNekDJlHQ",
  authDomain: "test-app-4d8d6.firebaseapp.com",
  databaseURL: "https://test-app-4d8d6-default-rtdb.firebaseio.com",
  projectId: "test-app-4d8d6",
  storageBucket: "test-app-4d8d6.firebasestorage.app",
  messagingSenderId: "799383664523",
  appId: "1:799383664523:web:7d000e602d9886ee44618e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  // Firestore initialization
export const storage = getStorage(app);  // Firebase Storage