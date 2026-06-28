import React from "react";
import { motion } from "motion/react";
import { Heart, Activity, Briefcase, BookOpen, UserPlus, Info } from "lucide-react";
import { Task } from "../types";

interface LifeBalanceProps {
  tasks: Task[];
}

export default function LifeBalance({ tasks }: LifeBalanceProps) {
  // Derive percentages based on task categories
  const categories = ["work", "study", "health", "social"] as const;

  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completedCat = catTasks.filter((t) => t.completed);
    const percent = catTasks.length > 0 ? Math.round((completedCat.length / catTasks.length) * 100) : 100; // default 100% if no tasks (no neglect!)

    let title = "";
    let icon = <BookOpen className="h-5 w-5" />;
    let colorClass = "";
    let barColor = "";

    switch (cat) {
      case "work":
        title = "Enterprise / Work";
        icon = <Briefcase className="h-5 w-5 text-cyan-400" />;
        colorClass = "text-cyan-400";
        barColor = "bg-cyan-500 shadow-cyan-500/20";
        break;
      case "study":
        title = "Academic / Research";
        icon = <BookOpen className="h-5 w-5 text-indigo-400" />;
        colorClass = "text-indigo-400";
        barColor = "bg-indigo-500 shadow-indigo-500/20";
        break;
      case "health":
        title = "Somatic / Health";
        icon = <Heart className="h-5 w-5 text-emerald-400 animate-pulse" />;
        colorClass = "text-emerald-400";
        barColor = "bg-emerald-500 shadow-emerald-500/20";
        break;
      case "social":
        title = "Kinship / Social";
        icon = <UserPlus className="h-5 w-5 text-purple-400" />;
        colorClass = "text-purple-400";
        barColor = "bg-purple-500 shadow-purple-500/20";
        break;
    }

    return {
      cat,
      title,
      icon,
      percent,
      colorClass,
      barColor,
      totalCount: catTasks.length,
      completedCount: completedCat.length
    };
  });

  // Calculate overall balance dispersion
  const lowSectors = categoryStats.filter((c) => c.percent < 50);
  const isImbalanced = lowSectors.length > 0;

  return (
    <div className="rounded-2xl glass-panel p-6 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-2xl"></div>
      
      <div className="space-y-1">
        <span className="text-xs text-slate-400 font-mono tracking-wider uppercase flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
          LIFE BALANCE METER
        </span>
        <h3 className="text-lg font-bold font-display text-slate-100">Quantum Life Quadrants</h3>
        <p className="text-xs text-slate-400">Maintains structural equilibrium. Imbalances will trigger automated cognitive warnings.</p>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {categoryStats.map((st) => (
          <div
            key={st.cat}
            className="bg-slate-950/40 border border-slate-900 rounded-xl p-4.5 flex flex-col justify-between space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-slate-950 rounded-lg p-2 border border-slate-850 shrink-0">
                  {st.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 font-display">{st.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{st.completedCount}/{st.totalCount} milestones</span>
                </div>
              </div>
              <span className={`font-mono text-sm font-bold ${st.percent < 50 ? "text-red-400 animate-pulse" : "text-slate-300"}`}>
                {st.percent}%
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${st.barColor}`} style={{ width: `${st.percent}%` }}></div>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>BUFFER LEVEL</span>
                <span>{st.percent < 50 ? "CRITICAL NEGLECT" : st.percent < 80 ? "STABLE" : "OPTIMIZED"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Symmetrical warning card or status banner */}
      <div className={`border rounded-xl p-4.5 text-xs flex gap-3 ${
        isImbalanced 
          ? "border-amber-500/25 bg-amber-500/5 text-amber-300" 
          : "border-indigo-500/20 bg-indigo-500/5 text-indigo-300"
      }`}>
        <Info className={`h-5 w-5 shrink-0 ${isImbalanced ? "text-amber-400 animate-bounce" : "text-cyan-400"}`} />
        <div className="space-y-1 font-sans">
          <p className="font-semibold uppercase tracking-wider text-[10px] font-mono">
            {isImbalanced ? "ASSET DEFICIT WARNING" : "QUADRANT ALIGNED"}
          </p>
          <p className="leading-relaxed text-slate-300">
            {isImbalanced 
              ? `Your ${lowSectors.map((s) => s.title).join(" and ")} quadrants show depletion indices. Direct your next deep work sessions to restore buffer metrics.`
              : "All major sectors are in positive alignment. Continue active distribution to maintain this performance peak."}
          </p>
        </div>
      </div>
    </div>
  );
}
