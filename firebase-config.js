import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-sZsezoQA6VhXTjMxNmKJ3Q3PfpmtkgE",
  authDomain: "dongku-kcg.firebaseapp.com",
  projectId: "dongku-kcg",
  storageBucket: "dongku-kcg.firebasestorage.app",
  messagingSenderId: "713862695975",
  appId: "1:713862695975:web:94a2135223f6350a34d202",
  measurementId: "G-PLGTB6YF7M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db, firebaseConfig };
