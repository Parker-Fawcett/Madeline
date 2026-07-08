"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getVisited, isRevealUnlocked, REQUIRED_ROUTES } from "@/lib/storage";
import { ContentOverlay } from "@/components/three/ContentOverlay";
import { RevealAnnouncement } from "@/components/three/RevealAnnouncement";

const sections = [
  {
    id: "story",
    title: "How We Started",
    subtitle: "The canyon drive",
    color: "border-teal-500/40",
    bg: "bg-teal-500/[0.03]",
    icon: "♡",
  },
  {
    id: "memories",
    title: "Memories",
    subtitle: "Inside jokes & favorites",
    color: "border-purple-500/40",
    bg: "bg-purple-500/[0.03]",
    icon: "♢",
  },
  {
    id: "quote",
    title: "Something You Say",
    subtitle: "Your words",
    color: "border-red-500/40",
    bg: "bg-red-500/[0.03]",
    icon: "♤",
  },
  {
    id: "letter",
    title: "A Letter",
    subtitle: "No jokes, just this",
    color: "border-teal-500/40",
    bg: "bg-teal-500/[0.03]",
    icon: "♧",
  },
  {
    id: "playlist",
    title: "Our Playlist",
    subtitle: "Songs that remind me of you",
    color: "border-purple-500/40",
    bg: "bg-purple-500/[0.03]",
    icon: "♪",
  },
  {
    id: "reveal",
    title: "One More Thing",
    subtitle: "Save this for last",
    color: "border-red-500/40",
    bg: "bg-red-500/[0.03]",
    icon: "★",
  },
];

export function FlatHome() {
  const [selected, setSelected] = useState<string | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [revealUnlocked, setRevealUnlocked] = useState(false);
  const [showRevealAnnouncement, setShowRevealAnnouncement] = useState(false);
  const prevRevealUnlocked = useRef(false);

  useEffect(() => {
    setVisited(getVisited());
    const unlocked = isRevealUnlocked();
    setRevealUnlocked(unlocked);
    prevRevealUnlocked.current = unlocked;
  }, []);

  const handleSelect = (id: string) => {
    if (id === "reveal" && !revealUnlocked) return;
    setSelected(id);
  };

  const handleClose = () => {
    setSelected(null);
    setTimeout(() => {
      setVisited(getVisited());
      const unlocked = isRevealUnlocked();
      if (unlocked && !prevRevealUnlocked.current) {
        setShowRevealAnnouncement(true);
      }
      prevRevealUnlocked.current = unlocked;
      setRevealUnlocked(unlocked);
    }, 100);
  };

  const visitedCount = visited.filter((v) =>
    REQUIRED_ROUTES.includes(v as any)
  ).length;
  const totalRequired = REQUIRED_ROUTES.length;

  return (
    <>
      <div className="px-2 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-1 text-xs uppercase tracking-[0.25em] text-zinc-400">
            for you
          </p>
          <h1 className="font-serif text-4xl text-zinc-100">hi madeline</h1>
          <div className="mt-1 h-px w-12 bg-teal-500/40" />
        </motion.div>

        <div className="mt-8 grid gap-3">
          {sections.map((section, i) => {
            const isVisited = visited.includes(section.id);
            const locked = section.id === "reveal" && !revealUnlocked;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <button
                  onClick={() => handleSelect(section.id)}
                  disabled={locked}
                  className={`group flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                    locked
                      ? "border-zinc-800/50 bg-zinc-900/20 opacity-40 cursor-not-allowed"
                      : `${section.color} ${section.bg} hover:border-teal-500/60 hover:bg-teal-500/[0.06] cursor-pointer`
                  }`}
                >
                  <span
                    className={`text-xl transition-colors ${
                      locked
                        ? "text-zinc-700"
                        : "text-zinc-500 group-hover:text-teal-400"
                    }`}
                  >
                    {section.icon}
                  </span>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        locked
                          ? "text-zinc-700"
                          : "text-zinc-200 group-hover:text-teal-300"
                      }`}
                    >
                      {section.title}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {section.subtitle}
                    </p>
                  </div>
                  {isVisited && (
                    <span className="text-[10px] text-teal-500/60">
                      visited
                    </span>
                  )}
                  {locked && (
                    <span className="text-[10px] text-zinc-700">
                      locked
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-1.5">
          {REQUIRED_ROUTES.map((route) => {
            const done = visited.includes(route);
            return (
              <div
                key={route}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                  done ? "bg-teal-500" : "bg-zinc-800"
                }`}
              />
            );
          })}
          <span className="ml-2 text-[10px] text-zinc-500">
            {visitedCount}/{totalRequired}
          </span>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          {visitedCount < totalRequired
            ? "explore everything to unlock the last page"
            : "✦ everything unlocked ✦"}
        </p>
      </div>

      <ContentOverlay sectionId={selected} onClose={handleClose} />
      <RevealAnnouncement
        show={showRevealAnnouncement}
        onDismiss={() => setShowRevealAnnouncement(false)}
      />
    </>
  );
}
