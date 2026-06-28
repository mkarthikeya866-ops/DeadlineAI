import React from 'react';
import { Target, Clock, TrendingUp, BrainCircuit } from 'lucide-react';

export default function AnalyticsCards() {
  const cards = [
    { title: 'Peak Focus Day', value: 'Friday', score: '9.2/10', icon: Target },
    { title: 'Deep Work Hours', value: '42h', score: '', icon: Clock },
    { title: 'Productivity Growth', value: '+23%', score: '', icon: TrendingUp },
    { title: 'Cognitive Efficiency', value: '88%', score: '', icon: BrainCircuit },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <card.icon className="h-5 w-5 text-indigo-400 mb-2" />
          <div className="text-xs text-slate-400">{card.title}</div>
          <div className="text-xl font-bold text-white">{card.value}</div>
          {card.score && <div className="text-[10px] text-indigo-300 font-mono">{card.score}</div>}
        </div>
      ))}
    </div>
  );
}
