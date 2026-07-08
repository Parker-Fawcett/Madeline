"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/home", label: "Home", icon: "⊞" },
  { href: "/story", label: "Story", icon: "♡" },
  { href: "/memories", label: "Memories", icon: "♢" },
  { href: "/quote", label: "Quote", icon: "♤" },
  { href: "/letter", label: "Letter", icon: "♧" },
  { href: "/playlist", label: "Playlist", icon: "♪" },
  { href: "/reveal", label: "Reveal", icon: "★" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex flex-col items-center gap-0.5 px-1 py-2.5 min-w-0 flex-1"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-teal-500/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative text-lg ${
                  active ? "text-teal-400" : "text-zinc-500"
                }`}
              >
                {link.icon}
              </span>
              <span
                className={`relative text-[10px] leading-tight ${
                  active ? "text-teal-400" : "text-zinc-400"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
