// src/pages/TodoPage.js
import React, { useEffect, useState } from "react";
import { auth } from "../firebase-config";
import {
  listenToTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "../services/todoService";

const TodoPage = () => {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);

  // Form states
  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priority, setPriority] = useState("medium");
  
  // Controls states
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Toate");
  
  // Edit states
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  
  // Stare pentru re-randare la fiecare minut
  const [, setTick] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
     return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => {
        setTick(t => t + 1);
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  const MAX_YEAR = 2067;
  const MAX_DATE_STRING = "2067-12-31";
  const TODAY = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let unsubscribeTodos = null;
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        unsubscribeTodos = listenToTodos(currentUser.uid, (firebaseList) => {
          setTodos(firebaseList);
        });
      } else {
        setUser(null);
        setTodos([]);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeTodos) unsubscribeTodos();
    };
  }, []);

  const priorityText = { low: "Scăzută", medium: "Mediu", high: "Ridicată" };

  // Culorile steluțelor (vor fi folosite în interiorul etichetei albe)
  const starColors = {
    low: "#38A169",    // Verde mai închis pentru contrast pe alb
    medium: "#D69E2E", // Galben auriu
    high: "#E53E3E"    // Roșu
  };

  const starIcons = {
    low: "★",          
    medium: "★★",      
    high: "★★★"        
  };

  const statusBackgrounds = {
    "Finalizat": "rgba(34, 84, 61, 0.9)",   
    "Urmează": "rgba(116, 66, 16, 0.9)",    
    "Anulat": "rgba(110, 25, 25, 0.9)",     
    "Restant": "rgba(76, 29, 149, 0.9)"     
  };

  // --- STILUL PENTRU ETICHETE (BADGES) ---
  // Asta face ca Data, Ora și Steluțele să arate la fel (alb, rotunjit)
  const badgeStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Aproape alb opac
    color: "#1a202c", // Text gri foarte închis (aproape negru)
    padding: "6px 12px",
    borderRadius: "12px", // Colțuri rotunjite
    fontSize: "0.85rem",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)", // Umbră fină
    whiteSpace: "nowrap" // Să nu se rupă textul
  };

  const calculateStatus = (task) => {
    if (task.status === "Finalizat" || task.status === "Anulat") {
        return task.status;
    }

    if (!task.deadline) return task.status;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const taskDeadline = task.deadline;

    if (todayStr > taskDeadline) {
        return "Restant"; 
    }

    if (todayStr === taskDeadline && task.endTime) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const [endH, endM] = task.endTime.split(':').map(Number);

        if (currentHour > endH || (currentHour === endH && currentMinute > endM)) {
            return "Restant";
        }
    }

    return task.status;
  };

  const handleDateChange = (e, setFunction) => {
    let val = e.target.value;
    if (!val) { setFunction(""); return; }
    const parts = val.split("-");
    let year = parts[0];
    if (year.length === 4) {
      const numericYear = parseInt(year);
      if (numericYear > 2067) year = "2067";
      else if (numericYear > 1000 && numericYear < 2025) year = "2025";
    }
    val = `${year}-${parts[1]}-${parts[2]}`;
    setFunction(val);
  };

  const handleAdd = async () => {
    if (!text || !deadline) return;

    if (deadline < TODAY) {
        alert("Nu poți alege o dată din trecut!");
        return;
    }

    await addTodo(user.uid, { text, deadline, startTime, endTime, priority, status: "Urmează" });
    setText(""); setDeadline(""); setStartTime(""); setEndTime(""); setPriority("medium");
  };

  const startEditing = (t) => {
    setEditId(t.id); setEditText(t.text); setEditDate(t.deadline);
    setEditStartTime(t.startTime || ""); setEditEndTime(t.endTime || "");
    setEditPriority(t.priority === "Scăzută" || t.priority === "low" ? "low" : t.priority === "Ridicată" || t.priority === "high" ? "high" : "medium");
  };

  const saveEdit = async (id) => {
    if (editDate < TODAY) {
        alert("Nu poți seta o dată din trecut!");
        return;
    }
    await updateTodo(id, { text: editText, deadline: editDate, startTime: editStartTime, endTime: editEndTime, priority: editPriority });
    setEditId(null);
  };

  const changeStatus = async (id, newStatus) => {
    let statusToSave = newStatus;
    if (newStatus === "Restant") {
        statusToSave = "Urmează";
    }
    await updateTodo(id, { status: statusToSave });
  };

  const filtered = todos
    .map(t => ({ ...t, calculatedStatus: calculateStatus(t) })) 
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => filterStatus === "Toate" ? true : t.calculatedStatus === filterStatus);

  const completed = todos.filter((t) => t.status === "Finalizat").length;
  const percent = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  return (
    <div className={darkMode ? "theme-dark" : ""}>
      <div className="container">
        
        {/* Header */}
        <div className="header-actions">
            <button className="btn-theme" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"} Schimbă tema
            </button>
            <button className="btn-theme" onClick={() => auth.signOut()}>
            🔓 Logout
            </button>
        </div>

        {/* ============= GRID DASHBOARD ============= */}
        <div className="dashboard-grid">

            {/* --- STÂNGA --- */}
            <div className="left-panel">
                <h1 className="main-title">To Do List</h1>
                
                <div className="user-id-display">
                    Utilizator: <span className="id-mono">{user?.displayName}</span>
                </div>

                <div className="stats-container">
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="progress-text">{completed} din {todos.length} activități ({percent}%)</div>
                </div>

                <div className="form-container">
                    <input className="form-input" placeholder="Adaugă activitate..." value={text} onChange={(e) => setText(e.target.value)} />
                    
                    <input 
                        type="date" 
                        className="form-input" 
                        value={deadline} 
                        min={TODAY} 
                        max={MAX_DATE_STRING} 
                        onChange={(e) => handleDateChange(e, setDeadline)} 
                    />
                    
                    <div className="time-row">
                        <div className="time-input-group">
                            <span className="time-input-label">De la:</span>
                            <input type="time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                        <div className="time-input-group">
                            <span className="time-input-label">Până la:</span>
                            <input type="time" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="action-row">
                        <select className="control-select" value={priority} onChange={(e) => setPriority(e.target.value)} style={{flex: 1}}>
                            <option value="low">Scăzută</option>
                            <option value="medium">Mediu</option>
                            <option value="high">Ridicată</option>
                        </select>
                        <button className="btn-add" onClick={handleAdd}>Adaugă</button>
                    </div>
                </div>
            </div>

            {/* --- DREAPTA --- */}
            <div className="right-panel">
                
                <div className="controls-container">
                    <input className="form-input" placeholder="Caută..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    
                    <select className="control-select" style={{width: 'auto'}} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option>Toate</option>
                        <option value="Urmează">Urmează</option>
                        <option value="Restant">Restant</option>
                        <option value="Finalizat">Finalizat</option>
                        <option value="Anulat">Anulat</option>
                    </select>
                </div>

                <ul className="task-list">
                    {filtered.length === 0 ? (
                        <div className="empty-list-message">Nu s-au găsit activități.</div>
                    ) : (
                        filtered.map((t) => {
                        const p = t.priority === "Scăzută" || t.priority === "low" ? "low" : t.priority === "Ridicată" || t.priority === "high" ? "high" : "medium";
                        
                        const currentStatus = t.calculatedStatus; 
                        const cardBg = statusBackgrounds[currentStatus] || "";
                        const isOverdue = currentStatus === "Restant";

                        return (
                            <li 
                                key={t.id} 
                                className={`task priority-${p}`}
                                style={{ 
                                    backgroundColor: cardBg,
                                    transition: "background-color 0.3s ease",
                                    color: "#fff"
                                }}
                            >
                            {editId === t.id ? (
                                <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                    <input className="form-input" value={editText} onChange={(e) => setEditText(e.target.value)} />
                                    <div style={{display:'flex', gap: 10}}>
                                        <input 
                                            type="date" 
                                            className="form-input" 
                                            value={editDate} 
                                            min={TODAY} 
                                            max={MAX_DATE_STRING} 
                                            onChange={(e) => handleDateChange(e, setEditDate)} 
                                        />
                                        <select className="priority-select" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                                            <option value="low">Scăzută</option>
                                            <option value="medium">Mediu</option>
                                            <option value="high">Ridicată</option>
                                        </select>
                                    </div>
                                    <div style={{display:'flex', gap: 10}}>
                                        <input type="time" className="form-input" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
                                        <input type="time" className="form-input" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} />
                                    </div>
                                    
                                    <div style={{display:'flex', justifyContent: 'flex-end', gap: 15, marginTop: 50}}>
                                        <button className="btn-save" onClick={() => saveEdit(t.id)}>💾 Salvează</button>
                                        <button className="btn-cancel" onClick={() => setEditId(null)}>🚫 Anulează</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                <div className="task-info">
                                    <div className="task-text">{t.text}</div>
                                    
                                    {/* --- ZONA CU ETICHETE (BADGES) --- */}
                                    {/* Am folosit flex-wrap ca să se așeze frumos dacă nu au loc */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                                        
                                        {/* 1. BADGE PRIORITATE (STELE) */}
                                        <div style={badgeStyle} title={`Prioritate: ${priorityText[p]}`}>
                                            <span style={{ 
                                                color: starColors[p], 
                                                fontSize: "1.2rem", 
                                                lineHeight: "0.8",
                                                paddingBottom: "2px"
                                            }}>
                                                {starIcons[p]}
                                            </span>
                                        </div>

                                        {/* 2. BADGE DATA */}
                                        <div style={badgeStyle}>
                                            <span style={{ fontSize: "1rem" }}>📅</span>
                                            {t.deadline}
                                        </div>

                                        {/* 3. BADGE TIMP (Dacă există) */}
                                        {t.startTime && t.endTime && (
                                            <div style={badgeStyle}>
                                                <span style={{ fontSize: "1rem" }}>⏰</span> 
                                                {t.startTime} - {t.endTime}
                                            </div>
                                        )}
                                    </div>

                                </div>
                                <div className="actions">
                                    <select 
                                        className="status-select" 
                                        style={{
                                            padding: '12px 16px',
                                            fontSize: '1rem',
                                            width: 'auto', 
                                            cursor: isOverdue ? 'not-allowed' : 'pointer', 
                                            minWidth: '120px',
                                            fontWeight: '600',
                                            opacity: isOverdue ? 0.8 : 1 
                                        }} 
                                        value={currentStatus} 
                                        onChange={(e) => changeStatus(t.id, e.target.value)}
                                        disabled={isOverdue} 
                                    >
                                        <option value="Urmează">Urmează</option>
                                        {isOverdue && <option value="Restant">Restant</option>}
                                        <option value="Finalizat">Finalizat</option>
                                        <option value="Anulat">Anulat</option>
                                    </select>

                                    <button className="btn-edit" onClick={() => startEditing(t)}>✏️</button>
                                    <button className="btn-delete" onClick={() => deleteTodo(t.id)}>❌</button>
                                </div>
                                </>
                            )}
                            </li>
                        );
                        })
                    )}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;