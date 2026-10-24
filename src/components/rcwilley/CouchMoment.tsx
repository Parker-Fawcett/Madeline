"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sections } from "@/components/three/ContentOverlay";

// Placeholder until the RC Willey note is written: the letter, then the
// last three lines.
const PAGES = [sections.letter.body, sections.reveal.body].map((body) =>
  body.filter((b): b is string => typeof b === "string")
);

export function CouchMoment({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [page, setPage] = useState(0);
  const last = page === PAGES.length - 1;

  const next = () => {
    if (last) {
      setPage(0);
      onClose();
    } else {
      setPage(page + 1);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[70vh] flex-col bg-gradient-to-t from-[#1a1712]/95 via-[#1a1712]/85 to-transparent px-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-16"
          onClick={next}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-md space-y-4 overflow-y-auto"
            >
              {PAGES[page].map((line, i) => (
                <p key={i} className="font-serif text-lg leading-relaxed text-[#f5f0e8]">
                  {line}
                </p>
              ))}
            </motion.div>
          </AnimatePresence>
          <p className="mt-6 text-center text-xs uppercase tracking-[0.25em] text-[#d8cdb8]/70">
            {last ? "tap to stay a while" : "tap to keep reading"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
