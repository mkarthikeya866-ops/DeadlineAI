import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Orbit, Award, Sparkles, Zap, ShieldCheck, Heart, AlertCircle, RefreshCw } from "lucide-react";
import { Task, ProductivityDNAProfile } from "../types";

interface ProductivityDNAProps {
  tasks: Task[];
}

export default function ProductivityDNA({ tasks }: ProductivityDNAProps) {
  const [profile, setProfile] = useState<ProductivityDNAProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derivations for metrics to send to AI
  const completed = tasks.filter(t => t.completed);
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 75;
  const loggedFocus = tasks.reduce((acc, t) => acc + t.focusHoursLogged, 0);
  const totalPostponed = tasks.reduce((acc, t) => acc + t.postponedCount, 0);
  const delayRate = total > 0 ? Math.round((totalPostponed / total) * 100) : 25;

  const handleFetchDNA = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/productivity-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionRate,
          focusHoursPerWeek: loggedFocus,
          taskDelayRate: delayRate,
          commonTags: Array.from(new Set(tasks.map(t => t.category)))
        })
      });

      if (!response.ok) throw new Error("DNA profiling failed");
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError("DNA profiling unit temporarily offline. Using standard calibrated template.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchDNA();
  }, [tasks]);

  // Achievement Galaxy Planets calculations
  const planets = [
    {
      name: "Focus Planet",
      stat: `${loggedFocus} hrs`,
      percent: Math.min(100, Math.round((loggedFocus / 15) * 100)), // 15 hrs target
      desc: "Deep work orbit alignment. Track pure focus momentum.",
      color: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
      animation: "animate-orb-1"
    },
    {
      name: "Consistency Planet",
      stat: `${completionRate}%`,
      percent: completionRate,
      desc: "Relentless execution orbit. Minimize pending spillovers.",
      color: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/20",
      animation: "animate-orb-2"
    },
    {
      name: "Deadline Planet",
      stat: `${100 - Math.min(100, delayRate)}%`,
      percent: 100 - Math.min(100, delayRate),
      desc: "Chronological precision orbit. Avoid delay alerts.",
      color: "from-pink-500 to-rose-600",
      glow: "shadow-pink-500/20",
      animation: "animate-orb-3"
    },
    {
      name: "Productivity Planet",
      stat: `${completed.length}/${total}`,
      percent: total > 0 ? Math.round((completed.length / total) * 100) : 100,
      desc: "Universal check-off speed. Maximize milestone resolve.",
      color: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      animation: "animate-orb-1"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Achievement Galaxy Planets Display (Gamified section first for high visual impact!) */}
      <div className="rounded-2xl glass-panel p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-mono tracking-wider uppercase flex items-center gap-2">
            <Orbit className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
            ACHIEVEMENT GALAXY
          </span>
          <h3 className="text-lg font-bold font-display text-slate-100">Celestial Progress Spheres</h3>
          <p className="text-xs text-slate-400 font-sans">Your productivity orbits projected as interactive glowing planets. Hover to scan trajectory.</p>
        </div>

        {/* Planet Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {planets.map((pl, idx) => (
            <motion.div
              key={idx}
              className={`rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 p-5 flex flex-col justify-between items-center text-center relative overflow-hidden group shadow-lg ${pl.glow} transition-all duration-300`}
              whileHover={{ y: -4 }}
            >
              <div className="space-y-4 w-full flex flex-col items-center">
                {/* Floating animated planet orb */}
                <div className={`h-16 w-16 rounded-full bg-gradient-to-tr ${pl.color} flex items-center justify-center relative shadow-2xl ${pl.animation} shrink-0`}>
                  <div className="absolute inset-0.5 rounded-full bg-slate-950/20 backdrop-blur-[1px]"></div>
                  <div className="relative font-mono text-xs font-bold text-white tracking-tight">{pl.stat}</div>
                  {/* Planet rings */}
                  <div className="absolute border border-white/10 rounded-full h-24 w-24 -rotate-12 scale-y-25 group-hover:rotate-12 transition-all duration-700"></div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100 font-display">{pl.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal max-w-[180px]">{pl.desc}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full mt-5 space-y-1.5">
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${pl.color} rounded-full`} style={{ width: `${pl.percent}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>ORBIT VELOCITY</span>
                  <span>{pl.percent}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DNA Profile Results */}
      {loading ? (
        <div className="rounded-2xl glass-panel p-16 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
          <p className="text-sm font-mono text-indigo-400 animate-pulse tracking-wide uppercase">SEQUENCING PRODUCTIVITY DNA PROFILE...</p>
        </div>
      ) : profile ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left card - Archetype Details */}
          <div className="lg:col-span-2 rounded-2xl glass-panel p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1.5 font-semibold">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                ACTIVE PERSONALITY ARCHETYPE
              </span>
              <h3 className="text-2xl font-extrabold font-display text-white">
                {profile.archetype} <span className="text-slate-400 font-light text-lg">({profile.title})</span>
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-5 rounded-xl border border-slate-900">
              {profile.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-sans">
              <div className="space-y-3">
                <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase block">STRENGTHS</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {profile.strengths.map((str, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-red-400 font-mono tracking-widest uppercase block">VULNERABILITIES</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {profile.weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                      {wk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right card - Superpower & Tip */}
          <div className="space-y-6">
            {/* Superpower */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1.5 mb-3.5">
                <Zap className="h-4 w-4 text-cyan-400" />
                COSMIC SUPERPOWER
              </span>
              <h4 className="text-lg font-bold font-display text-white mb-1.5">{profile.superpower}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Your primary cognitive advantage. This allows you to naturally outperform standard focus metrics under optimized conditions.
              </p>
            </div>

            {/* Improvement Tip */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 space-y-3.5">
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                <Award className="h-4 w-4 text-cyan-400 animate-bounce" />
                TACTICAL UPGRADE TIP
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                "{profile.improvementTip}"
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 font-mono">
          <AlertCircle className="h-8 w-8 mx-auto text-slate-600 mb-2" />
          <p>No profile generated yet.</p>
        </div>
      )}
    </div>
  );
}
