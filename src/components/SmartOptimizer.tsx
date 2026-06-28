import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Calendar, Zap, AlertCircle, RefreshCw, Sun, Moon, ArrowRight } from "lucide-react";
import { Task, OptimizedBlock } from "../types";

interface SmartOptimizerProps {
  tasks: Task[];
}

export default function SmartOptimizer({ tasks }: SmartOptimizerProps) {
  const [wakeTime, setWakeTime] = useState("08:00");
  const [sleepTime, setSleepTime] = useState("22:00");
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<OptimizedBlock[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/smart-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.filter(t => !t.completed),
          wakeTime,
          sleepTime
        })
      });

      if (!response.ok) throw new Error("Chronological optimization failed");
      const data = await response.json();
      setBlocks(data.blocks);
    } catch (err) {
      console.error(err);
      setError("AI optimization offline. Synchronizing standard chronological default template.");
    } finally {
      setLoading(false);
    }
  };

  const getBlockStyles = (type: string) => {
    switch (type) {
      case "focus":
        return {
          bg: "bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-500/40",
          iconColor: "text-indigo-400",
          tagText: "DEEP FLOW WINDOW",
          tagBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        };
      case "rest":
        return {
          bg: "bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40",
          iconColor: "text-emerald-400",
          tagText: "RECOVERY BLOCK",
          tagBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        };
      default: // collaboration
        return {
          bg: "bg-cyan-950/20 border-cyan-500/20 hover:border-cyan-500/40",
          iconColor: "text-cyan-400",
          tagText: "ADMIN / CO-WORK",
          tagBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="rounded-2xl glass-panel p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            Adaptive Focus Scheduler
          </h3>
          <p className="text-xs text-slate-400">Configure your daily sleep cycle. AI will locate high-leverage focus windows to resolve pending deliverables with minimal friction.</p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2 flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              Wake Up Time
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2 flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-cyan-400" />
              Sleep Time
            </label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Optimizing Windows...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-cyan-400" />
                Run Smart Optimizer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Timeline blocks */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl glass-panel p-16 text-center"
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                <p className="text-sm font-mono text-indigo-400 animate-pulse tracking-wide uppercase">ASSEMBLING COGNITIVE FLOW SLOTS...</p>
              </div>
            </motion.div>
          )}

          {blocks.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <h4 className="text-xs text-slate-400 font-mono tracking-widest uppercase block">GENERATED SCHEDULE TIMELINE:</h4>
              <div className="space-y-3">
                {blocks.map((block, idx) => {
                  const styles = getBlockStyles(block.type);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`border rounded-xl p-5 transition-all duration-300 ${styles.bg}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`mt-0.5 rounded-lg bg-slate-950 p-2.5 border border-slate-900 shrink-0 ${styles.iconColor}`}>
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-300">{block.startTime} - {block.endTime}</span>
                              <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono tracking-wider ${styles.tagBg}`}>
                                {styles.tagText}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">({block.durationMinutes} min)</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-100 font-display">{block.label}</h4>
                            <p className="text-xs text-slate-400 font-sans leading-relaxed">
                              {block.tip}
                            </p>
                          </div>
                        </div>

                        {block.type === "focus" && (
                          <div className="flex justify-end shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 tracking-wider flex items-center gap-1">
                              PEAK PERFORMANCE ZONE
                              <ArrowRight className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {blocks.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 font-mono space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-slate-600 mb-2" />
              <p>No optimized timeline blocks generated.</p>
              <p className="text-xs text-slate-600">Adjust wake cycle inputs and trigger the optimizer above to construct your day.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
