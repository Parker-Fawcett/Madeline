"use client";

import { useMemo, useRef, useState } from "react";
import { Particles } from "./Particles";
import { WorldObject } from "./WorldObject";
import { PlayerRig, PLAYER_START, type CameraOrbit, type PlayerState } from "./PlayerRig";
import { Avatar } from "./Avatar";
import { Scenery, SKY_HORIZON, TREE_OBSTACLES } from "./Scenery";
import type { JoystickVector } from "./Joystick";
import { MARKERS } from "./markers";

const COLLISION_RADIUS = 0.9;
const PROXIMITY_RADIUS = 2.2;
const PROXIMITY_TARGET_ID = "story";

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
  const playerRef = useRef<PlayerState>({ ...PLAYER_START, walking: false });

  const collisionTargets = useMemo(
    () =>
      markers
        .filter((m) => !(m.id === "reveal" && !revealUnlocked))
        .map((m) => ({
          id: m.id,
          x: m.position[0],
          z: m.position[2],
          radius: COLLISION_RADIUS,
        }))
        .concat(TREE_OBSTACLES),
    [markers, revealUnlocked]
  );

  const handleProximityChange = (id: string, inRange: boolean) => {
    setInRangeId(inRange ? id : null);
  };

  return (
    <>
      <color attach="background" args={[SKY_HORIZON]} />
      <fog attach="fog" args={[SKY_HORIZON, 12, 30]} />
      <Scenery />

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

      {/* path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[5.5, 6, 64]} />
        <meshBasicMaterial
          color="#d4a76a"
          transparent
          opacity={0.35}
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
          onClick={() => onSelect(m.id)}
          hidden={m.id === "reveal" && !revealUnlocked}
          special={m.id === "reveal"}
          interactive={m.id === PROXIMITY_TARGET_ID ? inRangeId === m.id : true}
          inRange={m.id === PROXIMITY_TARGET_ID ? inRangeId === m.id : false}
        />
      ))}

      <PlayerRig
        playerRef={playerRef}
        joystickVectorRef={joystickVectorRef}
        cameraOrbitRef={cameraOrbitRef}
        collisionTargets={collisionTargets}
        proximityTargetId={PROXIMITY_TARGET_ID}
        proximityRadius={PROXIMITY_RADIUS}
        onProximityChange={handleProximityChange}
      />
      <Avatar playerRef={playerRef} />
    </>
  );
}

