import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJHPzYe6rJVuVhfaFT1L0L-I48ifGm_pM",
  authDomain: "kcg-competency-diagnosis.firebaseapp.com",
  projectId: "kcg-competency-diagnosis",
  storageBucket: "kcg-competency-diagnosis.firebasestorage.app",
  messagingSenderId: "648644260799",
  appId: "1:648644260799:web:260cd34647ea00d8f9a70a",
  measurementId: "G-1XV5VSXFYN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db, firebaseConfig };
