"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getUnlocked, setUnlocked } from "@/lib/storage";

const SECRET_NAME = "Madeline";

export function LoginGate() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [unlockedState, setUnlockedState] = useState(false);
  const [phase, setPhase] = useState<"splash" | "gate" | "redirecting">("splash");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (getUnlocked()) {
        setPhase("redirecting");
        router.replace("/home");
      } else {
        setPhase("gate");
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [router]);

  const handleSubmit = () => {
    if (input.trim().toLowerCase() === SECRET_NAME.toLowerCase()) {
      setUnlocked();
      setUnlockedState(true);
      setTimeout(() => router.push("/home"), 800);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {phase === "splash" ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-2xl text-zinc-800"
            >
              ♡
            </motion.p>
          </motion.div>
        ) : phase === "gate" ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-sm text-center"
          >
            <motion.p
              className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              a little something for
            </motion.p>

            <motion.h1
              className="font-serif text-5xl text-zinc-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            >
              {SECRET_NAME}
            </motion.h1>

            <motion.div
              className="mx-auto mt-4 h-px w-16 bg-teal-500/50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />

            <AnimatePresence mode="wait">
              {!unlockedState ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: 1.0 }}
                  className="mt-10"
                >
                  <p className="mb-4 text-sm text-zinc-400">
                    type your name to unlock
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                      }}
                      placeholder="..."
                      className={`w-full rounded-xl border bg-zinc-900/50 px-4 py-3 text-center text-lg text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-300 ${
                        error
                          ? "border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]"
                          : "border-zinc-800 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(13,148,136,0.1)]"
                      }`}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-red-400/80"
                    >
                      not quite — try again
                    </motion.p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-10"
                >
                  <div className="flex items-center justify-center gap-2 text-teal-400">
                    <motion.span
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-2xl"
                    >
                      ✦
                    </motion.span>
                    <span className="text-sm tracking-widest uppercase">
                      unlocked
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
