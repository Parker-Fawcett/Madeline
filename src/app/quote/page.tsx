"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { addVisited } from "@/lib/storage";

export default function QuotePage() {
  useEffect(() => {
    addVisited("quote");
  }, []);

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-6">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6 text-xs uppercase tracking-[0.3em] text-zinc-400"
        >
          something you always say
        </motion.p>

        <motion.blockquote
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.0, ease: "easeOut" }}
          className="font-serif text-2xl leading-[1.6] text-zinc-100"
        >
          &ldquo;
          <span className="text-teal-200">
            [her quote goes here — the thing she always says]
          </span>
          &rdquo;
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-8 text-xs tracking-wider text-zinc-400"
        >
          — Madeline
        </motion.p>
      </div>
    </div>
  );
}
