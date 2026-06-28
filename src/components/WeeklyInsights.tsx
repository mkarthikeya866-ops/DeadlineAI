import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Activity, Zap, BrainCircuit, Target, Award, Rocket, Check, X } from "lucide-react";
import { Task, WeeklyInsightReport } from "../types";
import AnalyticsCards from "./AnalyticsCards";
import AchievementGalaxy from "./AchievementGalaxy";
import FutureSelfSimulator from "./FutureSelfSimulator";

interface WeeklyInsightsProps {
  tasks: Task[];
}

export default function WeeklyInsights({ tasks }: WeeklyInsightsProps) {
  const [report, setReport] = useState<WeeklyInsightReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
        setReport({
            productivityTrendScore: 89,
            focusTrendScore: 81,
            growthReport: "Your productivity increased by 23% this week.",
            weeklyRecap: "You are doing great!",
            chartData: [
                { day: 'M', focus: 4, stress: 2, completion: 5 },
                { day: 'T', focus: 6, stress: 3, completion: 7 },
                { day: 'W', focus: 5, stress: 4, completion: 6 },
                { day: 'T', focus: 8, stress: 2, completion: 9 },
                { day: 'F', focus: 9, stress: 1, completion: 10 },
                { day: 'S', focus: 7, stress: 3, completion: 8 },
                { day: 'S', focus: 6, stress: 2, completion: 7 },
            ]
        } as any);
        setLoading(false);
    }, 1000);
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm">
        <BrainCircuit className="h-5 w-5" />
        <span>🧠 Neural Productivity Analytics</span>
      </div>
      
      <AnalyticsCards />

      {/* Animated Area Graph */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={report?.chartData}>
            <defs>
              <linearGradient id="focus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip contentStyle={{background: '#0f172a', borderColor: '#334155'}} />
            <Area type="monotone" dataKey="focus" stroke="#06B6D4" fillOpacity={1} fill="url(#focus)" />
            <Area type="monotone" dataKey="stress" stroke="#F59E0B" fillOpacity={0} />
            <Area type="monotone" dataKey="completion" stroke="#10B981" fillOpacity={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900/40 p-6 rounded-3xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">🚀 Weekly AI Report</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                    <li>Productivity increased by 23%</li>
                    <li>Focus quality improved by 14%</li>
                    <li>Burnout risk decreased by 9%</li>
                    <li className="text-indigo-400 font-bold">Predicted next-week performance: 91%</li>
                </ul>
            </div>
            <FutureSelfSimulator />
        </div>
        <div className="space-y-6">
            <AchievementGalaxy />
            {/* Leaderboard */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-2">🏅 Productivity Rank</h3>
                <div className="text-sm text-slate-300">You: #1</div>
                <div className="text-sm text-slate-400">College Average: 68%</div>
                <div className="text-sm text-indigo-400 font-bold">Your Score: 91%</div>
            </div>
            {/* AI Prediction Card */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-2">🔮 Next Week Forecast</h3>
                <p className="text-sm text-slate-400">Success Probability: 91%</p>
            </div>
            {/* Floating AI Insight */}
            <div className="bg-indigo-900/30 p-4 rounded-2xl border border-indigo-500/30">
                <h4 className="text-indigo-200 font-bold text-xs mb-1">AI Observation</h4>
                <p className="text-xs text-indigo-300">You work best between 7:00 PM – 10:00 PM</p>
                <p className="text-xs text-indigo-400 mt-2">Average completion rate: 87%</p>
            </div>
        </div>
      </div>
    </div>
  );
}

