"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { addVisited } from "@/lib/storage";

const paragraphs = [
  "[The first paragraph of the canyon drive story goes here. This is where you set the scene — the drive, the weather, the feeling of that day.]",
  "[The second paragraph continues the story. What happened on the drive? What did you talk about? What made it clear this was different?]",
  "[The third paragraph — maybe a specific moment from that drive that stands out. A song on the radio, a look, a laugh. Something small that you still remember.]",
  "[The fourth paragraph brings it back to now. How that drive led to everything else. A nod to what came after.]",
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function StoryPage() {
  useEffect(() => {
    addVisited("story");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-2 pt-4 pb-16"
    >
      <p className="mb-1 text-xs uppercase tracking-[0.25em] text-zinc-400">
        how we started
      </p>
      <h1 className="font-serif text-3xl text-zinc-100">The Canyon Drive</h1>
      <div className="mt-2 h-px w-12 bg-teal-500/40" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-8 space-y-6"
      >
        {paragraphs.map((text, i) => (
          <motion.p
            key={i}
            variants={item}
            className="text-sm leading-[1.8] text-zinc-400"
          >
            {text}
          </motion.p>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 text-xs italic text-zinc-500"
      >
        (fill in the real story later)
      </motion.p>
    </motion.div>
  );
}
