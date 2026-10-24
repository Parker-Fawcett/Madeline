"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { flankPoint, type FollowConfig } from "@/lib/follow";
import { stepMotion, type Mover } from "@/lib/motion";
import type { CameraOrbit, PlayerState } from "./PlayerRig";
import { useWalkAnimation, type WalkStyle } from "./useWalkAnimation";

const PET_ACCEL = 5;
const PET_DECEL = 4;

function CompanionModel({ path }: { path: string }) {
  const { scene } = useGLTF(path, true, true);
  return <primitive object={scene} />;
}

// A pet that walks beside `leaderRef`, `side` units to her right on screen
// (left when negative), so it never stands between her and the camera.
export function Companion({
  modelPath,
  stateRef,
  leaderRef,
  cameraOrbitRef,
  side,
  follow,
  walk,
  modelScale = 1,
  facing = Math.PI,
}: {
  modelPath: string;
  stateRef: React.MutableRefObject<PlayerState>;
  leaderRef: React.MutableRefObject<PlayerState>;
  cameraOrbitRef: React.MutableRefObject<CameraOrbit>;
  side: number;
  follow: FollowConfig;
  walk: WalkStyle;
  modelScale?: number;
  facing?: number;
}) {
  const target = useRef({ x: 0, z: 0 });
  const mover = useRef<Mover>({ x: stateRef.current.x, z: stateRef.current.z, vx: 0, vz: 0 });

  useFrame((_, delta) => {
    flankPoint(leaderRef.current, cameraOrbitRef.current.yaw, side, target.current);
    const m = mover.current;
    if (Math.hypot(target.current.x - m.x, target.current.z - m.z) > follow.maxGap) {
      m.x = target.current.x;
      m.z = target.current.z;
      m.vx = m.vz = 0;
    }
    const s = stateRef.current;
    s.walking = stepMotion(m, target.current, delta, { maxSpeed: follow.speed, accel: PET_ACCEL, decel: PET_DECEL, arriveDistance: 0.05 });
    s.x = m.x;
    s.z = m.z;
  });
  const { rootRef, bodyRef } = useWalkAnimation(stateRef, walk);

  return (
    <group ref={rootRef} rotation={[0, facing, 0]}>
      <group ref={bodyRef} scale={modelScale}>
        <CompanionModel path={modelPath} />
      </group>
    </group>
  );
}
