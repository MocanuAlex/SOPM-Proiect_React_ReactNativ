// src/services/todoService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

import { db } from "../firebase-config";

export const listenToTodos = (userId, callback) => {
  const q = query(
    collection(db, "todos"), 
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(list);
  });
};

export const addTodo = async (userId, data) => {
  await addDoc(collection(db, "todos"), {
    userId,
    text: data.text || "",
    priority: data.priority || "medium",
    deadline: data.deadline || "",
    // --- CÂMPURI NOI PENTRU TIMP ---
    startTime: data.startTime || "",
    endTime: data.endTime || "",
    // ------------------------------
    status: data.status || "Upcoming",
    createdAt: serverTimestamp(),
  });
};

export const updateTodo = async (id, data) => {
  await updateDoc(doc(db, "todos", id), data);
};

export const deleteTodo = async (id) => {
  await deleteDoc(doc(db, "todos", id));
};

