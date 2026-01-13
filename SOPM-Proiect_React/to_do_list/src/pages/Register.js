import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase-config";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
// Așa este corect acum, fiind în același folder:
import "./register_login.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      if (!name.trim()) {
        setError("Introduceți un nume.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // salvăm numele în profilul Firebase Auth
      await updateProfile(user, { displayName: name });

      // salvăm date în Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Înregistrare</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Nume complet..."
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Parolă..."
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Creează cont</button>

      <p>
        Ai deja cont? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
