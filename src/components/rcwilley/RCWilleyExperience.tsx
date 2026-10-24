"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { FrameRateCap } from "@/components/three/FrameRateCap";
import { LoadingScreen } from "@/components/three/LoadingScreen";
import type { CameraOrbit } from "@/components/three/PlayerRig";
import { StoreWorld, type TouchStart } from "./StoreWorld";
import { CouchMoment } from "./CouchMoment";

const TARGET_FPS = 30;
const YAW_SENSITIVITY = 0.006;
const DRAG_THRESHOLD = 10; // px before a touch counts as looking around

function OnMount({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return null;
}

export default function RCWilleyExperience() {
  const cameraOrbitRef = useRef<CameraOrbit>({ yaw: 0, pitch: 0 });
  const touchStartRef = useRef<TouchStart | null>(null);
  const lastX = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [inMoment, setInMoment] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    lastX.current = e.clientX;
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    if (!start || inMoment) return;
    if (Math.abs(e.clientX - start.x) > DRAG_THRESHOLD) {
      cameraOrbitRef.current.yaw -= (e.clientX - lastX.current) * YAW_SENSITIVITY;
    }
    lastX.current = e.clientX;
  };

  return (
    <div
      className="fixed inset-0"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={() => setTimeout(() => (touchStartRef.current = null), 0)}
    >
      <Canvas
        key={canvasKey}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => setCanvasKey((k) => k + 1), { once: true });
        }}
        frameloop="never"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ touchAction: "none" }}
      >
        <FrameRateCap fps={TARGET_FPS} />
        <PerspectiveCamera makeDefault position={[0, 2.6, -5]} fov={55} />
        <Suspense fallback={null}>
          <StoreWorld
            touchStartRef={touchStartRef}
            cameraOrbitRef={cameraOrbitRef}
            inMoment={inMoment}
            onReachCouch={() => setInMoment(true)}
          />
          <OnMount onMount={() => setLoaded(true)} />
        </Suspense>
      </Canvas>

      <LoadingScreen show={!loaded} />
      {loaded && !inMoment && (
        <p className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] text-center text-xs uppercase tracking-[0.25em] text-[#3d3832]/70">
          tap to walk · tap the grey couch
        </p>
      )}
      <CouchMoment show={inMoment} onClose={() => setInMoment(false)} />
    </div>
  );
}
