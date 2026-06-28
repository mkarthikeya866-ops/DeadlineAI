import React, { useState } from 'react';
import { Target, Plus, AlertCircle } from 'lucide-react';
import { Commitment } from '../types';

export default function Commitments() {
  const [commitments, setCommitments] = useState<Commitment[]>([
      { id: '1', title: 'Complete Project Report', deadline: '2026-06-30', description: 'Final report for the quarter', isImportant: true, isCompleted: false, createdAt: '2026-06-01' },
      { id: '2', title: 'Gym session', deadline: '2026-06-27', description: 'Weekly workout', isImportant: false, isCompleted: false, createdAt: '2026-06-01' },
  ]);

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-amber-400" />
            Important Commitments
        </h2>
        <button className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Commitment
        </button>
      </div>

      <div className="space-y-3">
        {commitments.map(commitment => (
            <div key={commitment.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${commitment.isImportant ? 'bg-amber-900/20 text-amber-400' : 'bg-slate-900/20 text-slate-400'}`}>
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-100">{commitment.title}</div>
                        <div className="text-xs text-slate-400">{commitment.description} • Due: {commitment.deadline}</div>
                    </div>
                </div>
                {commitment.isImportant && <AlertCircle className="h-5 w-5 text-amber-500" />}
            </div>
        ))}
      </div>
    </div>
  );
}
