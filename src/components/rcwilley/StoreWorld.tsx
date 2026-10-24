"use client";

import { useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { walkTowards, isTap } from "@/lib/tapWalk";
import type { FollowConfig } from "@/lib/follow";
import type { CameraOrbit, PlayerState } from "@/components/three/PlayerRig";
import { Avatar } from "@/components/three/Avatar";
import { Companion } from "@/components/three/Companion";
import type { WalkStyle } from "@/components/three/useWalkAnimation";
import { AROUND_WALL, WALL_FRONT_Z, COUCH_CAMERA, COUCH_FACING, COUCH_HIT, COUCH_SPOT, MODEL_PATH, OBSTACLES, START, WALK } from "./layout";

// The characters are still the chibi Blender models (~0.87 m); scale them
// to roughly real height until the natural-proportion versions exist.
const MADELINE_SCALE = 1.8;
const PET_SCALE = 1.3;
const FLOOR_Y = 0;
const CAMERA_DISTANCE = 4.2;
const CAMERA_HEIGHT = 2.6;
const PET_FOLLOW: FollowConfig = { distance: 0.45, speed: 1.9, maxGap: 5 };
const PARKER_WALK: WalkStyle = { turnSpeed: 8, stepSpeed: 12, hopHeight: 0.04, sway: 0.05, groundY: FLOOR_Y };
const PINTO_WALK: WalkStyle = { turnSpeed: 9, stepSpeed: 14, hopHeight: 0.03, sway: 0.04, groundY: FLOOR_Y };

export interface TouchStart {
  x: number;
  y: number;
  t: number;
}

function Store({ onTap }: { onTap: (e: ThreeEvent<MouseEvent>) => void }) {
  const { scene } = useGLTF(MODEL_PATH, true, true);
  return <primitive object={scene} onClick={onTap} />;
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#fff1dc", "#6b5a4a", 1.1]} />
      <ambientLight intensity={0.35} />
      {/* daylight through the atrium skylight */}
      <directionalLight position={[2, 12, -6]} intensity={1.4} color="#fff6e8" />
      {/* warm display lighting over the living-room area */}
      <pointLight position={[-7, 3.6, 5]} intensity={18} distance={9} color="#ffe3c0" />
      <pointLight position={[4.5, 3.6, 5.5]} intensity={12} distance={9} color="#ffe3c0" />
      <pointLight position={[-1, 3.6, 11]} intensity={10} distance={8} color="#ffe3c0" />
    </>
  );
}

export function StoreWorld({
  touchStartRef,
  cameraOrbitRef,
  inMoment,
  onReachCouch,
}: {
  touchStartRef: React.MutableRefObject<TouchStart | null>;
  cameraOrbitRef: React.MutableRefObject<CameraOrbit>;
  inMoment: boolean;
  onReachCouch: () => void;
}) {
  const { camera } = useThree();
  const playerRef = useRef<PlayerState>({ x: START.x, z: START.z, walking: false });
  const parkerRef = useRef<PlayerState>({ x: START.x + 0.6, z: START.z - 0.4, walking: false });
  const pintoRef = useRef<PlayerState>({ x: START.x - 0.6, z: START.z - 0.4, walking: false });
  // a list of points to walk through; the couch route ends with a small
  // step toward the shelves so she settles facing them
  const route = useRef<{ x: number; z: number }[]>([]);
  const headingToCouch = useRef(false);
  const marker = useRef<THREE.Mesh>(null);
  const camPos = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const lookGoal = useRef(new THREE.Vector3());

  const tapped = (e: ThreeEvent<MouseEvent>) => {
    const start = touchStartRef.current;
    const end = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, t: performance.now() };
    return !inMoment && start !== null && isTap(start, end);
  };

  const walkTo = (e: ThreeEvent<MouseEvent>) => {
    if (!tapped(e)) return;
    headingToCouch.current = false;
    route.current = [{ x: e.point.x, z: e.point.z }];
  };

  const goToCouch = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!tapped(e)) return;
    headingToCouch.current = true;
    const fromAtriumSide = playerRef.current.z < WALL_FRONT_Z;
    route.current = [
      ...(fromAtriumSide ? [{ x: AROUND_WALL.x, z: AROUND_WALL.z }] : []),
      { x: COUCH_SPOT.x, z: COUCH_SPOT.z },
      { x: COUCH_SPOT.x + Math.sin(COUCH_FACING) * 0.2, z: COUCH_SPOT.z + Math.cos(COUCH_FACING) * 0.2 },
    ];
  };

  useFrame((_, delta) => {
    const p = playerRef.current;
    const next = route.current[0];
    p.walking = next ? walkTowards(p, next, delta, WALK, OBSTACLES) : false;
    if (next && !p.walking) {
      route.current.shift();
      if (route.current.length === 0 && headingToCouch.current) {
        headingToCouch.current = false;
        onReachCouch();
      }
    }

    if (marker.current) {
      marker.current.visible = !!next && !inMoment;
      if (next) marker.current.position.set(next.x, FLOOR_Y + 0.02, next.z);
    }

    const ease = 1 - Math.pow(0.02, delta);
    if (inMoment) {
      camPos.current.set(COUCH_CAMERA.position.x, COUCH_CAMERA.position.y, COUCH_CAMERA.position.z);
      lookGoal.current.set(COUCH_CAMERA.target.x, COUCH_CAMERA.target.y, COUCH_CAMERA.target.z);
    } else {
      const yaw = cameraOrbitRef.current.yaw;
      camPos.current.set(p.x - Math.sin(yaw) * CAMERA_DISTANCE, CAMERA_HEIGHT, p.z - Math.cos(yaw) * CAMERA_DISTANCE);
      lookGoal.current.set(p.x, 1.1, p.z);
    }
    lookAt.current.lerp(lookGoal.current, ease);
    camera.position.lerp(camPos.current, ease);
    camera.lookAt(lookAt.current);
  });

  return (
    <>
      <color attach="background" args={["#e9e2d6"]} />
      <Lights />
      <Store onTap={walkTo} />
      <mesh position={[COUCH_HIT.center.x, COUCH_HIT.center.y, COUCH_HIT.center.z]} onClick={goToCouch}>
        <boxGeometry args={[COUCH_HIT.size[0], COUCH_HIT.size[1], COUCH_HIT.size[2]]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.16, 0.22, 32]} />
        <meshBasicMaterial color="#6b8f87" transparent opacity={0.7} />
      </mesh>
      <Avatar playerRef={playerRef} modelScale={MADELINE_SCALE} groundY={FLOOR_Y} facing={0} />
      <Companion
        modelPath="/models/parker.glb"
        stateRef={parkerRef}
        leaderRef={playerRef}
        cameraOrbitRef={cameraOrbitRef}
        side={0.7}
        follow={PET_FOLLOW}
        walk={PARKER_WALK}
        modelScale={PET_SCALE}
        facing={0}
      />
      <Companion
        modelPath="/models/pinto.glb"
        stateRef={pintoRef}
        leaderRef={playerRef}
        cameraOrbitRef={cameraOrbitRef}
        side={-0.6}
        follow={PET_FOLLOW}
        walk={PINTO_WALK}
        modelScale={PET_SCALE}
        facing={0}
      />
    </>
  );
}
