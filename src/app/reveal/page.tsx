"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { isRevealUnlocked } from "@/lib/storage";

const lines = [
  "[final line 1 — the first thing you want her to read]",
  "[final line 2 — lands a moment later]",
  "[final line 3 — the last thing]",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.8 },
  },
};

const lineVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

export default function RevealPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isRevealUnlocked()) {
      setUnlocked(true);
    } else {
      router.replace("/home");
    }
    setChecked(true);
  }, [router]);

  if (!checked || !unlocked) return null;

  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <button
              onClick={() => setRevealed(true)}
              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-3xl text-zinc-400 transition-colors duration-300 active:bg-zinc-800"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              ♡
            </button>
            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-zinc-500">
              [tap to open]
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="message"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-sm text-center"
          >
            {lines.map((line, i) => (
              <motion.p
                key={i}
                variants={lineVariants}
                className="font-serif text-xl leading-[1.7] text-zinc-200 first:text-2xl"
              >
                {line}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
