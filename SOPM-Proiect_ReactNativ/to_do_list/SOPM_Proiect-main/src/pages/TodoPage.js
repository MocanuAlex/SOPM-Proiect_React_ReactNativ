import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView, // Adăugat pentru structură
  StatusBar,    // Adăugat pentru controlul barei de stare
} from "react-native";
import { auth } from "../firebase-config";
import {
  listenToTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "../services/todoService";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomPicker from "../components/CustomPicker";

const TodoPage = () => {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const navigation = useNavigation();

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

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const value = await AsyncStorage.getItem("darkMode");
        if (value !== null) {
          setDarkMode(value === "true");
        }
      } catch (error) {
        console.error("Error loading dark mode:", error);
      }
    };
    loadDarkMode();
  }, []);

  useEffect(() => {
    const saveDarkMode = async () => {
      try {
        await AsyncStorage.setItem("darkMode", darkMode.toString());
      } catch (error) {
        console.error("Error saving dark mode:", error);
      }
    };
    saveDarkMode();
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
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
        navigation.replace("Login");
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeTodos) unsubscribeTodos();
    };
  }, [navigation]);

  const priorityText = { low: "Scăzută", medium: "Mediu", high: "Ridicată" };

  const starColors = {
    low: "#38A169",
    medium: "#D69E2E",
    high: "#E53E3E",
  };

  const starIcons = {
    low: "★",
    medium: "★★",
    high: "★★★",
  };

  const statusBackgrounds = {
    Finalizat: "rgba(34, 84, 61, 0.9)",
    Urmează: "rgba(116, 66, 16, 0.9)",
    Anulat: "rgba(110, 25, 25, 0.9)",
    Restant: "rgba(76, 29, 149, 0.9)",
  };

  const calculateStatus = (task) => {
    if (task.status === "Finalizat" || task.status === "Anulat") {
      return task.status;
    }

    if (!task.deadline) return task.status;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const taskDeadline = task.deadline;

    if (todayStr > taskDeadline) {
      return "Restant";
    }

    if (todayStr === taskDeadline && task.endTime) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [endH, endM] = task.endTime.split(":").map(Number);

      if (currentHour > endH || (currentHour === endH && currentMinute > endM)) {
        return "Restant";
      }
    }

    return task.status;
  };

  const handleAdd = async () => {
    if (!text || !deadline) return;

    if (deadline < TODAY) {
      Alert.alert("Eroare", "Nu poți alege o dată din trecut!");
      return;
    }

    await addTodo(user.uid, {
      text,
      deadline,
      startTime,
      endTime,
      priority,
      status: "Urmează",
    });
    setText("");
    setDeadline("");
    setStartTime("");
    setEndTime("");
    setPriority("medium");
  };

  const startEditing = (t) => {
    setEditId(t.id);
    setEditText(t.text);
    setEditDate(t.deadline);
    setEditStartTime(t.startTime || "");
    setEditEndTime(t.endTime || "");
    setEditPriority(
      t.priority === "Scăzută" || t.priority === "low"
        ? "low"
        : t.priority === "Ridicată" || t.priority === "high"
        ? "high"
        : "medium"
    );
  };

  const saveEdit = async (id) => {
    if (editDate < TODAY) {
      Alert.alert("Eroare", "Nu poți seta o dată din trecut!");
      return;
    }
    await updateTodo(id, {
      text: editText,
      deadline: editDate,
      startTime: editStartTime,
      endTime: editEndTime,
      priority: editPriority,
    });
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
    .map((t) => ({ ...t, calculatedStatus: calculateStatus(t) }))
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()))
    .filter(
      (t) => filterStatus === "Toate" || t.calculatedStatus === filterStatus
    );

  const completed = todos.filter((t) => t.status === "Finalizat").length;
  const percent = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgColor }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={darkMode ? "light-content" : "dark-content"} />
      <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.btnTheme, { backgroundColor: theme.inputBg }]}
              onPress={() => setDarkMode(!darkMode)}
            >
              <Text style={{ color: theme.textColor }}>
                {darkMode ? "☀️" : "🌙"} Schimbă tema
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnTheme, { backgroundColor: theme.inputBg }]}
              onPress={() => auth.signOut()}
            >
              <Text style={{ color: theme.textColor }}>🔓 Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Left Panel */}
            <View style={styles.leftPanel}>
              <Text style={[styles.mainTitle, { color: theme.textColor }]}>
                To Do List
              </Text>

              <View
                style={[
                  styles.userDisplay,
                  { backgroundColor: theme.highlightBg },
                ]}
              >
                <Text style={[styles.userText, { color: theme.textColor }]}>
                  Utilizator:{" "}
                  <Text style={[styles.userName, { color: theme.highlightColor }]}>
                    {user?.displayName}
                  </Text>
                </Text>
              </View>

              <View
                style={[
                  styles.statsContainer,
                  { backgroundColor: theme.inputBg },
                ]}
              >
                <View
                  style={[
                    styles.progressBarBg,
                    { backgroundColor: theme.progressBg },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${percent}%` },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: theme.subTextColor }]}
                >
                  {completed} din {todos.length} activități ({percent}%)
                </Text>
              </View>

              <View
                style={[
                  styles.formContainer,
                  { backgroundColor: theme.inputBg },
                ]}
              >
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: theme.cardBg,
                      color: theme.textColor,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  placeholder="Adaugă activitate..."
                  placeholderTextColor={theme.subTextColor}
                  value={text}
                  onChangeText={setText}
                />

                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: theme.cardBg,
                      color: theme.textColor,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  placeholder="Data (YYYY-MM-DD)"
                  placeholderTextColor={theme.subTextColor}
                  value={deadline}
                  onChangeText={setDeadline}
                />

                <View style={styles.timeRow}>
                  <View style={styles.timeInputGroup}>
                    <Text
                      style={[styles.timeLabel, { color: theme.subTextColor }]}
                    >
                      De la:
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: theme.cardBg,
                          color: theme.textColor,
                          borderColor: theme.inputBorder,
                        },
                      ]}
                      placeholder="HH:MM"
                      placeholderTextColor={theme.subTextColor}
                      value={startTime}
                      onChangeText={setStartTime}
                    />
                  </View>
                  <View style={styles.timeInputGroup}>
                    <Text
                      style={[styles.timeLabel, { color: theme.subTextColor }]}
                    >
                      Până la:
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: theme.cardBg,
                          color: theme.textColor,
                          borderColor: theme.inputBorder,
                        },
                      ]}
                      placeholder="HH:MM"
                      placeholderTextColor={theme.subTextColor}
                      value={endTime}
                      onChangeText={setEndTime}
                    />
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <CustomPicker
                    selectedValue={priority}
                    onValueChange={setPriority}
                    items={[
                      { label: "Scăzută", value: "low" },
                      { label: "Mediu", value: "medium" },
                      { label: "Ridicată", value: "high" },
                    ]}
                    textColor={theme.textColor}
                    backgroundColor={theme.cardBg}
                    borderColor={theme.inputBorder}
                    style={[styles.pickerContainer, { flex: 1 }]}
                  />
                  <TouchableOpacity
                    style={[styles.btnAdd, { backgroundColor: theme.successColor }]}
                    onPress={handleAdd}
                  >
                    <Text style={styles.btnAddText}>Adaugă</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Right Panel */}
            <View style={styles.rightPanel}>
              <View
                style={[
                  styles.controlsContainer,
                  { backgroundColor: theme.inputBg },
                ]}
              >
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: theme.cardBg,
                      color: theme.textColor,
                      borderColor: theme.inputBorder,
                      flex: 1,
                    },
                  ]}
                  placeholder="Caută..."
                  placeholderTextColor={theme.subTextColor}
                  value={search}
                  onChangeText={setSearch}
                />

                <CustomPicker
                  selectedValue={filterStatus}
                  onValueChange={setFilterStatus}
                  items={[
                    { label: "Toate", value: "Toate" },
                    { label: "Urmează", value: "Urmează" },
                    { label: "Restant", value: "Restant" },
                    { label: "Finalizat", value: "Finalizat" },
                    { label: "Anulat", value: "Anulat" },
                  ]}
                  textColor={theme.textColor}
                  backgroundColor={theme.cardBg}
                  borderColor={theme.inputBorder}
                  style={[styles.pickerContainer, { width: 150 }]}
                />
              </View>

              {filtered.length === 0 ? (
                <View style={styles.emptyList}>
                  <Text style={[styles.emptyText, { color: theme.subTextColor }]}>
                    Nu s-au găsit activități.
                  </Text>
                </View>
              ) : (
                filtered.map((t) => {
                  const p =
                    t.priority === "Scăzută" || t.priority === "low"
                      ? "low"
                      : t.priority === "Ridicată" || t.priority === "high"
                      ? "high"
                      : "medium";

                  const currentStatus = t.calculatedStatus;
                  const cardBg = statusBackgrounds[currentStatus] || theme.inputBg;
                  const isOverdue = currentStatus === "Restant";

                  return (
                    <View
                      key={t.id}
                      style={[
                        styles.task,
                        {
                          backgroundColor: cardBg,
                          borderLeftColor: starColors[p],
                        },
                      ]}
                    >
                      {editId === t.id ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            style={[
                              styles.formInput,
                              {
                                backgroundColor: theme.cardBg,
                                color: theme.textColor,
                                borderColor: theme.inputBorder,
                              },
                            ]}
                            value={editText}
                            onChangeText={setEditText}
                          />
                          <View style={styles.editRow}>
                            <TextInput
                              style={[
                                styles.formInput,
                                {
                                  backgroundColor: theme.cardBg,
                                  color: theme.textColor,
                                  borderColor: theme.inputBorder,
                                  flex: 1,
                                },
                              ]}
                              placeholder="Data"
                              placeholderTextColor={theme.subTextColor}
                              value={editDate}
                              onChangeText={setEditDate}
                            />
                            <CustomPicker
                              selectedValue={editPriority}
                              onValueChange={setEditPriority}
                              items={[
                                { label: "Scăzută", value: "low" },
                                { label: "Mediu", value: "medium" },
                                { label: "Ridicată", value: "high" },
                              ]}
                              textColor={theme.textColor}
                              backgroundColor={theme.cardBg}
                              borderColor={theme.inputBorder}
                              style={[styles.pickerContainer, { flex: 1 }]}
                            />
                          </View>
                          <View style={styles.editRow}>
                            <TextInput
                              style={[
                                styles.formInput,
                                {
                                  backgroundColor: theme.cardBg,
                                  color: theme.textColor,
                                  borderColor: theme.inputBorder,
                                  flex: 1,
                                },
                              ]}
                              placeholder="De la"
                              placeholderTextColor={theme.subTextColor}
                              value={editStartTime}
                              onChangeText={setEditStartTime}
                            />
                            <TextInput
                              style={[
                                styles.formInput,
                                {
                                  backgroundColor: theme.cardBg,
                                  color: theme.textColor,
                                  borderColor: theme.inputBorder,
                                  flex: 1,
                                },
                              ]}
                              placeholder="Până la"
                              placeholderTextColor={theme.subTextColor}
                              value={editEndTime}
                              onChangeText={setEditEndTime}
                            />
                          </View>

                          <View style={styles.editActions}>
                            <TouchableOpacity
                              style={[
                                styles.btnSave,
                                { backgroundColor: theme.successColor },
                              ]}
                              onPress={() => saveEdit(t.id)}
                            >
                              <Text style={styles.btnSaveText}>💾 Salvează</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.btnCancel,
                                { backgroundColor: theme.dangerColor },
                              ]}
                              onPress={() => setEditId(null)}
                            >
                              <Text style={styles.btnCancelText}>🚫 Anulează</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <>
                          <View style={styles.taskInfo}>
                            <Text style={styles.taskText}>{t.text}</Text>

                            <View style={styles.badgesContainer}>
                              <View style={styles.badge}>
                                <Text
                                  style={[
                                    styles.badgeStar,
                                    { color: starColors[p] },
                                  ]}
                                >
                                  {starIcons[p]}
                                </Text>
                              </View>

                              <View style={styles.badge}>
                                <Text style={styles.badgeText}>📅 {t.deadline}</Text>
                              </View>

                              {t.startTime && t.endTime && (
                                <View style={styles.badge}>
                                  <Text style={styles.badgeText}>
                                    ⏰ {t.startTime} - {t.endTime}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                          <View style={styles.actions}>
                            <CustomPicker
                              selectedValue={currentStatus}
                              onValueChange={(value) => changeStatus(t.id, value)}
                              enabled={!isOverdue}
                              items={[
                                { label: "Urmează", value: "Urmează" },
                                ...(isOverdue
                                  ? [{ label: "Restant", value: "Restant" }]
                                  : []),
                                { label: "Finalizat", value: "Finalizat" },
                                { label: "Anulat", value: "Anulat" },
                              ]}
                              textColor={theme.textColor}
                              backgroundColor={theme.cardBg}
                              borderColor={theme.inputBorder}
                              style={[
                                styles.pickerContainer,
                                {
                                  minWidth: 120,
                                  opacity: isOverdue ? 0.8 : 1,
                                },
                              ]}
                            />

                            <TouchableOpacity
                              style={styles.btnEdit}
                              onPress={() => startEditing(t)}
                            >
                              <Text style={styles.btnEditText}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.btnDelete}
                              onPress={() => deleteTodo(t.id)}
                            >
                              <Text style={styles.btnDeleteText}>❌</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const lightTheme = {
  bgColor: "#dbe2ea",
  cardBg: "#f8faff",
  textColor: "#1a202c",
  subTextColor: "#4a5568",
  inputBg: "#edf2f7",
  inputBorder: "#cbd5e0",
  highlightBg: "#e2e8f0",
  highlightColor: "#2b6cb0",
  progressBg: "#cbd5e0",
  successColor: "#38a169",
  dangerColor: "#e53e3e",
};

const darkTheme = {
  bgColor: "#1a202c",
  cardBg: "#2d3748",
  textColor: "#f7fafc",
  subTextColor: "#a0aec0",
  inputBg: "#4a5568",
  inputBorder: "#4a5568",
  highlightBg: "#2c5282",
  highlightColor: "#90cdf4",
  progressBg: "rgba(0, 0, 0, 0.4)",
  successColor: "#68d391",
  dangerColor: "#fc8181",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Setat manual la 250 pixeli pentru a coborî tot layout-ul
    paddingTop: Platform.OS === "android" ? 250 : 0,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
    marginBottom: 20,
  },
  btnTheme: {
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e0",
  },
  mainContent: {
    gap: 30,
  },
  leftPanel: {
    gap: 25,
    marginBottom: 30,
  },
  rightPanel: {
    gap: 20,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 5,
  },
  userDisplay: {
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: "center",
  },
  userText: {
    fontSize: 16,
  },
  userName: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "700",
  },
  statsContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  progressBarBg: {
    height: 12,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#48bb78",
  },
  progressText: {
    fontWeight: "600",
    fontSize: 16,
  },
  formContainer: {
    padding: 30,
    borderRadius: 20,
    gap: 20,
  },
  formInput: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
  },
  timeRow: {
    flexDirection: "row",
    gap: 20,
  },
  timeInputGroup: {
    flex: 1,
    gap: 8,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    gap: 15,
    alignItems: "stretch",
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
  },
  btnAdd: {
    padding: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  btnAddText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
  },
  task: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
    paddingRight: 20,
  },
  taskText: {
    fontWeight: "800",
    fontSize: 20,
    marginBottom: 8,
    color: "#fff",
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#1a202c",
    fontSize: 14,
    fontWeight: "700",
  },
  badgeStar: {
    fontSize: 18,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  btnEdit: {
    padding: 5,
  },
  btnEditText: {
    fontSize: 24,
  },
  btnDelete: {
    padding: 5,
  },
  btnDeleteText: {
    fontSize: 24,
  },
  editContainer: {
    width: "100%",
    gap: 10,
  },
  editRow: {
    flexDirection: "row",
    gap: 10,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
    marginTop: 20,
  },
  btnSave: {
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnSaveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  btnCancel: {
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnCancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyList: {
    padding: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontStyle: "italic",
  },
});

export default TodoPage;