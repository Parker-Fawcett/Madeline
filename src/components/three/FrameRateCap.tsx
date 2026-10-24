"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { createFrameLimiter } from "@/lib/frameLimiter";

// Drives a frameloop="never" Canvas at a steady rate. A fixed lower rate
// keeps the phone cool and avoids the stutter of a GPU that can't quite
// hold 60.
export function FrameRateCap({ fps }: { fps: number }) {
  const advance = useThree((s) => s.advance);

  useEffect(() => {
    const limiter = createFrameLimiter(fps);
    let id = requestAnimationFrame(function loop(now) {
      id = requestAnimationFrame(loop);
      if (limiter.shouldRender(now)) advance(now);
    });
    return () => cancelAnimationFrame(id);
  }, [advance, fps]);

  return null;
}
