import React, { useState, useEffect } from 'react';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { googleSignIn, getAccessToken, initAuth } from '../firebase';

export default function GmailInterviewChecker() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=interview&maxResults=5', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch emails");
      const data = await response.json();
      
      if (data.messages) {
          const detailedMessages = await Promise.all(data.messages.map(async (msg: any) => {
              const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
                  headers: { Authorization: `Bearer ${token}` },
              });
              return await res.json();
          }));
          setMessages(detailedMessages);
      } else {
          setMessages([]);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "Authentication required") {
        setNeedsAuth(true);
      } else {
        setError("Failed to load emails.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!needsAuth) {
      fetchMessages();
    }
  }, [needsAuth]);

  if (needsAuth) {
    return (
      <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Gmail Integration</h2>
        <button onClick={async () => { await googleSignIn(); fetchMessages(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer">
          Sign in with Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Mail className="h-6 w-6 text-rose-400" />
        Interview Status (Gmail)
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
          {messages.length === 0 ? <p className="text-slate-400 text-sm">No recent interview emails found.</p> : messages.map(msg => {
            const subject = msg.payload.headers.find((h: any) => h.name === 'Subject')?.value;
            const from = msg.payload.headers.find((h: any) => h.name === 'From')?.value;
            return (
                <div key={msg.id} className="bg-slate-950 p-4 rounded-xl border border-white/5 text-sm">
                  <div className="font-bold text-slate-100">{subject}</div>
                  <div className="text-xs text-slate-400">{from}</div>
                </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
