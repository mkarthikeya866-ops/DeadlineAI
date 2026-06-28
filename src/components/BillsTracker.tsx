import React, { useState } from 'react';
import { DollarSign, Plus, CheckCircle, Clock } from 'lucide-react';
import { Bill } from '../types';

export default function BillsTracker() {
  const [bills, setBills] = useState<Bill[]>([
      { id: '1', name: 'Rent', amount: 1200, dueDate: '2026-06-30', isPaid: false, createdAt: '2026-06-01' },
      { id: '2', name: 'Internet', amount: 60, dueDate: '2026-06-28', isPaid: true, createdAt: '2026-06-01' },
  ]);

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-400" />
            Bills Tracker
        </h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Bill
        </button>
      </div>

      <div className="space-y-3">
        {bills.map(bill => (
            <div key={bill.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${bill.isPaid ? 'bg-emerald-900/20 text-emerald-400' : 'bg-rose-900/20 text-rose-400'}`}>
                        {bill.isPaid ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-100">{bill.name}</div>
                        <div className="text-xs text-slate-400">Due: {bill.dueDate}</div>
                    </div>
                </div>
                <div className="text-lg font-bold text-white">${bill.amount}</div>
            </div>
        ))}
      </div>
    </div>
  );
}
