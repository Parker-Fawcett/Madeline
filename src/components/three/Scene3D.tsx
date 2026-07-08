"use client";

import { Suspense, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Scene } from "./Scene";
import { ContentOverlay } from "./ContentOverlay";
import { Joystick, type JoystickVector } from "./Joystick";
import { PITCH_MIN, PITCH_MAX, type CameraOrbit } from "./PlayerRig";

const YAW_SENSITIVITY = 0.006;
const PITCH_SENSITIVITY = 0.005;

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
        camera={{ position: [0, 2, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        style={{ touchAction: "none" }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
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
    </>
  );
}
