"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats, PerspectiveCamera } from "@react-three/drei";
import { Scene } from "./Scene";
import { ContentOverlay } from "./ContentOverlay";
import { Joystick, type JoystickVector } from "./Joystick";
import { PITCH_MIN, PITCH_MAX, type CameraOrbit } from "./PlayerRig";
import { RevealAnnouncement } from "./RevealAnnouncement";

const YAW_SENSITIVITY = 0.006;
const PITCH_SENSITIVITY = 0.005;
const BASE_FOV = 50;
// Wide/short landscape phones (e.g. ~812x375 to 926x428, aspect ~2.16)
// crop too much of the scene vertically at the base FOV — widen it so
// world objects and the ground stay in frame.
const WIDE_LANDSCAPE_FOV = 62;
const WIDE_LANDSCAPE_ASPECT = 1.6;

function useResponsiveFov() {
  const [fov, setFov] = useState(BASE_FOV);

  useEffect(() => {
    const update = () => {
      const aspect = window.innerWidth / window.innerHeight;
      setFov(aspect > WIDE_LANDSCAPE_ASPECT ? WIDE_LANDSCAPE_FOV : BASE_FOV);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return fov;
}

interface Scene3DProps {
  visited: string[];
  revealUnlocked: boolean;
  onVisitedChange: () => void;
}

export default function Scene3D({
  visited,
  revealUnlocked,
  onVisitedChange,
}: Scene3DProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const joystickVectorRef = useRef<JoystickVector>({ x: 0, y: 0 });
  const cameraOrbitRef = useRef<CameraOrbit>({ yaw: 0, pitch: 0 });
  const dragState = useRef<{
    pointerId: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  const fov = useResponsiveFov();
  const prevRevealUnlocked = useRef(revealUnlocked);
  const [showRevealAnnouncement, setShowRevealAnnouncement] = useState(false);

  useEffect(() => {
    if (revealUnlocked && !prevRevealUnlocked.current) {
      setShowRevealAnnouncement(true);
    }
    prevRevealUnlocked.current = revealUnlocked;
  }, [revealUnlocked]);

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  const handleClose = () => {
    setSelected(null);
    onVisitedChange();
  };

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current) return;
    dragState.current = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    cameraOrbitRef.current.yaw -= dx * YAW_SENSITIVITY;
    cameraOrbitRef.current.pitch = Math.min(
      PITCH_MAX,
      Math.max(PITCH_MIN, cameraOrbitRef.current.pitch + dy * PITCH_SENSITIVITY)
    );
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === e.pointerId) {
      dragState.current = null;
    }
  };

  return (
    <>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        style={{ touchAction: "none" }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={fov} />
        {process.env.NODE_ENV === "development" && <Stats />}
        <Suspense fallback={null}>
          <Scene
            onSelect={handleSelect}
            visited={visited}
            revealUnlocked={revealUnlocked}
            joystickVectorRef={joystickVectorRef}
            cameraOrbitRef={cameraOrbitRef}
          />
        </Suspense>
      </Canvas>

      <Joystick vectorRef={joystickVectorRef} />
      <ContentOverlay sectionId={selected} onClose={handleClose} />
      <RevealAnnouncement
        show={showRevealAnnouncement}
        onDismiss={() => setShowRevealAnnouncement(false)}
      />
    </>
  );
}
