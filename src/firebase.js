import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Ganti konfigurasi di bawah ini dengan milik proyek Firebase Kak San
const firebaseConfig = {
    apiKey: "AIzaSyDfoknWaV5EAvrageuSiZR0lAcrLGoUxCM",
    authDomain: "hematin-5a503.firebaseapp.com",
    projectId: "hematin-5a503",
    storageBucket: "hematin-5a503.firebasestorage.app",
    messagingSenderId: "778591831617",
    appId: "1:778591831617:web:35abda53f876e381b1e8c0",
    measurementId: "G-LK5MXQLXM9"
};

const app = initializeApp(firebaseConfig);

// Ekspor layanan agar bisa digunakan di App.jsx
export const auth = getAuth(app);
export const db = getFirestore(app);