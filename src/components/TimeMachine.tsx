import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Clock, Percent, ShieldCheck, Flame, Cpu, Shuffle, AlertCircle, ArrowRight } from "lucide-react";
import { Task, TimeMachineScenario } from "../types";

interface TimeMachineProps {
  tasks: Task[];
  selectedTaskFromDashboard: Task | null;
  onClearSelectedTask: () => void;
}

export default function TimeMachine({
  tasks,
  selectedTaskFromDashboard,
  onClearSelectedTask
}: TimeMachineProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [scenarios, setScenarios] = useState<TimeMachineScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with selected task from dashboard or seed the first pending one if none selected
  useEffect(() => {
    if (selectedTaskFromDashboard) {
      setSelectedTask(selectedTaskFromDashboard);
      triggerSimulation(selectedTaskFromDashboard);
      onClearSelectedTask(); // clear immediately to avoid infinite state loop
    } else if (!selectedTask && tasks.length > 0) {
      const incomplete = tasks.filter((t) => !t.completed);
      if (incomplete.length > 0) {
        setSelectedTask(incomplete[0]);
        triggerSimulation(incomplete[0]);
      }
    }
  }, [selectedTaskFromDashboard, tasks]);

  const triggerSimulation = async (task: Task) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/time-machine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: task.name,
          priority: task.priority,
          complexity: task.complexity,
          hoursNeeded: task.focusHoursPlanned
        })
      });

      if (!response.ok) throw new Error("Chronological forecasting failed");
      const data = await response.json();
      setScenarios(data.scenarios);
    } catch (err: any) {
      console.error(err);
      setError("AI chronological forecasting engine offline. Using local safety prediction matrix.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskChange = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      triggerSimulation(task);
    }
  };

  const getProbabilityColor = (p: number) => {
    if (p > 80) return "text-emerald-400";
    if (p > 50) return "text-amber-400";
    return "text-red-400";
  };

  const getMetricColor = (val: number, isNegative: boolean = false) => {
    if (isNegative) {
      if (val > 75) return "bg-red-500 shadow-red-500/20";
      if (val > 45) return "bg-amber-500 shadow-amber-500/20";
      return "bg-emerald-500 shadow-emerald-500/20";
    } else {
      if (val > 75) return "bg-emerald-500 shadow-emerald-500/20";
      if (val > 45) return "bg-amber-500 shadow-amber-500/20";
      return "bg-red-500 shadow-red-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Selector */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-600 animate-spin" style={{ animationDuration: "6s" }} />
              Chronological Forecasting Unit
            </h3>
            <p className="text-xs text-slate-500 font-semibold">Select an active timeline thread to simulate cascading probability curves.</p>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedTask?.id || ""}
              onChange={(e) => handleTaskChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="" disabled>Select a Task to Project...</option>
              {tasks.filter(t => !t.completed).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Forecaster Output */}
      {selectedTask ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-1 lg:col-span-3 py-24 flex flex-col items-center justify-center gap-4">
                <div className="relative h-16 w-16 items-center justify-center">
                  <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-indigo-500 opacity-20"></span>
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                </div>
                <p className="text-sm font-mono text-indigo-600 animate-pulse uppercase tracking-widest font-bold">
                  ALIGNED TEMPORAL MATRIX...
                </p>
              </div>
            ) : (
              scenarios.map((sc, idx) => (
                <motion.div
                  key={sc.type}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-sm font-bold text-slate-900 font-display">{sc.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-bold">SCENARIO {String.fromCharCode(65 + idx)}</span>
                    </div>

                    {/* Circular Success rate gauge */}
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="54" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            stroke={sc.probability > 75 ? "#10B981" : sc.probability > 45 ? "#F59E0B" : "#EF4444"}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 * (1 - sc.probability / 100)}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className={`text-3xl font-extrabold font-mono ${
                            sc.probability > 75 ? "text-emerald-600" : sc.probability > 45 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {sc.probability}%
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono font-bold">SUCCESS PROB.</span>
                        </div>
                      </div>
                    </div>

                    {/* Grid Metrics */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-mono">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <Shuffle className="h-3.5 w-3.5 text-indigo-500" />
                          Workload
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${sc.workload}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-700 font-bold">{sc.workload}%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-red-500" />
                          Stress
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-red-500" style={{ width: `${sc.stress}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-700 font-bold">{sc.stress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Descriptive Insight */}
                    <p className="text-xs text-slate-500 font-sans leading-relaxed text-center italic font-semibold">
                      "{sc.prediction}"
                    </p>
                  </div>

                  {/* Recommendation action footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      CHRONO OPTIMIZED INDEX
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center text-slate-400 font-mono space-y-2 shadow-xs">
          <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="font-bold">No task selected for time-projection modeling.</p>
          <p className="text-xs text-slate-500">Complete tasks or add pending structures to feed the simulation.</p>
        </div>
      )}
    </div>
  );
}
