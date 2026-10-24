"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { FrameRateCap } from "@/components/three/FrameRateCap";
import { LoadingScreen } from "@/components/three/LoadingScreen";
import type { CameraOrbit } from "@/components/three/PlayerRig";
import { StoreWorld } from "./StoreWorld";
import { CouchMoment } from "./CouchMoment";
import { idleInput, type TouchInput } from "./touchInput";

const TARGET_FPS = 60;
const FALLBACK_FPS = 30;
const LOOK_SENSITIVITY = 0.006;
const HOLD_MS = 250; // a finger kept down this long starts walking toward it
const HOLD_MOVE = 10; // px of finger movement that also starts a hold-walk

function OnMount({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return null;
}

function toNdc(e: { clientX: number; clientY: number }) {
  return { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 };
}

export default function RCWilleyExperience() {
  const cameraOrbitRef = useRef<CameraOrbit>({ yaw: 0, pitch: 0 });
  const input = useRef<TouchInput>(idleInput());
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [inMoment, setInMoment] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const clearHoldTimer = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  // One finger walks (tap to go somewhere, hold to walk toward the finger);
  // two fingers swiping sideways look around. A single finger can never
  // turn the camera, so the view doesn't change by accident.
  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const i = input.current;
    if (pointers.current.size === 1) {
      i.start = { x: e.clientX, y: e.clientY, t: performance.now() };
      i.usedGesture = false;
      const at = toNdc(e);
      clearHoldTimer();
      holdTimer.current = setTimeout(() => {
        if (pointers.current.size === 1 && !inMoment) {
          i.hold = at;
          i.usedGesture = true;
        }
      }, HOLD_MS);
    } else {
      clearHoldTimer();
      i.hold = null;
      i.usedGesture = true;
    }
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const i = input.current;
    if (pointers.current.size >= 2) {
      cameraOrbitRef.current.yaw -= ((e.clientX - prev.x) / pointers.current.size) * LOOK_SENSITIVITY;
      i.lastLook = performance.now();
    } else if (i.start && !inMoment) {
      if (i.hold || Math.hypot(e.clientX - i.start.x, e.clientY - i.start.y) > HOLD_MOVE) {
        clearHoldTimer();
        i.hold = toNdc(e);
        i.usedGesture = true;
      }
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const handleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    clearHoldTimer();
    input.current.hold = null;
    // the click (tap) event fires after pointerup; clear the touch once it has
    setTimeout(() => {
      if (pointers.current.size === 0) input.current.start = null;
    }, 0);
  };

  return (
    <div
      className="fixed inset-0"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
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
        <FrameRateCap fps={TARGET_FPS} lowFps={FALLBACK_FPS} />
        <PerspectiveCamera makeDefault position={[0, 2.6, -5]} fov={55} />
        <Suspense fallback={null}>
          <StoreWorld
            input={input}
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
          tap or hold to walk · two fingers to look · tap the grey couch
        </p>
      )}
      <CouchMoment show={inMoment} onClose={() => setInMoment(false)} />
    </div>
  );
}
