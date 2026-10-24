"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";

export function LoadingScreen({ show }: { show: boolean }) {
  const progress = useProgress((s) => s.progress);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-[#f5e0c3] text-[#6b8f87]"
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="font-serif text-3xl"
          >
            ♡
          </motion.span>
          <div className="h-px w-32 overflow-hidden bg-[#6b8f87]/20">
            <div
              className="h-full bg-[#6b8f87] transition-[width] duration-300"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
