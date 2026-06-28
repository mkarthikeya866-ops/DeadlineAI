import React from 'react';
import { Brain, TrendingUp, ShieldCheck, Target } from 'lucide-react';

export default function AIPrediction() {
  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Brain className="h-6 w-6 text-purple-400" />
        Next Week Forecast
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
          <div className="text-xs text-slate-400">Success Probability</div>
          <div className="text-xl font-bold text-white">91%</div>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
          <div className="text-xs text-slate-400">Focus Trend</div>
          <div className="text-xl font-bold text-white flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Increasing
          </div>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
          <div className="text-xs text-slate-400">Burnout Risk</div>
          <div className="text-xl font-bold text-white flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Low
          </div>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 col-span-2">
          <div className="text-xs text-slate-400">Recommended Goal</div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            Finish DBMS before Thursday
          </div>
        </div>
      </div>
    </div>
  );
}
