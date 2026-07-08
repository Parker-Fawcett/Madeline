"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supportsWebGL } from "@/lib/webgl";
import { getVisited, isRevealUnlocked } from "@/lib/storage";
import { FlatHome } from "@/components/fallback/FlatHome";

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
    </div>
  );
}
