import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, Shield, Flame, Activity, Clock, Plus, Trash2, Calendar, 
  CheckSquare, Square, Zap, Info, Play, Pause, Send, Bot, Award, Sparkles, 
  Search, Bell, Settings, Eye, Globe, ChevronRight, HelpCircle, Compass, Cpu,
  User, GraduationCap, Briefcase, Dna
} from "lucide-react";
import AIPrediction from "./AIPrediction";
import VoiceAssistant from "./VoiceAssistant";
import { Task, BurnoutMetrics, TimeMachineScenario, AICoachMessage } from "../types";

interface MissionControlProps {
  tasks: Task[];
  burnoutMetrics: BurnoutMetrics | null;
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onPostponeTask: (id: string) => void;
  onSelectTaskForTimeMachine: (task: Task) => void;
}

export default function MissionControl({
  tasks,
  burnoutMetrics,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onPostponeTask,
  onSelectTaskForTimeMachine
}: MissionControlProps) {
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [complexity, setComplexity] = useState<"easy" | "medium" | "hard">("medium");
  const [category, setCategory] = useState<"study" | "work" | "health" | "social">("work");
  const [plannedHours, setPlannedHours] = useState(2);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Focus Bubble (Dashboard Timer) State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins in seconds
  const [timerTask, setTimerTask] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Risk Radar Interactive State
  const [selectedRadarTask, setSelectedRadarTask] = useState<any>(null);

  // AI Time Machine Interactive State
  const [selectedSimTask, setSelectedSimTask] = useState<Task | null>(null);
  const [simScenarios, setSimScenarios] = useState<TimeMachineScenario[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenarioType, setActiveScenarioType] = useState<string>("Delay 1 Day");

  // AI Coach Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<AICoachMessage[]>([
    {
      id: "m1",
      sender: "coach",
      text: "You are currently falling behind on DBMS Assignment.",
      timestamp: "10:12 AM"
    },
    {
      id: "m2",
      sender: "coach",
      text: "Complete BEE Lab first. It's a quick win with low complexity.",
      timestamp: "10:13 AM"
    },
    {
      id: "m3",
      sender: "coach",
      text: "I can help you finish everything in 2.5 hours today. Type 'optimize' below!",
      timestamp: "10:13 AM"
    }
  ]);
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Achievement Galaxy Modal state
  const [galaxyModalOpen, setGalaxyModalOpen] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [isRadarMinimized, setIsRadarMinimized] = useState(false);

  // User Profile details
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      name: "Sai Karthik",
      dob: "2004-05-15",
      institution: "Vellore Institute of Technology",
      office: "AI Innovation Lab",
      bio: "Elite developer building next-gen human productivity algorithms."
    };
  });

  const [editProfile, setEditProfile] = useState({ ...profile });

  useEffect(() => {
    if (profileOpen) {
      setEditProfile({ ...profile });
    }
  }, [profileOpen, profile]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Derivations
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const totalPlannedHours = tasks.reduce((acc, t) => acc + (t.completed ? 0 : t.focusHoursPlanned), 0);
  const totalLoggedHours = tasks.reduce((acc, t) => acc + t.focusHoursLogged, 0);

  // Find Today's Absolute Critical Mission (High Priority, incomplete, closest deadline)
  const sortedIncomplete = [...incompleteTasks].sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Custom mock critical mission title if no tasks exist
  const todaysMission = sortedIncomplete[0] || {
    id: "default-1",
    name: "Win Internal Exams",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "high" as const,
    complexity: "hard" as const,
    category: "study" as const,
    completed: false,
    focusHoursPlanned: 4,
    focusHoursLogged: 0,
    postponedCount: 0
  };

  // Seed simulator task initially
  useEffect(() => {
    if (tasks.length > 0 && !selectedSimTask) {
      setSelectedSimTask(tasks[0]);
    }
  }, [tasks, selectedSimTask]);

  // Run dynamic Time Machine simulator inside Dashboard
  useEffect(() => {
    if (!selectedSimTask) {
      setSimScenarios([]);
      return;
    }

    const runSimulation = async () => {
      setIsSimulating(true);
      try {
        const response = await fetch("/api/gemini/time-machine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskName: selectedSimTask.name,
            priority: selectedSimTask.priority,
            complexity: selectedSimTask.complexity,
            hoursNeeded: selectedSimTask.focusHoursPlanned
          })
        });
        if (response.ok) {
          const data = await response.json();
          setSimScenarios(data.scenarios || []);
        }
      } catch (err) {
        console.error("Simulation failure", err);
      } finally {
        setIsSimulating(false);
      }
    };

    runSimulation();
  }, [selectedSimTask]);

  // Sync Focus timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            alert("Congratulations! You completed your Focus session!");
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isCoachTyping]);

  // Handle adding task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    onAddTask({
      name: taskName,
      priority,
      complexity,
      category,
      completed: false,
      focusHoursPlanned: Number(plannedHours),
      focusHoursLogged: 0,
      postponedCount: 0,
      dueDate
    });

    setTaskName("");
    setIsAddingTask(false);
  };

  // Format timer text
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Chat message send handler
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput("");

    // Append user message
    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    setIsCoachTyping(true);

    try {
      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: chatMessages.map((m) => ({ role: m.sender === "coach" ? "model" : "user", text: m.text })),
          context: {
            tasks,
            burnoutRisk: burnoutMetrics?.riskLevel || "Low"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `coach-${Date.now()}`,
            sender: "coach",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCoachTyping(false);
    }
  };

  // Filter tasks for dashboard list
  const filteredTasks = tasks.filter((t) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* Immersive Mission Briefing */}
      <div className="bg-slate-900/40 backdrop-blur-lg border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              🚀 Mission Command Center
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">AI has analyzed your workload and generated today's optimal execution strategy.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all">
              <Bot className="h-4 w-4" /> Neural Analysis
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all">
              <Sparkles className="h-4 w-4 text-cyan-400" /> Focus Mode
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Critical Tasks", value: "2", color: "text-rose-400" },
            { label: "Pending Tasks", value: "5", color: "text-white" },
            { label: "Success Forecast", value: "87%", color: "text-emerald-400" },
            { label: "Burnout Risk", value: "Low", color: "text-emerald-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-2xl p-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
              <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top 4 Metrics Summary Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        
        {/* TODAY'S MISSION CARD */}
        <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(99,102,241,0.2)] relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition-all duration-300">
          {/* Subtle Glow Orb */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
          <div>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
              <Shield className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              PRIMARY MISSION
            </span>
            <h3 className="text-lg font-bold font-display text-white mt-3 line-clamp-1 group-hover:text-indigo-200 transition-colors">{todaysMission.name}</h3>
            <span className="text-xs font-mono text-indigo-300/80 uppercase tracking-wider block mt-1">
              Due: {todaysMission.dueDate}
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.6)]" 
                style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 40}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-indigo-200/80 font-semibold">
              <span className="tracking-wider">PROGRESS</span>
              <span>{completedTasks.length}/{tasks.length || 7} Tasks Done</span>
            </div>
          </div>
        </div>
 
         {/* FOCUS TIME CARD */}
        <div className="bg-linear-to-br from-slate-900 via-slate-950 to-cyan-950 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-300">
          {/* Subtle Glow Orb */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                DEEP WORK ENGINE
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <h3 className="text-3xl font-extrabold font-display text-white tracking-tight">
                  {Math.max(2, Math.floor(totalLoggedHours))}h {Math.round((totalLoggedHours % 1) * 60) || 35}m
                </h3>
              </div>
              <span className="text-xs text-cyan-300/80 font-semibold font-mono uppercase tracking-wider block mt-1">
                Goal: 4h 30m
              </span>
            </div>

            {/* Glowing SVG Progress Ring */}
            <div className="relative w-14 h-14 shrink-0 mt-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-slate-800/80"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-cyan-400 transition-all duration-1000"
                  strokeDasharray={`${Math.min(100, Math.round((totalLoggedHours / 4.5) * 100)) || 65}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  style={{ filter: "drop-shadow(0 0 4px rgba(34, 211, 238, 0.6))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-cyan-400 text-[10px] font-mono font-bold">
                {Math.min(100, Math.round((totalLoggedHours / 4.5) * 100)) || 65}%
              </div>
            </div>
          </div>

          <div className="text-[10px] text-cyan-200/80 font-semibold font-mono uppercase border-t border-slate-800/80 pt-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            Mindfulness Zone: Stable
          </div>
        </div>
 
         {/* PRODUCTIVITY SCORE CARD */}
        <div className="bg-linear-to-br from-slate-900 via-purple-950 to-slate-950 border border-purple-500/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition-all duration-300">
          {/* Subtle Glow Orb */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                <Activity className="h-3.5 w-3.5 text-purple-400" />
                PERFORMANCE INDEX
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 87}
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 animate-pulse">EXCELLENT 📈</span>
              </div>
            </div>

            {/* Glowing SVG Progress Ring */}
            <div className="relative w-14 h-14 shrink-0 mt-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-slate-800/80"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-purple-400 transition-all duration-1000"
                  strokeDasharray={`${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 87}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  style={{ filter: "drop-shadow(0 0 4px rgba(168, 85, 247, 0.6))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-purple-400 text-[10px] font-mono font-bold">
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 87}%
              </div>
            </div>
          </div>

          <div className="text-[10px] text-purple-200/80 font-semibold font-mono uppercase border-t border-slate-800/80 pt-3 flex items-center justify-between">
            <span>Streak count: 12 Days active</span>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Level 3</span>
          </div>
        </div>
 
         {/* BURNOUT RISK CARD */}
        <div className="bg-linear-to-br from-slate-900 via-slate-950 to-rose-950 border border-rose-500/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(244,63,94,0.15)] relative overflow-hidden flex flex-col justify-between group hover:border-rose-500/50 transition-all duration-300">
          {/* Subtle Glow Orb */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-rose-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                <Flame className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                STRESS FORECAST
              </span>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold font-display text-white tracking-tight">
                  {burnoutMetrics?.burnoutScore || 32}%
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold font-mono uppercase block mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {burnoutMetrics?.riskLevel || "Low"} Risk 💚
                </span>
              </div>
            </div>
            
            {/* Radial Score Gauge */}
            <div className="relative w-14 h-14 shrink-0 mt-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-slate-800/80"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-rose-400 transition-all duration-1000"
                  strokeDasharray={`${burnoutMetrics?.burnoutScore || 32}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  style={{ filter: "drop-shadow(0 0 4px rgba(244, 63, 94, 0.6))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-rose-400">
                <Shield className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-rose-200/80 font-semibold font-mono uppercase border-t border-slate-800/80 pt-3">
            Simulated Forecast: Resilient
          </div>
        </div>

      </div>

      {/* Middle Row Bento Grid - Primary Power Features */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* PRODUCTIVITY DNA CARD */}
        <div className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-3xl p-6 shadow-[0_8px_30px_rgba(99,102,241,0.06)] flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Glow Orb */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                🧬 PRODUCTIVITY DNA
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                OPTIMIZED
              </span>
            </div>
            
            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-800 font-display tracking-tight">Strategic Planner</h4>
                <p className="text-[10px] text-indigo-500/80 font-mono font-semibold uppercase mt-0.5 tracking-wider">Primary Archetype</p>
              </div>

              {/* Stats table style */}
              <div className="space-y-3 pt-1">
                {[
                  { label: "Focus Score", val: 89, color: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]", text: "text-indigo-600" },
                  { label: "Consistency", val: 84, color: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]", text: "text-purple-600" },
                  { label: "Execution", val: 91, color: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]", text: "text-emerald-600" },
                  { label: "Learning Speed", val: 87, color: "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]", text: "text-cyan-600" },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">{stat.label}</span>
                      <span className={`font-bold font-mono ${stat.text}`}>{stat.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100/80 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all duration-1000 ${stat.color}`} style={{ width: `${stat.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Assessment */}
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100/50 rounded-2xl p-3.5 space-y-1.5 shadow-sm">
                <span className="text-[9px] font-mono text-indigo-600 uppercase tracking-widest font-bold block">AI Assessment</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  You excel at long focus sessions and structured planning.
                </p>
                <p className="text-[11px] text-rose-600 font-medium pt-1.5 border-t border-indigo-100/40">
                  ⚠️ <span className="font-bold">Leak:</span> Your biggest productivity leak is context switching.
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setIsRecalibrating(true);
              setTimeout(() => {
                setIsRecalibrating(false);
              }, 1200);
            }}
            disabled={isRecalibrating}
            className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl text-white text-xs font-bold py-2.5 transition-all duration-300 cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.2)] ${
              isRecalibrating 
                ? "bg-slate-800 border-slate-700 animate-pulse" 
                : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border border-indigo-500"
            }`}
          >
            <Dna className={`h-4 w-4 ${isRecalibrating ? "animate-spin text-cyan-400" : "text-white animate-pulse"}`} />
            {isRecalibrating ? "Recalibrating DNA..." : "Recalibrate DNA"}
          </button>
        </div>

        {/* AI RISK RADAR CHART */}
        <div className="bg-white/80 backdrop-blur-md border border-rose-100 rounded-3xl p-6 shadow-[0_8px_30px_rgba(244,63,94,0.04)] flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Glow Orb */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-500"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rose-500 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                <Compass className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                🚨 AI RISK RADAR
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
              Neural analysis of deadline threats, workload pressure, and completion probability.
            </p>
            
            {/* Visual Interactive SVG Radar */}
            <div className="relative my-4 flex items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                {/* Radar Grid circles */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                <circle cx="50" cy="50" r="10" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                {/* Crosshairs */}
                <line x1="50" y1="10" x2="50" y2="90" stroke="#E2E8F0" strokeWidth="0.5" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="#E2E8F0" strokeWidth="0.5" />

                {/* Plot active task node dots */}
                {/* Node 1: DBMS Assignment (High Risk) */}
                <circle 
                  cx="50" cy="22" r="4" 
                  fill="#EF4444" 
                  className="cursor-pointer animate-pulse" 
                  onClick={() => setSelectedRadarTask({
                    name: "DBMS Assignment",
                    riskLevel: "High",
                    riskScore: 88,
                    reason: "Crucial deadline is imminent. Current completion rate indicates risk of spillover.",
                    mitigation: "Declare state of emergency. Postpone low-priority tasks and execute deep work immediately."
                  })}
                />
                <text x="54" y="21" className="text-[5px] font-mono font-bold fill-slate-700">DBMS (High)</text>

                {/* Node 2: BEE Lab (Medium Risk) */}
                <circle 
                  cx="72" cy="40" r="3.5" 
                  fill="#F59E0B" 
                  className="cursor-pointer"
                  onClick={() => setSelectedRadarTask({
                    name: "BEE Lab",
                    riskLevel: "Medium",
                    riskScore: 55,
                    reason: "Moderate complexity demands structural staging before final integration.",
                    mitigation: "Carve out an initial 45-minute focus window to map dependencies."
                  })}
                />
                <text x="76" y="42" className="text-[5px] font-mono fill-slate-500">BEE Lab</text>

                {/* Node 3: Java Revision (Low Risk) */}
                <circle 
                  cx="38" cy="65" r="3" 
                  fill="#10B981" 
                  className="cursor-pointer"
                  onClick={() => setSelectedRadarTask({
                    name: "Java Revision",
                    riskLevel: "Low",
                    riskScore: 20,
                    reason: "Ample lead time and simplified logic framework.",
                    mitigation: "Continue normal workflow. Spend 20 minutes reviewing core API classes."
                  })}
                />
                <text x="20" y="69" className="text-[5px] font-mono fill-slate-500">Java Revision</text>

                {/* Node 4: Aptitude Practice (Low Risk) */}
                <circle 
                  cx="50" cy="74" r="3" 
                  fill="#10B981" 
                  className="cursor-pointer"
                  onClick={() => setSelectedRadarTask({
                    name: "Aptitude Practice",
                    riskLevel: "Low",
                    riskScore: 15,
                    reason: "Low priority, flexible schedule buffer.",
                    mitigation: "Maintain status quo. Practice 5 questions during short rest breaks."
                  })}
                />
                <text x="54" y="77" className="text-[5px] font-mono fill-slate-500">Aptitude</text>
              </svg>

              {/* Dynamic Overlay overlay banner */}
              <div className="absolute top-2 left-2 text-[8px] font-mono bg-indigo-50/80 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                Interactive Grid
              </div>
            </div>

            {/* Selected Radar Node Details Card */}
            <AnimatePresence mode="wait">
              {selectedRadarTask ? (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">{selectedRadarTask.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                      selectedRadarTask.riskLevel === "High" ? "bg-red-50 text-red-600 border border-red-100" :
                      selectedRadarTask.riskLevel === "Medium" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      {selectedRadarTask.riskLevel} Risk ({selectedRadarTask.riskScore}%)
                    </span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">{selectedRadarTask.reason}</p>
                  <p className="text-slate-600 text-[11px] font-medium italic border-t border-slate-200/50 pt-2">
                    💡 <span className="font-bold">Mitigation:</span> {selectedRadarTask.mitigation}
                  </p>
                </motion.div>
              ) : (
                <div className="text-center py-4 text-[11px] text-slate-400 font-medium">
                  👉 Click any node on the Radar to inspect risk profile.
                </div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setSelectedRadarTask({
              name: "DBMS Assignment",
              riskLevel: "High",
              riskScore: 88,
              reason: "Imminent deadlines and multiple pending dependencies.",
              mitigation: "Activate deep work immediately to clear core modules."
            })}
            className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-rose-200/60 bg-linear-to-r from-rose-50 to-amber-50 hover:from-rose-100 hover:to-amber-100 text-slate-800 text-xs font-semibold py-2.5 transition-all cursor-pointer shadow-xs"
          >
            <Eye className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            View All Risks
          </button>
        </div>

        {/* ⏳ FUTURE OUTCOME SIMULATOR INTERACTIVE (Plays a Major Role) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase flex items-center gap-1.5 font-black">
                <Cpu className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                ⏳ FUTURE OUTCOME SIMULATOR
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50">
                ACTIVE
              </span>
            </div>
            
            <p className="text-slate-500 text-xs font-semibold mt-1">Select a task and trigger dynamic delay simulations:</p>
            
            {/* Task Selector Dropdown */}
            <div className="mt-3 mb-2.5">
              <select
                value={selectedSimTask?.id || ""}
                onChange={(e) => {
                  const found = tasks.find((t) => t.id === e.target.value);
                  if (found) setSelectedSimTask(found);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                {tasks.length === 0 && <option value="">DBMS Assignment</option>}
              </select>
            </div>

            {/* "What If?" Scenarios Action Buttons */}
            <div className="mb-4">
              <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider block mb-1.5">
                ⚡ WHAT-IF SCENARIOS:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Delay 1 Day", icon: "⏳" },
                  { label: "Delay 2 Days", icon: "🗓️" },
                  { label: "Delay 1 Week", icon: "📅" },
                  { label: "Skip Task", icon: "🚫" }
                ].map((scenario) => {
                  const isActive = activeScenarioType === scenario.label;
                  return (
                    <button
                      key={scenario.label}
                      onClick={() => setActiveScenarioType(scenario.label)}
                      className={`text-left px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200/70 text-slate-700"
                      }`}
                    >
                      <span>{scenario.label}</span>
                      <span className="text-xs">{scenario.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sim Scenarios list */}
            <div className="space-y-3">
              {isSimulating ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="h-6 w-6 rounded-full border-2 border-indigo-600/10 border-t-indigo-600 animate-spin"></div>
                  <span className="text-[11px] text-slate-400 font-semibold font-mono tracking-widest uppercase">Calculating Futures...</span>
                </div>
              ) : (
                (() => {
                  const currentScenario = simScenarios.find(sc => sc.type === activeScenarioType) || {
                    type: activeScenarioType,
                    probability: activeScenarioType === "Delay 1 Day" ? 92 : activeScenarioType === "Delay 2 Days" ? 65 : activeScenarioType === "Delay 1 Week" ? 25 : 35,
                    workload: activeScenarioType === "Delay 1 Day" ? 45 : activeScenarioType === "Delay 2 Days" ? 70 : activeScenarioType === "Delay 1 Week" ? 95 : 20,
                    stress: activeScenarioType === "Delay 1 Day" ? 25 : activeScenarioType === "Delay 2 Days" ? 55 : activeScenarioType === "Delay 1 Week" ? 90 : 80,
                    prediction: activeScenarioType === "Delay 1 Day" 
                      ? `Delaying "${selectedSimTask?.name || 'DBMS Assignment'}" by 1 day has minimal impact on your master timeline. It allocates a buffer, but keep an eye on upcoming dependencies.`
                      : activeScenarioType === "Delay 2 Days"
                      ? `Delaying "${selectedSimTask?.name || 'DBMS Assignment'}" by 2 days starts compressing your milestones. Expected stress increases as deadlines converge.`
                      : activeScenarioType === "Delay 1 Week"
                      ? `Delaying "${selectedSimTask?.name || 'DBMS Assignment'}" by 1 week pushes it into critical backlog territory. Completion probability drops sharply due to high dependency collision.`
                      : `Skipping "${selectedSimTask?.name || 'DBMS Assignment'}" entirely relieves immediate pressure but creates a long-term academic penalty.`
                  };

                  return (
                    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            currentScenario.probability >= 80 ? "bg-emerald-500" : currentScenario.probability >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}></span>
                          {currentScenario.type}
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-xl py-4 shadow-xs">
                        <span className={`text-3xl font-black font-mono tracking-tight flex items-center gap-2 ${
                          currentScenario.probability >= 80 ? "text-emerald-500" : currentScenario.probability >= 50 ? "text-amber-500" : "text-rose-500"
                        }`}>
                          {currentScenario.probability >= 80 ? "🟢" : currentScenario.probability >= 50 ? "🟡" : "🔴"} {currentScenario.probability}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono font-black tracking-widest uppercase mt-1">
                          Mission Success
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">{currentScenario.prediction}</p>
                      
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold border-t border-slate-100 pt-2.5">
                        <span>WORKLOAD: {currentScenario.workload}%</span>
                        <span>STRESS: {currentScenario.stress}%</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          <button 
            onClick={() => {
              if (selectedSimTask) {
                onSelectTaskForTimeMachine(selectedSimTask);
              } else if (tasks.length > 0) {
                onSelectTaskForTimeMachine(tasks[0]);
              } else {
                onSelectTaskForTimeMachine(todaysMission as Task);
              }
            }}
            className="w-full mt-4 flex items-center justify-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 text-white text-xs font-semibold py-2.5 transition-all cursor-pointer"
          >
            Explore More Scenarios
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* FOCUS BUBBLE TIMER CARD */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
              FOCUS BUBBLE
            </span>
            <p className="text-slate-500 text-xs font-semibold mt-1">Isolate cognitive noise. Initiate deep work block.</p>
            
            {/* Circular Timer Display */}
            <div className="flex flex-col items-center justify-center mt-5 mb-4 space-y-3">
              <div className="relative w-32 h-32 flex items-center justify-center">
                
                {/* SVG circular progress indicator */}
                <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
                  <circle
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    cx="50" cy="50" r="45"
                  />
                  <circle
                    className="text-cyan-500 transition-all duration-300"
                    strokeDasharray={`${(timeLeft / 1500) * 282}, 282`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    cx="50" cy="50" r="45"
                  />
                </svg>

                {/* Pulsing ring animation while active */}
                {timerActive && (
                  <div className="absolute w-30 h-30 rounded-full border-2 border-cyan-500/30 animate-pulse-ring pointer-events-none"></div>
                )}

                {/* Actual countdown numbers */}
                <div className="text-center z-10 space-y-0.5">
                  <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono block uppercase font-bold tracking-wider">
                    TIME REMAINING
                  </span>
                </div>
              </div>

              {/* Task scope label */}
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50">
                  ACTIVE SYNC BLOCK
                </span>
              </div>
            </div>

            {/* AI-powered Focus Bubble Metrics */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 border border-slate-800 shadow-sm mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${timerActive ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-slate-500"}`}></span>
                  {timerActive ? "FOCUS BUBBLE ACTIVE" : "FOCUS BUBBLE READY"}
                </span>
                <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  AI ENGINE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-mono block leading-none">Deep Focus Probability</span>
                  <span className="font-extrabold font-mono text-cyan-400 text-sm">87%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-mono block leading-none">Estimated Completion</span>
                  <span className="font-extrabold font-mono text-white text-sm">
                    {(() => {
                      const now = new Date();
                      now.setSeconds(now.getSeconds() + timeLeft);
                      return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    })()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[9px] font-mono">
                <span className="text-slate-400">Distraction Risk</span>
                <span className="font-extrabold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LOW
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setTimeLeft(1500)}
              className="flex-1 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2.5 transition-all cursor-pointer text-center"
            >
              Reset
            </button>
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="flex-2 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold py-2.5 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              {timerActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" fill="white" />
                  Start Focus
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIPrediction />
        <div className="flex items-center justify-center bg-slate-900/50 p-6 rounded-3xl border border-white/5">
            <VoiceAssistant />
        </div>
      </div>

      {/* Task Console Section */}
      <div id="task-console" className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              Today's Mission Queue
            </h3>
            <p className="text-xs text-slate-500 font-medium">Your AI-powered command centre for planning, prioritizing, and completing goals.</p>
          </div>
          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Task
          </button>
        </div>

        {/* Task Form */}
        {isAddingTask && (
          <motion.form
            onSubmit={handleCreateTask}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-mono text-slate-500 uppercase font-bold mb-1.5">Task Name</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Prepare deck for startup funding..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase font-bold mb-1.5">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase font-bold mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase font-bold mb-1.5">Complexity</label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase font-bold mb-1.5">Life Sector</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="health">Health</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase font-bold mb-1.5">Focus Allocation (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={plannedHours}
                  onChange={(e) => setPlannedHours(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Add Task
              </button>
            </div>
          </motion.form>
        )}

        {/* Today's Mission Status */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6 grid grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Critical Tasks</span>
            <span className="text-xl font-black">2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Tasks</span>
            <span className="text-xl font-black">5</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Success Forecast</span>
            <span className="text-xl font-black text-emerald-500">87%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Burnout Risk</span>
            <span className="text-xl font-black text-emerald-500">Low</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
             {/* Task List Grid */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <p className="text-sm text-slate-400 font-medium">Your task queue is pristine. Ready for operation inputs.</p>
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-2xl p-4 transition-all duration-200 ${
                      t.completed 
                        ? "bg-slate-50/50 border-slate-100 opacity-60" 
                        : "bg-white border-slate-100 hover:border-indigo-100 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => onToggleComplete(t.id)}
                        className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                      >
                        {t.completed ? (
                          <CheckSquare className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <p className={`text-sm font-semibold leading-snug ${t.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {t.name}
                        </p>
                        <div className="flex gap-3 text-[10px] font-mono font-bold text-slate-500">
                           <span>Probability: 92%</span>
                           <span>Risk: <span className="text-amber-500">🟡 Watch</span></span>
                           <span>Priority: #1</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                          <span className="flex items-center gap-1 text-slate-400 font-mono">
                            <Calendar className="h-3 w-3" />
                            {t.dueDate}
                          </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${
                        t.priority === "high" ? "bg-red-50 text-red-600 border-red-100" :
                        t.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        {t.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${
                        t.complexity === "hard" ? "bg-purple-50 text-purple-600 border-purple-100" :
                        t.complexity === "medium" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                        "bg-cyan-50 text-cyan-600 border-cyan-100"
                      }`}>
                        {t.complexity}
                      </span>
                      <span className="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-[9px] font-mono uppercase">
                        {t.category}
                      </span>
                      {t.postponedCount > 0 && (
                        <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[9px] font-mono uppercase">
                          Postponed x{t.postponedCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 sm:mt-0 shrink-0 border-t border-slate-100 sm:border-t-0 pt-3 sm:pt-0">
                  {!t.completed && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedSimTask(t);
                          onSelectTaskForTimeMachine(t);
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 px-3 py-1.5 rounded-xl hover:bg-indigo-50 border border-indigo-50/50 transition-all cursor-pointer"
                      >
                        Simulate
                      </button>
                      <button
                        onClick={() => onPostponeTask(t.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                      >
                        Postpone
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Neural Analysis Panel */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">🤖 Neural Analysis</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400">Most Urgent:</span>
                <p className="font-semibold">DBMS Final Assignment</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Estimated Focus Time:</span>
                <p className="font-semibold">3h 20m</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Completion Forecast:</span>
                <p className="font-semibold text-emerald-400">92%</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Recommended Start:</span>
                <p className="font-semibold">5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: AI Coach Chat, Weekly Insights, Achievement Galaxy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* AI COACH (Functional Chatbox card) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                <Bot className="h-3.5 w-3.5 text-indigo-400" />
                🧠 NEURAL COMMAND CENTER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-1">Cognitive copilot for real-time strategy.</p>
          </div>

          {/* Chat message bubbles scroll window */}
          <div className="flex-1 my-3 overflow-y-auto space-y-2 px-1 max-h-[180px] scrollbar-thin">
            {chatMessages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col space-y-0.5 text-xs ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`rounded-2xl px-3 py-2 leading-relaxed max-w-[85%] ${
                  m.sender === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-xs" 
                    : "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-xs"
                }`}>
                  {m.text}
                </div>
                <span className="text-[8px] font-mono text-slate-400 font-bold px-1">{m.timestamp}</span>
              </div>
            ))}
            
            {isCoachTyping && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono px-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>Coach is thinking...</span>
              </div>
            )}
            <div ref={chatBottomRef}></div>
          </div>

          {/* Chat input box */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input
              type="text"
              required
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me anything... (e.g. optimize)"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
            <button 
              type="submit" 
              className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* WEEKLY INSIGHTS BAR CHART */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-[360px]">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
              <Activity className="h-3.5 w-3.5 text-purple-500" />
              WEEKLY INSIGHTS
            </span>
            <p className="text-slate-500 text-xs font-semibold mt-1">Cognitive deep work flow hours comparison.</p>

            {/* Custom SVG Bar Chart */}
            <div className="my-4 flex items-end justify-between h-32 px-2 bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
              
              {/* Mon Bar */}
              <div className="flex flex-col items-center flex-1 space-y-1.5">
                <div className="w-4 bg-indigo-500/20 hover:bg-indigo-500 h-[45px] rounded-t transition-all relative group cursor-pointer">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-mono rounded px-1 hidden group-hover:block">3h</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">M</span>
              </div>

              {/* Tue Bar */}
              <div className="flex flex-col items-center flex-1 space-y-1.5">
                <div className="w-4 bg-indigo-500/20 hover:bg-indigo-500 h-[75px] rounded-t transition-all relative group cursor-pointer">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-mono rounded px-1 hidden group-hover:block">5.2h</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">T</span>
              </div>

              {/* Wed Bar */}
              <div className="flex flex-col items-center flex-1 space-y-1.5">
                <div className="w-4 bg-indigo-500/20 hover:bg-indigo-500 h-[30px] rounded-t transition-all relative group group-hover:bg-indigo-500 cursor-pointer">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-mono rounded px-1 hidden group-hover:block">2h</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">W</span>
              </div>

              {/* Thu Bar */}
              <div className="flex flex-col items-center flex-1 space-y-1.5">
                <div className="w-4 bg-indigo-500/20 hover:bg-indigo-500 h-[60px] rounded-t transition-all relative group cursor-pointer">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-mono rounded px-1 hidden group-hover:block">4.1h</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">T</span>
              </div>

              {/* Fri Bar */}
              <div className="flex flex-col items-center flex-1 space-y-1.5">
                <div className="w-4 bg-indigo-600 h-[95px] rounded-t transition-all relative group cursor-pointer">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-mono rounded px-1 hidden group-hover:block">6.8h</div>
                </div>
                <span className="text-[9px] font-mono text-slate-600 font-bold font-extrabold">F</span>
              </div>

              {/* Sat Bar */}
              <div className="flex flex-col items-center flex-1 space-y-1.5">
                <div className="w-4 bg-indigo-500/20 hover:bg-indigo-500 h-[15px] rounded-t transition-all relative group cursor-pointer">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-mono rounded px-1 hidden group-hover:block">1h</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">S</span>
              </div>

              {/* Sun Bar */}
              <div className="flex flex-col items-center flex-1 space-y-1.5">
                <div className="w-4 bg-indigo-500/20 hover:bg-indigo-500 h-[8px] rounded-t transition-all relative group cursor-pointer">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-mono rounded px-1 hidden group-hover:block">0.5h</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">S</span>
              </div>

            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl p-3 text-[11px] font-sans flex items-center gap-1.5">
            🌟 <span className="font-bold">Great progress!</span> You completed 23% more tasks this week.
          </div>
        </div>

        {/* ACHIEVEMENT GALAXY */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-[360px]">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
              <Globe className="h-3.5 w-3.5 text-indigo-500" />
              ACHIEVEMENT GALAXY
            </span>
            <p className="text-slate-500 text-xs font-semibold mt-1">Gamified celestial orbits of operational stats.</p>

            {/* Custom Planetary Orbital visualization */}
            <div className="my-5 flex items-center justify-center relative bg-slate-50 border border-slate-100/50 rounded-2xl h-32 overflow-hidden">
              <div className="absolute w-24 h-24 rounded-full border border-dashed border-slate-200"></div>
              <div className="absolute w-16 h-16 rounded-full border border-dashed border-slate-200"></div>
              <div className="absolute w-8 h-8 rounded-full border border-dashed border-slate-200"></div>

              {/* Focus Planet */}
              <div className="absolute top-6 left-1/3 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] cursor-pointer"></div>
                <span className="text-[8px] font-mono text-slate-500 font-bold mt-1">Focus P. Lvl 4</span>
              </div>

              {/* Consistency Planet */}
              <div className="absolute bottom-6 right-1/4 flex flex-col items-center">
                <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-[0_0_8px_#10B981] cursor-pointer animate-pulse"></div>
                <span className="text-[8px] font-mono text-slate-500 font-bold mt-1">Const. Lvl 7</span>
              </div>

              {/* Deadline Planet */}
              <div className="absolute top-1/2 right-1/3 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-red-500 shadow-[0_0_8px_#F59E0B] cursor-pointer"></div>
                <span className="text-[8px] font-mono text-slate-500 font-bold mt-1">Dead. Lvl 2</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setGalaxyModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2.5 transition-all cursor-pointer"
          >
            <Award className="h-4.5 w-4.5" />
            View Galaxy
          </button>
        </div>

      </div>



      {/* Achievement Galaxy Overlay Modal */}
      <AnimatePresence>
        {galaxyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
                    🏆 Achievement Galaxy
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Unlock cosmic rank elevations as you master deadlines.</p>
                </div>
                <button 
                  onClick={() => setGalaxyModalOpen(false)}
                  className="rounded-xl p-1.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Achievement Milestones list */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                    🪐
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">Focus Planet (Level 4)</span>
                      <span className="text-indigo-600">Active flow state master</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Logged over 15+ focus hours in deep work blocks successfully.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                    🌌
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">Consistency Planet (Level 7)</span>
                      <span className="text-emerald-600">Streak Legend</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Maintained operational sync daily checklist for 12 continuous days.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold shadow-md">
                    ☄️
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">Deadline Planet (Level 2)</span>
                      <span className="text-amber-600">Risk Decompressionist</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Mitigated high complexity risk radar nodes before critical spillover thresholds.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-[10px] text-slate-400 font-mono tracking-wider">
                COSMIC SYNC SEQUENCE ESTABLISHED
              </div>
            </motion.div>
          </div>
        )}

        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
                    ⚙️ Personal Profile Settings
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Configure your personal information to optimize your productivity calibration.</p>
                </div>
                <button 
                  onClick={() => setProfileOpen(false)}
                  className="rounded-xl p-1.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setProfile(editProfile);
                localStorage.setItem("user_profile", JSON.stringify(editProfile));
                setProfileOpen(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editProfile.name}
                    onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={editProfile.dob}
                    onChange={(e) => setEditProfile({ ...editProfile, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">School / University</label>
                  <input 
                    type="text" 
                    value={editProfile.institution}
                    onChange={(e) => setEditProfile({ ...editProfile, institution: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Office / Work Place</label>
                  <input 
                    type="text" 
                    value={editProfile.office}
                    onChange={(e) => setEditProfile({ ...editProfile, office: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bio / Personal Motto</label>
                  <textarea 
                    rows={3}
                    value={editProfile.bio}
                    onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                COGNITIVE PROFILE SYNCHRONIZATION COMPLETE
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </div>
    </div>
  );
}
