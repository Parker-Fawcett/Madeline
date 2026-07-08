"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AUTO_DISMISS_MS = 4500;

export function RevealAnnouncement({
  show,
  onDismiss,
}: {
  show: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="mx-6 flex flex-col items-center gap-3 rounded-2xl border border-[#e8c88a]/40 bg-[#1a1712] px-8 py-8 text-center shadow-[0_0_50px_rgba(232,200,138,0.3)]"
          >
            <span className="text-3xl text-[#e8c88a]">★</span>
            <p className="font-serif text-xl text-[#f5f0e8]">
              One more thing just appeared
            </p>
            <p className="text-sm text-[#d8cdb8]">
              go find it — it was worth the wait
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
