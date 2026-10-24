"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { createFrameLimiter } from "@/lib/frameLimiter";
import { createAdaptiveFps } from "@/lib/adaptiveFps";

// Drives a frameloop="never" Canvas at a steady rate. A fixed rate keeps
// the phone cool and avoids the stutter of a GPU that can't quite hold
// its target. With `lowFps`, it starts at `fps` and settles on `lowFps`
// only if the device can't keep up.
export function FrameRateCap({ fps, lowFps }: { fps: number; lowFps?: number }) {
  const advance = useThree((s) => s.advance);

  useEffect(() => {
    const adaptive = lowFps ? createAdaptiveFps(fps, lowFps) : null;
    let rate = fps;
    let limiter = createFrameLimiter(rate);
    let lastRendered: number | null = null;
    let id = requestAnimationFrame(function loop(now) {
      id = requestAnimationFrame(loop);
      if (!limiter.shouldRender(now)) return;
      if (adaptive && lastRendered !== null) {
        adaptive.record(now - lastRendered);
        if (adaptive.fps() !== rate) {
          rate = adaptive.fps();
          limiter = createFrameLimiter(rate);
        }
      }
      lastRendered = now;
      advance(now);
    });
    return () => cancelAnimationFrame(id);
  }, [advance, fps, lowFps]);

  return null;
}
