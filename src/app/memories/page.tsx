"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addVisited } from "@/lib/storage";

interface Memory {
  emoji: string;
  label: string;
  hint: string;
}

const memories: Memory[] = [
  { emoji: "👾", label: "Fugglers", hint: "[Fuggler memory placeholder]" },
  { emoji: "🌮", label: "Taco Bell", hint: "[Taco Bell memory placeholder]" },
  { emoji: "🧸", label: "Build-A-Bear", hint: "[Build-A-Bear memory placeholder]" },
  { emoji: "🦒", label: "Giraffe Cookie", hint: "[Giraffe cookie stuffed animal placeholder]" },
  { emoji: "🐕", label: "Parker", hint: "[Parker memory placeholder]" },
  { emoji: "🐈", label: "Pinto", hint: "[Pinto memory placeholder]" },
  { emoji: "👢", label: "The Boot", hint: "[the boot joke placeholder]" },
];

export default function MemoriesPage() {
  const [flipped, setFlipped] = useState<number | null>(null);

  useEffect(() => {
    addVisited("memories");
  }, []);

  const handleTap = (i: number) => {
    setFlipped((prev) => (prev === i ? null : i));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-2 pt-4 pb-4"
    >
      <p className="mb-1 text-xs uppercase tracking-[0.25em] text-zinc-400">
        memories
      </p>
      <h1 className="font-serif text-3xl text-zinc-100">
        Inside Jokes & Favorites
      </h1>
      <div className="mt-2 h-px w-12 bg-purple-500/40" />
      <p className="mt-4 text-sm text-zinc-400">tap each one — if you dare</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {memories.map((mem, i) => {
          const isFlipped = flipped === i;
          return (
            <button
              key={mem.label}
              onClick={() => handleTap(i)}
              className="aspect-square w-full cursor-pointer [perspective:600px]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="relative h-full w-full [transform-style:preserve-3d]"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-center [backface-visibility:hidden]">
                  <span className="text-3xl">{mem.emoji}</span>
                  <span className="mt-2 text-xs text-zinc-400">{mem.label}</span>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-purple-500/30 bg-purple-950/40 p-3 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-xs leading-relaxed text-purple-200">
                    {mem.hint}
                  </p>
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
