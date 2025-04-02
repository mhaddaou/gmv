// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBtK3xvbj4kvbj-VgtJDwTzgNmI4mJ0vIQ",
  authDomain: "gmb-builder-65f2e.firebaseapp.com",
  projectId: "gmb-builder-65f2e",
  storageBucket: "gmb-builder-65f2e.appspot.com",
  messagingSenderId: "23608424002",
  appId: "1:23608424002:web:7292d86adc64b086a35fdb",
  measurementId: "G-ELJYS7G9KZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  // Firestore initialization
export const storage = getStorage(app);  // Firebase Storage