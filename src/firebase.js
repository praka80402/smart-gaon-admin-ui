// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// --- Your Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCSgQIgUHr6rDadgoO2Xix28lUObDOwXNY",
  authDomain: "smart-village-8f058.firebaseapp.com",
  projectId: "smart-village-8f058",
 storageBucket: "smart-village-8f058.appspot.com",
  // OK
  messagingSenderId: "287740945459",
  appId: "1:287740945459:web:d896499264a31739a52f46",
  measurementId: "G-VVHX0H79ZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
