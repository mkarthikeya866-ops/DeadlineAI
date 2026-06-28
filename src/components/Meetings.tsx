import React, { useState } from 'react';
import { Users, Plus, Clock, MapPin } from 'lucide-react';
import { Meeting } from '../types';

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([
      { id: '1', title: 'Team Sync', dateTime: '2026-06-30T10:00:00', attendees: ['Alice', 'Bob'], location: 'Zoom', createdAt: '2026-06-01' },
      { id: '2', title: 'Project Review', dateTime: '2026-07-02T14:00:00', attendees: ['Charlie'], location: 'Office', createdAt: '2026-06-01' },
  ]);

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-sky-400" />
            Meetings
        </h2>
        <button className="bg-sky-600 hover:bg-sky-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Meeting
        </button>
      </div>

      <div className="space-y-3">
        {meetings.map(meeting => (
            <div key={meeting.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-sky-900/20 text-sky-400">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-100">{meeting.title}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            <Clock className="h-3 w-3" /> {new Date(meeting.dateTime).toLocaleString()}
                            <MapPin className="h-3 w-3 ml-2" /> {meeting.location}
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
