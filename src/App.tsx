import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getUserTasks, saveUserTask, deleteUserTask } from "./services/dbService";
import { Task, BurnoutMetrics } from "./types";

// Import UI components
import AuthScreen from "./components/AuthScreen";
import MissionControl from "./components/MissionControl";
import TimeMachine from "./components/TimeMachine";
import WhatIfAnalyzer from "./components/WhatIfAnalyzer";
import SmartOptimizer from "./components/SmartOptimizer";
import ProductivityDNA from "./components/ProductivityDNA";
import FocusBubble from "./components/FocusBubble";
import AICoach from "./components/AICoach";
import WeeklyInsights from "./components/WeeklyInsights";
import LifeBalance from "./components/LifeBalance";
import EmergencyMode from "./components/EmergencyMode";
import BillsTracker from "./components/BillsTracker";
import InterviewTracker from "./components/InterviewTracker";
import CalendarIntegration from "./components/CalendarIntegration";
import GmailInterviewChecker from "./components/GmailInterviewChecker";
import Meetings from "./components/Meetings";
import Commitments from "./components/Commitments";

// Icons
import {
  LayoutDashboard,
  Cpu,
  Shuffle,
  Calendar,
  Orbit,
  Activity,
  Heart,
  Sparkles,
  LogOut,
  User,
  Bot,
  Zap,
  Menu,
  X,
  Flame,
  ArrowLeft,
  DollarSign,
  Briefcase,
  Mail,
  Users,
  Target
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<string>("mission_control");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [isAICoachHidden, setIsAICoachHidden] = useState(() => {
    return localStorage.getItem("deadlineai_coach_hidden") === "true";
  });
  
  // Temporal focus state variables
  const [burnoutMetrics, setBurnoutMetrics] = useState<BurnoutMetrics | null>(null);
  const [selectedTaskForSimulation, setSelectedTaskForSimulation] = useState<Task | null>(null);
  const [isRefreshingBurnout, setIsRefreshingBurnout] = useState(false);

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
      } else {
        setUser(null);
        setIsGuest(true);
      }
      setAuthResolved(true);
    });
    return unsubscribe;
  }, []);

  // Fetch tasks when user/guest state loads
  const loadTasks = async () => {
    const userId = user ? user.uid : null;
    const items = await getUserTasks(userId);
    setTasks(items);
  };

  useEffect(() => {
    if (authResolved) {
      loadTasks();
    }
  }, [authResolved, user, isGuest]);

  // Burnout metrics recalculation loop
  const recalculateBurnout = async () => {
    if (tasks.length === 0) return;
    setIsRefreshingBurnout(true);
    
    const incomplete = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);
    
    // Calculate density: due within next 3 days
    const threeDaysFromNow = Date.now() + 3 * 24 * 3600 * 1000;
    const densityCount = incomplete.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() <= threeDaysFromNow;
    }).length;

    const loggedFocusHours = tasks.reduce((acc, t) => acc + t.focusHoursLogged, 0);

    try {
      const response = await fetch("/api/gemini/burnout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendingTasks: incomplete.length,
          deadlineDensity: densityCount,
          workload: incomplete.length * 15, // dynamic estimate
          focusHours: loggedFocusHours
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setBurnoutMetrics(data);
    } catch (err) {
      // Offline fallback calculation
      const score = Math.min(100, Math.max(10, (incomplete.length * 8) + (densityCount * 12) - (loggedFocusHours * 3)));
      let riskLevel: "Low" | "Medium" | "High" = "Low";
      if (score > 70) riskLevel = "High";
      else if (score > 40) riskLevel = "Medium";

      setBurnoutMetrics({
        riskLevel,
        burnoutScore: Math.round(score),
        factors: {
          tasks: incomplete.length > 5 ? "Queue density elevated." : "Queue dimensions within threshold parameters.",
          density: densityCount > 3 ? "Deadlines clustered in proximate 72 hr timeline." : "Timeline points distributed stably.",
          focus: loggedFocusHours < 4 ? "Awaiting deep flow inputs." : "Excellent deep focus discipline."
        },
        insights: ["Calculated using local timeline projections."],
        recommendations: ["Activate Focus Bubble mode to check off high-impact items."]
      });
    } finally {
      setIsRefreshingBurnout(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      recalculateBurnout();
    }
  }, [tasks.length]);

  // App Core Handlers
  const handleAddTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    console.log("DEBUG: App.tsx: handleAddTask called with:", taskData);
    const userId = user ? user.uid : null;
    const newTask: Task = {
      ...taskData,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    console.log("DEBUG: App.tsx: Calling saveUserTask for:", newTask);
    // Save to DB (returns true ID if Firestore, or same ID if local)
    const savedId = await saveUserTask(userId, newTask);
    newTask.id = savedId;
    console.log("DEBUG: App.tsx: Task saved with ID:", savedId);

    setTasks((prev) => [...prev, newTask]);
    console.log("DEBUG: App.tsx: Task added to local state");
  };

  const handleToggleComplete = async (id: string) => {
    const userId = user ? user.uid : null;
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updated);

    const target = updated.find((t) => t.id === id);
    if (target) {
      await saveUserTask(userId, target);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const userId = user ? user.uid : null;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteUserTask(userId, id);
  };

  const handlePostponeTask = async (id: string) => {
    const userId = user ? user.uid : null;
    const updated = tasks.map((t) => {
      if (t.id === id) {
        // Postpone by 1 day and increment count
        const currentDate = new Date(t.dueDate);
        currentDate.setDate(currentDate.getDate() + 1);
        return {
          ...t,
          dueDate: currentDate.toISOString().split("T")[0],
          postponedCount: t.postponedCount + 1
        };
      }
      return t;
    });
    setTasks(updated);

    const target = updated.find((t) => t.id === id);
    if (target) {
      await saveUserTask(userId, target);
    }
  };

  const handleLogFocusHours = async (taskId: string, hours: number) => {
    const userId = user ? user.uid : null;
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, focusHoursLogged: Number((t.focusHoursLogged + hours).toFixed(1)) };
      }
      return t;
    });
    setTasks(updated);

    const target = updated.find((t) => t.id === taskId);
    if (target) {
      await saveUserTask(userId, target);
    }
  };


  // Chat Trigger link callback
  const handleAICoachTrigger = (actionType: string) => {
    if (actionType === "trigger_bubble") {
      setActiveView("focus_bubble");
    } else if (actionType === "trigger_optimize") {
      setActiveView("smart_optimizer");
    } else if (actionType === "trigger_whatif") {
      setActiveView("what_if");
    }
  };

  // Auth routing
  if (!authResolved) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0F172A] text-slate-100">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin mb-4"></div>
        <p className="text-xs font-mono tracking-widest uppercase text-slate-500">Loading..</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthScreen onAuthSuccess={(uid) => uid ? setUser({ uid }) : null} />;
  }

  // Sidebar Triggers
  const navItems = [
    { id: "mission_control", label: "Mission Control", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "time_machine", label: "AI Time Machine", icon: <Cpu className="h-4 w-4" /> },
    { id: "what_if", label: "What-If Analyzer", icon: <Shuffle className="h-4 w-4" /> },
    { id: "smart_optimizer", label: "Smart Optimizer", icon: <Calendar className="h-4 w-4" /> },
    { id: "productivity_dna", label: "Productivity DNA", icon: <Orbit className="h-4 w-4" /> },
    { id: "weekly_insights", label: "Weekly Insights", icon: <Activity className="h-4 w-4" /> },
    { id: "life_balance", label: "Life Balance", icon: <Heart className="h-4 w-4" /> },
    { id: "bills", label: "Bills Tracker", icon: <DollarSign className="h-4 w-4 text-emerald-400" /> },
    { id: "interviews", label: "Interview Tracker", icon: <Briefcase className="h-4 w-4 text-indigo-400" /> },
    { id: "gmail_interviews", label: "Interview Gmail", icon: <Mail className="h-4 w-4 text-rose-400" /> },
    { id: "meetings", label: "Meetings", icon: <Users className="h-4 w-4 text-sky-400" /> },
    { id: "commitments", label: "Important Commitments", icon: <Target className="h-4 w-4 text-amber-400" /> },
    { id: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4 text-cyan-400" /> },
    { id: "emergency_mode", label: "Emergency Mode", icon: <Flame className="h-4 w-4 text-rose-500" /> },
    { id: "focus_bubble", label: "Focus Bubble", icon: <Sparkles className="h-4 w-4 text-cyan-400" /> }
  ];

  // Immersive Focus Bubble overrides layouts
  if (activeView === "focus_bubble") {
    return (
      <FocusBubble
        tasks={tasks}
        onExit={() => setActiveView("mission_control")}
        onLogFocus={handleLogFocusHours}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col overflow-x-hidden select-none relative font-sans">
      
      {/* Immersive Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/40 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/40 rounded-full blur-[150px]"></div>
      </div>

      {/* Futuristic Header */}
      <header className="h-20 border-b border-white/10 bg-[#0B1020]/60 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setDesktopSidebarOpen(!desktopSidebarOpen);
              }
            }}
            className="rounded-xl p-2 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center bg-transparent"
            title={desktopSidebarOpen ? "Collapse Navigation" : "Expand Navigation"}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xs mr-1 select-none">
                DA
              </div>
              <h1 className="font-display font-extrabold text-xl tracking-tight text-white">DEADLINEAI</h1>
            </div>
          </div>
        </div>

        {/* User Badge Profile & Metrics */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
             <div className="flex flex-col">
               <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase font-bold">🧬 Productivity DNA</span>
               <span className="text-xs font-bold text-white">Strategic Planner</span>
             </div>
             <div className="grid grid-cols-3 gap-3 text-[10px] font-mono text-slate-300">
               <span>Focus: 89%</span>
               <span>Cons: 81%</span>
               <span>Exec: 92%</span>
             </div>
             <div className="h-8 w-[1px] bg-white/10"></div>
             <div className="flex flex-col text-[10px] gap-0.5">
               <span className="text-emerald-400">Strength: Deep Focus</span>
               <span className="text-amber-400">Weakness: Task Switching</span>
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Responsive Drawer Menu for Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md">
            <div className="fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-100 p-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-slate-500">SYSTEM ARCHITECTURE</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer border ${
                        activeView === item.id
                          ? "bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                SECURE OPERATING SESSION LINKED
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar Navigation */}
        <aside className={`hidden md:flex flex-col justify-between bg-white/70 backdrop-blur-xl shrink-0 font-sans z-20 transition-all duration-300 ease-in-out ${
          desktopSidebarOpen 
            ? "w-64 p-6 border-r border-slate-100 opacity-100" 
            : "w-0 p-0 border-r-0 opacity-0 overflow-hidden"
        }`}>
          <div className="space-y-6">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">SYSTEM CHANNELS</span>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer border ${
                    activeView === item.id
                      ? "bg-indigo-50/70 border-indigo-100/50 text-indigo-700 shadow-xs"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/40"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
            <p className="text-[10px] text-slate-400 font-mono uppercase">Neural Link Sync</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              98.8% STABLE
            </div>
            {isAICoachHidden && (
              <button
                onClick={() => {
                  setIsAICoachHidden(false);
                  localStorage.removeItem("deadlineai_coach_hidden");
                }}
                className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold py-1.5 transition-all cursor-pointer border border-indigo-100"
              >
                Restore AI Coach
              </button>
            )}
          </div>
        </aside>

        {/* Central Stage Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden z-10">
          
          {/* Universal Back Button for Secondary Features */}
          {activeView !== "mission_control" && (
            <div className="flex items-center">
              <button
                onClick={() => setActiveView("mission_control")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-indigo-200 text-xs font-bold rounded-2xl text-slate-700 hover:text-indigo-600 shadow-xs transition-all cursor-pointer group"
                id="universal-back-button"
              >
                <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                Back to Mission Control
              </button>
            </div>
          )}

          {/* Primary Router Switch */}
          {activeView === "mission_control" && (
            <MissionControl
              tasks={tasks}
              burnoutMetrics={burnoutMetrics}
              onAddTask={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onPostponeTask={handlePostponeTask}
              onSelectTaskForTimeMachine={(task) => {
                setSelectedTaskForSimulation(task);
                setActiveView("time_machine");
              }}
            />
          )}

          {activeView === "time_machine" && (
            <TimeMachine
              tasks={tasks}
              selectedTaskFromDashboard={selectedTaskForSimulation}
              onClearSelectedTask={() => setSelectedTaskForSimulation(null)}
            />
          )}

          {activeView === "what_if" && <WhatIfAnalyzer tasks={tasks} />}

          {activeView === "smart_optimizer" && <SmartOptimizer tasks={tasks} />}

          {activeView === "productivity_dna" && <ProductivityDNA tasks={tasks} />}

          {activeView === "weekly_insights" && <WeeklyInsights tasks={tasks} />}

          {activeView === "life_balance" && <LifeBalance tasks={tasks} />}
          
          {activeView === "bills" && <BillsTracker />}

          {activeView === "interviews" && <InterviewTracker />}

          {activeView === "calendar" && <CalendarIntegration />}
          
          {activeView === "gmail_interviews" && <GmailInterviewChecker />}

          {activeView === "meetings" && <Meetings />}
          
          {activeView === "commitments" && <Commitments />}

          {activeView === "emergency_mode" && <EmergencyMode tasks={tasks} onExit={() => setActiveView("mission_control")} />}
        </main>
      </div>

      {/* Persistent floating AI Coach bot */}
      {!isAICoachHidden && (
        <AICoach
          tasks={tasks}
          burnoutRisk={burnoutMetrics?.riskLevel || "Low"}
          archetype={burnoutMetrics?.insights[0] ? "Strategic Planner" : "Analyzing..."}
          onTriggerAction={handleAICoachTrigger}
          onHideBot={() => {
            setIsAICoachHidden(true);
            localStorage.setItem("deadlineai_coach_hidden", "true");
          }}
        />
      )}
      {/* Floating AI Orb */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
          <button className="relative w-16 h-16 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer">
             <Bot className="h-8 w-8 text-indigo-400" />
          </button>
        </div>
      </div>

    </div>
  );
}
