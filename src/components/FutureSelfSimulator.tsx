import React from 'react';
import { Check, X } from 'lucide-react';

export default function FutureSelfSimulator() {
  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
      <h3 className="text-lg font-bold text-white mb-4">🔮 Future Self Simulator</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20">
          <h4 className="text-emerald-400 font-bold mb-3">If you maintain this pace:</h4>
          <ul className="space-y-2 text-xs text-emerald-100">
            <li className="flex items-center gap-2"><Check className="h-4 w-4"/> Finish all deadlines</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4"/> Burnout Risk 18%</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4"/> Productivity Score 94%</li>
          </ul>
        </div>
        <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20">
          <h4 className="text-rose-400 font-bold mb-3">If you slow down:</h4>
          <ul className="space-y-2 text-xs text-rose-100">
            <li className="flex items-center gap-2"><X className="h-4 w-4"/> 3 deadlines missed</li>
            <li className="flex items-center gap-2"><X className="h-4 w-4"/> Burnout Risk 73%</li>
            <li className="flex items-center gap-2"><X className="h-4 w-4"/> Productivity Score 61%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
