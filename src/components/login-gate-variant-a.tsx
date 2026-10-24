"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getUnlocked, setUnlocked } from "@/lib/storage";
import { SECRET_NAME, isCorrectName } from "@/lib/password";

const SPLASH_MS = 600;

const grainSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)"/>
  </svg>`
);

export function LoginGateA() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [unlockedState, setUnlockedState] = useState(false);
  const [phase, setPhase] = useState<"splash" | "gate" | "redirecting">("splash");

  useEffect(() => {
    if (getUnlocked()) {
      setPhase("redirecting");
      router.replace("/home");
      return;
    }
    const timer = setTimeout(() => setPhase("gate"), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [router]);

  const handleSubmit = () => {
    if (isCorrectName(input)) {
      setUnlocked();
      setUnlockedState(true);
      setTimeout(() => router.push("/home"), 800);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f5f0e8] px-6 text-[#3d3832]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${grainSvg}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

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
              className="font-serif text-2xl text-[#6b8b80]"
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
              className="mb-3 text-sm uppercase tracking-[0.3em] text-[#8c847a]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              a little something for
            </motion.p>

            <motion.h1
              className="font-serif text-5xl text-[#3d3832]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            >
              {SECRET_NAME}
            </motion.h1>

            <motion.div
              className="mx-auto mt-4 h-px w-16 bg-[#6b8b80]/50"
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
                  transition={{ delay: 0.4 }}
                  className="mt-10"
                >
                  <p className="mb-5 text-sm text-[#8c847a]">
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
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      spellCheck={false}
                      enterKeyHint="go"
                      className={`w-full rounded-xl border bg-[#fcfaf6] px-4 py-3 text-center text-lg text-[#3d3832] placeholder-[#a89e8f] outline-none transition-all duration-300 ${
                        error
                          ? "border-[#c4665c] shadow-[0_2px_12px_rgba(196,102,92,0.12)]"
                          : "border-[#cbc0b2] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:border-[#6b8b80] focus:shadow-[0_2px_12px_rgba(107,139,128,0.12)]"
                      }`}
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-4 rounded-full px-6 py-2 text-sm tracking-widest text-[#6b8b80] uppercase transition-colors active:bg-[#6b8b80]/10"
                  >
                    open ♡
                  </button>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-[#c4665c]/80"
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
                  <div className="flex items-center justify-center gap-2 text-[#6b8b80]">
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
