import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Task } from "../types";

const LOCAL_STORAGE_KEY = "deadline_ai_tasks";

// Standard seed tasks if local storage is empty
const INITIAL_SEED_TASKS: Task[] = [
  {
    id: "task-1",
    name: "Complete DBMS Final Assignment",
    dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0], // Tomorrow
    priority: "high",
    complexity: "hard",
    category: "study",
    completed: false,
    focusHoursPlanned: 5,
    focusHoursLogged: 2,
    postponedCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-2",
    name: "Design Apple Vision UI Prototypes",
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0], // 3 days
    priority: "high",
    complexity: "medium",
    category: "work",
    completed: false,
    focusHoursPlanned: 8,
    focusHoursLogged: 4,
    postponedCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-3",
    name: "Reorganize Desk & Smart Workstation",
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0], // 5 days
    priority: "low",
    complexity: "easy",
    category: "work",
    completed: true,
    focusHoursPlanned: 2,
    focusHoursLogged: 2,
    postponedCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-4",
    name: "Active Recovery: Swimming / Cardio",
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0], // 2 days
    priority: "medium",
    complexity: "easy",
    category: "health",
    completed: false,
    focusHoursPlanned: 1,
    focusHoursLogged: 0,
    postponedCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-5",
    name: "Weekly Alignment Sync with cofounders",
    dueDate: new Date().toISOString().split("T")[0], // Today
    priority: "medium",
    complexity: "medium",
    category: "social",
    completed: true,
    focusHoursPlanned: 2,
    focusHoursLogged: 2,
    postponedCount: 0,
    createdAt: new Date().toISOString()
  }
];

export async function getUserTasks(userId: string | null): Promise<Task[]> {
  // If not logged in, retrieve from localStorage
  if (!userId) {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!local) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_TASKS));
      return INITIAL_SEED_TASKS;
    }
    return JSON.parse(local);
  }

  try {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((docSnap) => {
      tasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
    });

    if (tasks.length === 0) {
      // First time logging in, write seed tasks for them in Firestore
      for (const t of INITIAL_SEED_TASKS) {
        const { id, ...rest } = t;
        await addDoc(collection(db, "tasks"), { ...rest, userId });
      }
      return getUserTasks(userId);
    }

    // Cache in local storage too
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    return tasks;
  } catch (err) {
    console.warn("Firestore error, falling back to local cache:", err);
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    return local ? JSON.parse(local) : INITIAL_SEED_TASKS;
  }
}

export async function saveUserTask(userId: string | null, task: Task): Promise<string> {
  console.log("DEBUG: dbService: saveUserTask called for task:", task);
  // Always write to localStorage as a fallback
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  const tasks: Task[] = local ? JSON.parse(local) : [];
  const index = tasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.push(task);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  console.log("DEBUG: dbService: Written to localStorage");

  if (!userId) {
    console.log("DEBUG: dbService: No userId, returning temp ID:", task.id);
    return task.id;
  }

  try {
    console.log("DEBUG: dbService: Attempting Firestore save for user:", userId);
    const { id, ...rest } = task;
    // Check if updating or creating
    const isUpdate = !id.startsWith("temp-") && id !== "";
    if (isUpdate) {
      await updateDoc(doc(db, "tasks", id), { ...rest, userId });
      console.log("DEBUG: dbService: Firestore update successful");
    } else {
      await addDoc(collection(db, "tasks"), { ...rest, userId });
      console.log("DEBUG: dbService: Firestore add successful");
    }
    return id;
  } catch (err) {
    console.error("DEBUG: dbService: Firestore save failed:", err);
    return task.id;
  }
}

export async function deleteUserTask(userId: string | null, taskId: string): Promise<void> {
  // Always update local cache
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    const tasks: Task[] = JSON.parse(local);
    const filtered = tasks.filter((t) => t.id !== taskId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }

  if (userId) {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      console.warn("Firestore delete failed:", err);
    }
  }
}
