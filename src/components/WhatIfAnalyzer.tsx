import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Shuffle, ShieldAlert, CheckCircle2, ChevronRight, Play, Zap } from "lucide-react";
import { Task, WhatIfResult } from "../types";

interface WhatIfAnalyzerProps {
  tasks: Task[];
}

export default function WhatIfAnalyzer({ tasks }: WhatIfAnalyzerProps) {
  const [scenarioInput, setScenarioInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleScenarios = [
    "What if I delay my highest priority task by 3 days?",
    "What if I add 3 new high-complexity development milestones?",
    "What if I reduce my daily study/work focus allocation to only 2 hours?"
  ];

  const handleAnalyze = async (scenarioText: string) => {
    const text = scenarioText || scenarioInput;
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/gemini/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: text,
          tasks
        })
      });

      if (!response.ok) throw new Error("What-if analysis failed");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("AI simulation framework offline. Synchronizing default local prediction metrics.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "text-red-400 border-red-500/20 bg-red-500/5";
      case "Medium":
        return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      default:
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Card */}
      <div className="rounded-2xl glass-panel p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-indigo-400" />
            Downstream Consequences Predictor
          </h3>
          <p className="text-xs text-slate-400">Describe any schedule change or habit shift. AI will trace the ripple effect through your entire task queue.</p>
        </div>

        {/* Input area */}
        <div className="flex gap-2.5">
          <input
            type="text"
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze("")}
            placeholder="What if I postpone my main project to work on graphics design for 2 days?"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
          />
          <button
            onClick={() => handleAnalyze("")}
            disabled={loading || !scenarioInput.trim()}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? "Modeling..." : "Analyze Consequences"}
          </button>
        </div>

        {/* Quick presets */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">HYPOTHETICAL TEMPLATES:</span>
          <div className="flex flex-col gap-2">
            {sampleScenarios.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setScenarioInput(sc);
                  handleAnalyze(sc);
                }}
                className="text-left text-xs text-slate-400 hover:text-indigo-400 hover:bg-slate-900/30 p-2.5 rounded-xl border border-slate-900 transition-all truncate flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">{sc}</span>
                <ChevronRight className="h-3 w-3 text-slate-600 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl glass-panel p-12 text-center"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
              <p className="text-sm font-mono text-indigo-400 animate-pulse tracking-wide uppercase">RECALCULATING DOWNSTREAM PATHWAYS...</p>
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Fallout Card */}
            <div className="lg:col-span-2 rounded-2xl glass-panel p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-2xl"></div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">CONSEQUENCE SUMMARY</span>
                <h4 className="text-lg font-bold font-display text-white">AI Behavioral Impact Forecast</h4>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-5 rounded-xl border border-slate-900 font-sans">
                "{result.consequence}"
              </p>

              <div className="space-y-3.5">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">POTENTIALLY IMPACTED QUEUE:</span>
                <div className="flex flex-wrap gap-2">
                  {result.impactedTasks.map((taskName, i) => (
                    <span key={i} className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                      {taskName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Downstream Delay Meter / Risk Profile */}
            <div className="space-y-6">
              {/* Risk Score */}
              <div className="rounded-2xl glass-panel p-6 space-y-4">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">DOWNSTREAM DELAY</span>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="text-sm font-semibold text-slate-200">Delay Risk Profile</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getRiskColor(result.downstreamDelayRisk)}`}>
                    {result.downstreamDelayRisk}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs text-slate-400">SPILLOVER SCORE</span>
                    <span className="text-xl font-bold text-white">{result.downstreamDelayScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                    <div
                      className={`h-full rounded-full ${
                        result.downstreamDelayRisk === "High"
                          ? "bg-red-500"
                          : result.downstreamDelayRisk === "Medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${result.downstreamDelayScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Mitigation suggestion */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 space-y-3.5">
                <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  SAFETY MITIGATION STRATEGY
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {result.mitigation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
