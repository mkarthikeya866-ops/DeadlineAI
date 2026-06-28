import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { KeyRound, Mail, UserPlus, LogIn, ArrowRight, Sparkles, Cpu, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (userId: string | null) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess(cred.user.uid);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(cred.user.uid);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already in use. Please sign in instead.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("This sign-in method is not enabled. Please contact support.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("An authentication error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      onAuthSuccess(cred.user.uid);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  // Highly aesthetic developer desk stickers that are interactive & draggable
  const creativeStickers = [
    {
      id: "laptop",
      emoji: "💻",
      style: { top: "12%", left: "8%" },
      rotate: -12,
    },
    {
      id: "books",
      emoji: "📚",
      style: { top: "18%", right: "8%" },
      rotate: 8,
    },
    {
      id: "pen",
      emoji: "✍️",
      style: { bottom: "18%", left: "10%" },
      rotate: -8,
    },
    {
      id: "sticker-ship",
      emoji: "🚀",
      style: { bottom: "24%", right: "12%" },
      rotate: 14,
    },
    {
      id: "sticker-coffee",
      emoji: "☕",
      style: { top: "45%", left: "3%" },
      rotate: -15,
    },
    {
      id: "sticker-streak",
      emoji: "🔥",
      style: { bottom: "46%", right: "4%" },
      rotate: 10,
    }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative px-4 overflow-hidden select-none">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl animate-orb-1"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl animate-orb-2"></div>

      {/* Grid Desk Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

      {/* Draggable Desktop Assets / Stickers */}
      {creativeStickers.map((sticker) => (
        <motion.div
          key={sticker.id}
          drag
          dragMomentum={true}
          whileDrag={{ scale: 1.15, zIndex: 50, cursor: "grabbing" }}
          initial={{ opacity: 0, scale: 0.8, rotate: sticker.rotate }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={sticker.style}
          className="absolute hidden md:flex items-center justify-center h-12 w-12 rounded-full border border-slate-800 bg-slate-900/95 shadow-lg shadow-slate-950/45 cursor-grab select-none text-xl z-20"
        >
          {sticker.emoji}
        </motion.div>
      ))}

      {/* Small sticker badges that show even on mobile (carefully positioned not to overlap main card) */}
      <div className="absolute top-4 left-4 md:hidden flex gap-2">
        <div className="flex items-center justify-center h-8 w-8 bg-slate-900 border border-slate-800 rounded-full text-sm shadow-xs">
          💻
        </div>
        <div className="flex items-center justify-center h-8 w-8 bg-slate-900 border border-slate-800 rounded-full text-sm shadow-xs">
          📚
        </div>
      </div>
      <div className="absolute bottom-4 right-4 md:hidden flex gap-2">
        <div className="flex items-center justify-center h-8 w-8 bg-slate-900 border border-slate-800 rounded-full text-sm shadow-xs">
          ✍️
        </div>
        <div className="flex items-center justify-center h-8 w-8 bg-slate-900 border border-slate-800 rounded-full text-sm shadow-xs">
          🚀
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black font-display text-lg shadow-md shadow-indigo-500/20">
            DA
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-950">DEADLINEAI</h1>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-1">The Last-Minute Life Saver</p>
          </div>
        </div>

        {/* Card Frame */}
        <div className="rounded-2xl glass-panel-heavy p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="text-center pb-2">
            <h2 className="text-xl font-bold font-display text-slate-950">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-600 uppercase font-semibold">Enter Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-600 uppercase font-semibold">Enter Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error messaging */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => onAuthSuccess(null)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm py-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] mt-4"
          >
            <Cpu className="h-4 w-4 shrink-0" />
            Enter as Guest mode
          </button>

          {/* OR divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
              <span className="bg-white px-3 text-slate-400 font-sans">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.04 3.1v2.6h3.3c1.93-1.78 3.04-4.4 3.04-7.4 0-.34-.12-.68-.33-.99z" fill="#4285F4" />
              <path d="M12 20.6c2.6 0 4.78-.86 6.38-2.3l-3.3-2.6c-.91.61-2.08.98-3.08.98-2.37 0-4.38-1.6-5.1-3.75H3.45v2.7C5.04 18.78 8.28 20.6 12 20.6z" fill="#34A853" />
              <path d="M6.9 12.93c-.18-.54-.28-1.11-.28-1.73s.1-1.19.28-1.73V6.77H3.45C2.83 8.01 2.48 9.41 2.48 10.9s.35 2.89.97 4.13L6.9 12.93z" fill="#FBBC05" />
              <path d="M12 5.65c1.41 0 2.68.49 3.68 1.44l2.76-2.76C16.78 2.72 14.6 1.8 12 1.8c-3.72 0-6.96 1.82-8.55 4.97l3.45 2.7C7.62 7.25 9.63 5.65 12 5.65z" fill="#EA4335" />
            </svg>
            Google Account
          </button>

          {/* Toggle Button Option */}
          <div className="text-center text-xs text-slate-500 font-sans mt-4 pt-2 border-t border-slate-100">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer underline decoration-indigo-500/30 hover:decoration-indigo-500 transition-all"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer underline decoration-indigo-500/30 hover:decoration-indigo-500 transition-all"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 font-mono mt-6 tracking-wide uppercase">
          SECURE QUANTUM LINK • END-TO-END CIPHER
        </p>
      </motion.div>
    </div>
  );
}
