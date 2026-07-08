"use client";

import { useMemo, useState } from "react";
import { Particles } from "./Particles";
import { WorldObject } from "./WorldObject";
import { PlayerRig, type CameraOrbit } from "./PlayerRig";
import type { JoystickVector } from "./Joystick";

const COLLISION_RADIUS = 0.9;
const PROXIMITY_RADIUS = 2.2;
const PROXIMITY_TARGET_ID = "story";

interface MarkerDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  position: [number, number, number];
  modelPath?: string;
  modelScale?: number;
  modelTint?: string;
  labelOffset?: number;
}

// All models scaled so their largest bounding-box dimension matches the
// giraffe's (~1.19 units), and positioned so each model's bottom rests on
// the ground plane (y = -0.1). labelOffset is computed per marker so the
// label always lands at world y = -0.4 regardless of the model's height.
const MARKERS: MarkerDef[] = [
  { id: "story", label: "Our Story", icon: "", color: "#6b8f87", position: [-3.5, -0.1, -3], modelPath: "/models/car.glb", modelScale: 0.064, labelOffset: -0.3 },
  { id: "memories", label: "Memories", icon: "", color: "#8a7592", position: [3.5, 0.311, -3], modelPath: "/models/dumpling-compressed.glb", modelScale: 0.597, modelTint: "#8a7592", labelOffset: -0.711 },
  { id: "quote", label: "Your Words", icon: "", color: "#b3766b", position: [-4, -0.1, 3], modelPath: "/models/giraffe.glb", modelScale: 0.004, modelTint: "#b3766b", labelOffset: -0.3 },
  { id: "letter", label: "A Letter", icon: "", color: "#6b8f87", position: [0, 0.27, 5.5], modelPath: "/models/letter.glb", modelScale: 0.864, modelTint: "#d98c4a", labelOffset: -0.67 },
  { id: "playlist", label: "Playlist", icon: "♪", color: "#8a7592", position: [4, -0.099, 3], modelPath: "/models/cat.glb", modelScale: 1.545, modelTint: "#c17a4a", labelOffset: -0.301 },
  { id: "reveal", label: "One More Thing", icon: "★", color: "#b3766b", position: [0, -0.1, -6], modelPath: "/models/monster-compressed.glb", modelScale: 1.224, modelTint: "#b3766b", labelOffset: -0.3 },
];

interface SceneProps {
  onSelect: (id: string) => void;
  visited: string[];
  revealUnlocked: boolean;
  joystickVectorRef: React.MutableRefObject<JoystickVector>;
  cameraOrbitRef: React.MutableRefObject<CameraOrbit>;
}

export function Scene({
  onSelect,
  visited,
  revealUnlocked,
  joystickVectorRef,
  cameraOrbitRef,
}: SceneProps) {
  const markers = useMemo(() => MARKERS, []);
  const [inRangeId, setInRangeId] = useState<string | null>(null);

  const collisionTargets = useMemo(
    () =>
      markers
        .filter((m) => !(m.id === "reveal" && !revealUnlocked))
        .map((m) => ({
          id: m.id,
          position: m.position,
          radius: COLLISION_RADIUS,
        })),
    [markers, revealUnlocked]
  );

  const handleProximityChange = (id: string, inRange: boolean) => {
    setInRangeId(inRange ? id : null);
  };

  return (
    <>
      <color attach="background" args={["#f5e0c3"]} />

      <ambientLight intensity={0.4} />
      <hemisphereLight
        args={["#fce8d0", "#6b8f87", 0.5]}
        position={[0, 10, 0]}
      />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.3}
        color="#fcd34d"
      />

      <Particles count={500} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial
          color="#6b8f87"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* ground accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[5.5, 6, 64]} />
        <meshBasicMaterial
          color="#d4a76a"
          transparent
          opacity={0.06}
          side={2}
        />
      </mesh>

      {markers.map((m) => (
        <WorldObject
          key={m.id}
          position={m.position}
          color={m.color}
          label={m.label}
          icon={m.icon}
          modelPath={m.modelPath}
          modelScale={m.modelScale}
          modelTint={m.modelTint}
          labelOffset={m.labelOffset}
          onClick={() => onSelect(m.id)}
          hidden={m.id === "reveal" && !revealUnlocked}
          special={m.id === "reveal"}
          interactive={m.id === PROXIMITY_TARGET_ID ? inRangeId === m.id : true}
          inRange={m.id === PROXIMITY_TARGET_ID ? inRangeId === m.id : false}
        />
      ))}

      <PlayerRig
        joystickVectorRef={joystickVectorRef}
        cameraOrbitRef={cameraOrbitRef}
        collisionTargets={collisionTargets}
        proximityTargetId={PROXIMITY_TARGET_ID}
        proximityRadius={PROXIMITY_RADIUS}
        onProximityChange={handleProximityChange}
      />
    </>
  );
}

export { MARKERS };
export type { MarkerDef };
