import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { googleSignIn, getAccessToken, initAuth } from '../firebase'; // Need to ensure these exist

export default function CalendarIntegration() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch calendar events");
      const data = await response.json();
      setEvents(data.items || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!needsAuth) {
      fetchEvents();
    }
  }, [needsAuth]);

  if (needsAuth) {
    return (
      <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Calendar Integration</h2>
        <button onClick={async () => { await googleSignIn(); fetchEvents(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer">
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <CalendarIcon className="h-6 w-6 text-cyan-400" />
        Calendar Integration
      </h2>

      {loading ? (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-rose-400 flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
        </div>
      ) : (
        <div className="space-y-3">
          {events.length === 0 ? <p className="text-slate-400 text-sm">No events found.</p> : events.map(event => (
            <div key={event.id} className="bg-slate-950 p-4 rounded-xl border border-white/5 text-sm">
              <div className="font-bold text-slate-100">{event.summary || 'No Title'}</div>
              <div className="text-xs text-slate-400">{event.start?.dateTime || event.start?.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
