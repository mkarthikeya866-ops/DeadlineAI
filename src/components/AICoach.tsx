import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, Sparkles, HelpCircle, ArrowRight, Zap } from "lucide-react";
import { Task, AICoachMessage } from "../types";

interface AICoachProps {
  tasks: Task[];
  burnoutRisk: string;
  archetype: string;
  onTriggerAction: (actionType: string) => void;
  onHideBot?: () => void;
}

export default function AICoach({ tasks, burnoutRisk, archetype, onTriggerAction, onHideBot }: AICoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPromptHint, setHasPromptHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "coach",
          text: `Greetings, Karthikeya! I am **DeadlineAI**. 

I have analyzed your environment:
• **Burnout level:** \`${burnoutRisk}\`
• **Productivity DNA:** \`${archetype || "Analyzing..."}\`
• **Pending tasks:** \`${tasks.filter(t => !t.completed).length}\`

Ask me to optimize your day, predict a deadline delay, or assist with workload decompression.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [burnoutRisk, archetype, tasks]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) {
      setInput("");
    }
    setHasPromptHint(false);

    // Add user message
    const userMsg: AICoachMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.sender === "coach" ? "model" : "user", text: m.text })),
          context: {
            tasks,
            burnoutRisk,
            archetype
          }
        })
      });

      if (!response.ok) throw new Error("Coach API failure");
      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          id: `coach-${Date.now()}`,
          sender: "coach",
          text: data.reply,
          suggestedAction: data.suggestedAction,
          suggestedActionLabel: data.suggestedActionLabel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `coach-error-${Date.now()}`,
          sender: "coach",
          text: "I experienced a brief neural sync error. Let's redirect: Try typing 'optimize schedule' or 'simulate burnout' to trigger default metrics.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionType: string) => {
    onTriggerAction(actionType);
    setIsOpen(false);
  };

  const prompts = [
    "How can I avoid burnout today?",
    "Optimize my schedule around my energy peak",
    "What if I delay my highest priority task?",
  ];

  return (
    <>
      {/* Floating launcher badge */}
      <motion.button
        id="ai-coach-launcher"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 cursor-pointer hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
        </span>
        <Bot className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-coach-panel"
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] w-full max-w-[420px] flex-col rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 relative">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-slate-100">DeadlineAI</h3>
                  <p className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    NEURAL LINK ONLINE
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onHideBot && (
                  <button
                    onClick={onHideBot}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-red-400 hover:bg-slate-800/60 border border-slate-800 px-2 py-1 rounded-lg transition-all cursor-pointer"
                    title="Hide launcher completely"
                  >
                    Hide Bot
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-850/40 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-all font-semibold cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 text-sm scroll-smooth relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-900/80 mb-2">
                <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-semibold">Active Session</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/20 p-1.5 rounded-xl transition-all cursor-pointer"
                  title="Exit"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%] flex flex-col gap-1">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-md ${
                        m.sender === "user"
                          ? "bg-indigo-600 text-slate-100 rounded-tr-none"
                          : "bg-slate-900/60 text-slate-300 border border-slate-800/50 rounded-tl-none font-sans leading-relaxed"
                      }`}
                    >
                      {m.sender === "coach" ? (
                        <div className="space-y-2 whitespace-pre-line">
                          {/* Rich parser emulation */}
                          {m.text.split("\n").map((line, i) => {
                            if (line.startsWith("•")) {
                              return (
                                <li key={i} className="list-none pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-indigo-400">
                                  {line.replace("•", "").trim()}
                                </li>
                              );
                            }
                            return <p key={i}>{line}</p>;
                          })}
                        </div>
                      ) : (
                        <p>{m.text}</p>
                      )}

                      {/* Display floating CTA if returned */}
                      {m.suggestedAction && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleActionClick(m.suggestedAction!)}
                            className="flex items-center gap-2 rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all cursor-pointer"
                          >
                            <Zap className="h-3.5 w-3.5 text-cyan-400 animate-bounce" />
                            {m.suggestedActionLabel || "Activate Now"}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] text-slate-500 font-mono ${
                        m.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-900/40 border border-slate-800/50 px-4 py-3 rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Synthesizing predictions...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hints Box */}
            {hasPromptHint && (
              <div className="px-5 py-2 border-t border-slate-900 bg-slate-950/50 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">Prompt Suggestions:</span>
                <div className="flex flex-col gap-1">
                  {prompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="text-left text-xs text-slate-400 hover:text-indigo-400 hover:bg-slate-900/30 p-1.5 rounded-md border border-slate-900 transition-all truncate cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask your productivity cofounder..."
                className="flex-1 bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-600 text-slate-100 disabled:opacity-40 hover:bg-indigo-500 transition-all shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
