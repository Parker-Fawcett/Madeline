"use client";

import dynamic from "next/dynamic";

const RCWilleyExperience = dynamic(
  () => import("@/components/rcwilley/RCWilleyExperience"),
  { ssr: false }
);

export default function RCWilleyPage() {
  return <RCWilleyExperience />;
}
