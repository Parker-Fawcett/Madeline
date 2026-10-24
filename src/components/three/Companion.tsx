"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { flankPoint, followStep, type FollowConfig } from "@/lib/follow";
import type { CameraOrbit, PlayerState } from "./PlayerRig";
import { useWalkAnimation, type WalkStyle } from "./useWalkAnimation";

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

  useFrame((_, delta) => {
    flankPoint(leaderRef.current, cameraOrbitRef.current.yaw, side, target.current);
    stateRef.current.walking = followStep(stateRef.current, target.current, delta, follow);
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
