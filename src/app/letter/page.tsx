"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { addVisited } from "@/lib/storage";

const paragraphs = [
  "[The first paragraph of the letter. Start with something simple — an address to her by name. A quiet opening that lets her know this is the real part, no jokes, no deflection.]",
  "[The second paragraph. Say one of the things you don't say often enough. Something true. Not clever, not poetic — just honest. Let it sit in the whitespace around it.]",
  "[The third paragraph. Another layer. A memory that didn't fit in the other sections because it matters differently. Something that changed how you see things.]",
  "[The fourth paragraph. Why her. Not a list of reasons — just the shape of it. The thing that makes her different from everyone else.]",
  "[Close it. Bring it back to now. No big declaration — just a quiet landing. Let her feel the weight of the page without having to hold it.]",
];

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export default function LetterPage() {
  useEffect(() => {
    addVisited("letter");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-2 pt-4 pb-20"
    >
      <p className="mb-1 text-xs uppercase tracking-[0.25em] text-zinc-400">
        a letter
      </p>
      <h1 className="font-serif text-3xl text-zinc-100">
        No Jokes, Just This
      </h1>
      <div className="mt-2 h-px w-12 bg-teal-500/40" />

      <div className="mt-10 space-y-8">
        {paragraphs.map((text, i) => (
          <motion.p
            key={i}
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="text-sm leading-[1.9] text-zinc-400"
          >
            {text}
          </motion.p>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-12 text-xs italic text-zinc-500"
      >
        (fill in the real words later)
      </motion.p>
    </motion.div>
  );
}
