import React from 'react';
import { Award, Zap, Rocket, Brain, Target } from 'lucide-react';

export default function AchievementGalaxy() {
  const achievements = [
    { title: '7 Day Focus Streak', icon: Zap },
    { title: 'Task Slayer', icon: Award },
    { title: 'Deadline Master', icon: Rocket },
    { title: 'Deep Work Champion', icon: Brain },
    { title: 'Productivity Ninja', icon: Target },
  ];

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
      <h3 className="text-lg font-bold text-white">🏆 Hall of Achievements</h3>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a, i) => (
          <div key={i} className="bg-slate-950 p-3 rounded-xl border border-white/5 flex items-center gap-2 text-xs">
            <a.icon className="h-4 w-4 text-amber-400" />
            {a.title}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
            <span>Level 12</span>
            <span>2460 / 3000 XP</span>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{width: '82%'}}></div>
        </div>
      </div>
    </div>
  );
}
