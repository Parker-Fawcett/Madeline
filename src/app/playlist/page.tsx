"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { addVisited } from "@/lib/storage";

interface Track {
  title: string;
  artist: string;
}

interface Vibes {
  [key: string]: Track[];
}

const vibes: Vibes = {
  "White Girl Music": [
    { title: "Teenage Dream", artist: "Katy Perry" },
    { title: "Treat You Better", artist: "Shawn Mendes" },
    { title: "The One That Got Away", artist: "Katy Perry" },
    { title: "Heart Attack", artist: "Demi Lovato" },
    { title: "You Belong With Me", artist: "Taylor Swift" },
  ],
  "🤍": [
    { title: "Sodium", artist: "BONES" },
    { title: "Burgundy", artist: "$uicideboy$" },
    { title: "Antarctica", artist: "$uicideboy$" },
    { title: "Lone Wolf Hysteria", artist: "$uicideboy$" },
    { title: "Partin Ways", artist: "Polo G" },
  ],
  "In Another Life": [
    { title: "Forever", artist: "Lewis Capaldi" },
    { title: "Hold Me While You Wait", artist: "Lewis Capaldi" },
    { title: "you broke me first", artist: "Tate McRae" },
    { title: "I Found", artist: "Amber Run" },
    { title: "Control", artist: "Zoe Wees" },
  ],
};

const vibeColors: Record<string, string> = {
  "White Girl Music": "border-red-500/30 bg-red-500/[0.04]",
  "🤍": "border-teal-500/30 bg-teal-500/[0.04]",
  "In Another Life": "border-purple-500/30 bg-purple-500/[0.04]",
};

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const trackVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export default function PlaylistPage() {
  useEffect(() => {
    addVisited("playlist");
  }, []);

  const vibeEntries = Object.entries(vibes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-2 pt-4 pb-16"
    >
      <p className="mb-1 text-xs uppercase tracking-[0.25em] text-zinc-400">
        our playlist
      </p>
      <h1 className="font-serif text-3xl text-zinc-100">
        Songs That Remind Me of You
      </h1>
      <div className="mt-2 h-px w-12 bg-purple-500/40" />

      <div className="mt-8 space-y-8">
        {vibeEntries.map(([vibe, tracks], vi) => (
          <motion.div
            key={vibe}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * vi, duration: 0.4 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-medium text-zinc-300">{vibe}</h2>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1.5"
            >
              {tracks.map((track, ti) => (
                <motion.div
                  key={`${vibe}-${ti}`}
                  variants={trackVariants}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${vibeColors[vibe]} transition-colors duration-200`}
                >
                  <span className="w-5 text-right text-xs text-zinc-700">
                    {ti + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-200">
                      {track.title}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {track.artist}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
