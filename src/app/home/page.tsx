"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supportsWebGL } from "@/lib/webgl";
import { getVisited, isRevealUnlocked } from "@/lib/storage";
import { requestLandscapeLock } from "@/lib/orientationLock";
import { FlatHome } from "@/components/fallback/FlatHome";
import { RotateDeviceOverlay } from "@/components/three/RotateDeviceOverlay";

const Scene3D = dynamic(
  () => import("@/components/three/Scene3D"),
  { ssr: false }
);

export default function HomePage() {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [revealUnlocked, setRevealUnlocked] = useState(false);

  useEffect(() => {
    setWebglOk(supportsWebGL());
    setVisited(getVisited());
    setRevealUnlocked(isRevealUnlocked());

    // Best-effort landscape lock — works in some standalone PWA / Android
    // contexts without a gesture. Most in-app browsers (Snapchat, etc.)
    // and iOS Safari outside a PWA silently reject this; the CSS
    // rotate-prompt overlay is the real fallback for those.
    requestLandscapeLock();

    // Fullscreen/orientation APIs generally require a user gesture, so
    // retry once on the first tap/touch as well.
    const retryOnGesture = () => requestLandscapeLock();
    window.addEventListener("pointerdown", retryOnGesture, { once: true });
    return () => window.removeEventListener("pointerdown", retryOnGesture);
  }, []);

  const handleVisitedChange = () => {
    setTimeout(() => {
      setVisited(getVisited());
      setRevealUnlocked(isRevealUnlocked());
    }, 100);
  };

  if (webglOk === false) {
    return <FlatHome />;
  }

  if (webglOk === null) {
    return null;
  }

  return (
    <div className="fixed inset-0">
      <Scene3D
        visited={visited}
        revealUnlocked={revealUnlocked}
        onVisitedChange={handleVisitedChange}
      />
      <RotateDeviceOverlay />
    </div>
  );
}
