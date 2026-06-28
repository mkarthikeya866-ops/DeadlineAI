import React, { useState } from 'react';
import { Briefcase, Plus, CheckCircle, Clock } from 'lucide-react';
import { JobInterview } from '../types';

export default function InterviewTracker() {
  const [interviews, setInterviews] = useState<JobInterview[]>([
      { id: '1', company: 'Google', role: 'Software Engineer', date: '2026-06-30', stage: 'Interview', createdAt: '2026-06-01' },
      { id: '2', company: 'Meta', role: 'Product Manager', date: '2026-07-02', stage: 'Applied', createdAt: '2026-06-01' },
  ]);

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Interview Tracker
        </h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="h-4 w-4" /> Log Interview
        </button>
      </div>

      <div className="space-y-3">
        {interviews.map(interview => (
            <div key={interview.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-indigo-900/20 text-indigo-400">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-100">{interview.company}</div>
                        <div className="text-xs text-slate-400">{interview.role} • {interview.date}</div>
                    </div>
                </div>
                <div className="text-xs font-bold text-indigo-300 bg-indigo-900/30 px-3 py-1 rounded-full">
                  {interview.stage}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
