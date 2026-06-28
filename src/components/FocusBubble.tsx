import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, X, CheckCircle, ShieldAlert, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Task } from "../types";

interface FocusBubbleProps {
  tasks: Task[];
  onExit: () => void;
  onLogFocus: (taskId: string, hours: number) => void;
}

export default function FocusBubble({ tasks, onExit, onLogFocus }: FocusBubbleProps) {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(pendingTasks[0]?.id || "");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [logged, setLogged] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Auto log 25 minutes (0.4 hours)
      if (selectedTaskId) {
        onLogFocus(selectedTaskId, 0.4);
        setLogged(true);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, selectedTaskId]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setLogged(false);
  };

  const handleLogManual = () => {
    if (selectedTaskId) {
      onLogFocus(selectedTaskId, 0.5); // log half hour
      setLogged(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = (timeLeft / (25 * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none">
      {/* Immersive moving cosmic backgrounds */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-orb-1"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-orb-2"></div>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
      >
        <X className="h-4 w-4" />
        Decompress Bubble
      </button>

      {/* Main Bubble Chamber */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center px-6 space-y-12">
        {/* Task Selection Header */}
        <div className="space-y-4 w-full">
          {!isActive ? (
            <div className="space-y-1.5 max-w-xs mx-auto">
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                SELECT ACTIVE TARGET
              </span>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  handleReset();
                }}
                className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-center focus:outline-none focus:border-indigo-500"
              >
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                DEEP FLOW ACTIVE
              </span>
              <h2 className="text-xl font-extrabold font-display text-white max-w-md mx-auto line-clamp-2 leading-snug">
                {selectedTask?.name || "Neural Calibration Block"}
              </h2>
            </div>
          )}
        </div>

        {/* Large Glowing Countdown Timer */}
        <div className="relative flex items-center justify-center h-72 w-72">
          {/* Animated ripple outer rings */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-indigo-500/5 border border-indigo-500/10 scale-110 animate-pulse-ring"></div>
              <div className="absolute inset-0 rounded-full bg-cyan-500/5 border border-cyan-500/10 scale-120 animate-pulse-ring" style={{ animationDelay: "2s" }}></div>
            </>
          )}

          {/* Symmetrical countdown ring */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle cx="144" cy="144" r="120" stroke="rgba(255,255,255,0.02)" strokeWidth="4" fill="transparent" />
            <circle
              cx="144"
              cy="144"
              r="120"
              stroke="url(#bubble-gradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className="transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="bubble-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl font-extrabold font-mono tracking-wider text-white">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest">MINS : SECS</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={handleReset}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={handleToggle}
            className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr ${
              isActive ? "from-red-600 to-rose-700 shadow-rose-500/20" : "from-indigo-600 to-cyan-600 shadow-indigo-500/20"
            } text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer`}
          >
            {isActive ? (
              <Pause className="h-8 w-8 fill-white" />
            ) : (
              <Play className="h-8 w-8 fill-white translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => setSoundOn(!soundOn)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            {soundOn ? (
              <Volume2 className="h-5 w-5 text-cyan-400 animate-pulse" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Logging confirmation / manual triggers */}
        <AnimatePresence>
          {logged ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-xs text-emerald-400 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Focus logged successfully (+0.5 Flow Hours)
            </motion.div>
          ) : (
            selectedTaskId && !isActive && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleLogManual}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-4"
              >
                Log 30 min focus session manually
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>

      {/* ambient focus status background loops */}
      {soundOn && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-mono flex items-center gap-1.5 animate-pulse uppercase">
          <Volume2 className="h-3 w-3 text-cyan-500 animate-bounce" />
          Playing Cosmic Alpha Wave loop (432Hz)
        </div>
      )}
    </div>
  );
}
