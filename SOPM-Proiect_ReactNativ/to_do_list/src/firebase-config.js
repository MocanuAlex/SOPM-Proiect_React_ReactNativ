import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdaV6uxP9gBLRBXaOarWKIwPKEUSELTTQ",
  authDomain: "sopm-proiect.firebaseapp.com",
  projectId: "sopm-proiect",
  storageBucket: "sopm-proiect.firebasestorage.app",
  messagingSenderId: "200527352532",
  appId: "1:200527352532:web:d44ef73f1586cde35f2141"
};

const app = initializeApp(firebaseConfig);

// Exportăm instanțele pentru restul aplicației
export const auth = getAuth(app);
export const db = getFirestore(app);

