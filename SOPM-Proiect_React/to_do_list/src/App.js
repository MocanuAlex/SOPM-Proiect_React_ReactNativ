import './App.css';

import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";
// paginile
import Login from "./pages/Login";
import Register from "./pages/Register";
import TodoPage from "./pages/TodoPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // verificăm dacă user-ul e logat
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Se încarcă...</h2>;
  }

  return (
    <Routes>
      {/* Pagina principală -> doar dacă user-ul e logat */}
      <Route 
        path="/" 
        element={user ? <TodoPage /> : <Navigate to="/login" />} 
      />

      {/* Login */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" />} 
      />

      {/* Register */}
      <Route 
        path="/register" 
        element={!user ? <Register /> : <Navigate to="/" />} 
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
