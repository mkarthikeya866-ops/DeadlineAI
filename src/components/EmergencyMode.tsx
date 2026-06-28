import React, { useMemo } from "react";
import { AlertTriangle, Zap, Clock, ShieldAlert } from "lucide-react";
import { Task } from "../types";

export default function EmergencyMode({ tasks, onExit }: { tasks: Task[], onExit: () => void }) {
  const urgentTasks = useMemo(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return tasks.filter(t => !t.completed && t.dueDate && (new Date(t.dueDate).getTime() - now) < twentyFourHours);
  }, [tasks]);

  return (
    <div className="bg-slate-950 p-8 rounded-3xl border border-rose-500/30 text-white shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-rose-500/20 p-4 rounded-full text-rose-400"><ShieldAlert className="h-8 w-8" /></div>
        <div>
          <h2 className="text-3xl font-black text-rose-500 uppercase tracking-tighter">Emergency Mode</h2>
          <p className="text-slate-400">Survival plan active for {urgentTasks.length} urgent tasks.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {urgentTasks.map(task => (
            <div key={task.id} className="bg-slate-900 p-4 rounded-2xl border border-rose-500/20">
                <h4 className="font-bold text-rose-200">{task.name}</h4>
                <p className="text-xs text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
        <div className="bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20">
          <h3 className="font-bold mb-4 text-rose-100 flex items-center gap-2"><Zap className="h-5 w-5 text-amber-400"/> AI Survival Plan</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            {urgentTasks.length > 0 ? (
                <>
                <li>1. Prioritize: Focus only on "{urgentTasks[0].name}".</li>
                <li>2. Execute: Set a 50-minute deep focus block now.</li>
                <li>3. Minimize: Eliminate all non-critical notifications.</li>
                </>
            ) : (
                <li>All clear! You have no immediate deadlines.</li>
            )}
          </ul>
        </div>
      </div>
      <button onClick={onExit} className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl cursor-pointer transition-all">Deactivate Emergency Mode</button>
    </div>
  );
}
