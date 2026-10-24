"use client";

import { useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { isTap, resolveCollisions } from "@/lib/tapWalk";
import { stepMotion, type Mover } from "@/lib/motion";
import { findPath } from "@/lib/pathfind";
import { clampInside, easeAngle, rayToFloor } from "@/lib/cameraRig";
import type { FollowConfig } from "@/lib/follow";
import type { CameraOrbit, PlayerState } from "@/components/three/PlayerRig";
import { Avatar } from "@/components/three/Avatar";
import { Companion } from "@/components/three/Companion";
import type { WalkStyle } from "@/components/three/useWalkAnimation";
import {
  CEILING_Y, COUCH_CAMERA, COUCH_FACING, COUCH_HIT, COUCH_SPOT, FRONT_WALL_Z,
  MODEL_PATH, MOTION, NAV, OBSTACLES, ROOM, START,
} from "./layout";
import type { TouchInput } from "./touchInput";

// The characters are still the chibi Blender models (~0.87 m); scale them
// to roughly real height until the natural-proportion versions exist.
const MADELINE_SCALE = 1.8;
const PET_SCALE = 1.3;
const FLOOR_Y = 0;
const HEAD_Y = 1.3;
const CAMERA_DISTANCE = 4.2;
const CAMERA_HEIGHT = 2.6;
const CAMERA_CLEARANCE = 0.25; // gap kept between the camera and a wall it backs into
const CAMERA_MIN_DISTANCE = 1.2;
const CAMERA_LIFT = 1.4; // how much higher it rises when pushed all the way in, to look down over her
const CAMERA_FOLLOW = 5; // how quickly the camera catches up (per second)
const AUTO_TURN = 1.2; // how quickly it swings round behind her
const AUTO_TURN_PAUSE = 1500; // ms after a two-finger look before it takes over again
const WAYPOINT_PASS = 0.4; // switch to the next waypoint this close, so corners don't stop her
const PET_FOLLOW: FollowConfig = { speed: 2.0, maxGap: 5 };
const MADELINE_WALK: WalkStyle = { turnSpeed: 7, stepSpeed: 9, hopHeight: 0.025, sway: 0.03, groundY: FLOOR_Y };
const PARKER_WALK: WalkStyle = { turnSpeed: 7, stepSpeed: 12, hopHeight: 0.02, sway: 0.03, groundY: FLOOR_Y };
const PINTO_WALK: WalkStyle = { turnSpeed: 8, stepSpeed: 14, hopHeight: 0.015, sway: 0.025, groundY: FLOOR_Y };

function Store({ onTap, sceneRef }: { onTap: (e: ThreeEvent<MouseEvent>) => void; sceneRef: React.MutableRefObject<THREE.Object3D | null> }) {
  const { scene } = useGLTF(MODEL_PATH, true, true);
  sceneRef.current = scene;
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
  input,
  cameraOrbitRef,
  inMoment,
  onReachCouch,
}: {
  input: React.MutableRefObject<TouchInput>;
  cameraOrbitRef: React.MutableRefObject<CameraOrbit>;
  inMoment: boolean;
  onReachCouch: () => void;
}) {
  const { camera } = useThree();
  const playerRef = useRef<PlayerState & Mover>({ x: START.x, z: START.z, vx: 0, vz: 0, walking: false });
  const parkerRef = useRef<PlayerState>({ x: START.x + 0.6, z: START.z - 0.4, walking: false });
  const pintoRef = useRef<PlayerState>({ x: START.x - 0.6, z: START.z - 0.4, walking: false });
  const route = useRef<{ x: number; z: number }[]>([]);
  const headingToCouch = useRef(false);
  const storeRef = useRef<THREE.Object3D | null>(null);
  const marker = useRef<THREE.Mesh>(null);
  // scratch objects reused every frame
  const raycaster = useRef(new THREE.Raycaster());
  const ndc = useRef(new THREE.Vector2());
  const head = useRef(new THREE.Vector3());
  const toCam = useRef(new THREE.Vector3());
  const camGoal = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3(START.x, HEAD_Y, START.z + 2));
  const lookGoal = useRef(new THREE.Vector3());

  const tapped = (e: ThreeEvent<MouseEvent>) => {
    const i = input.current;
    const end = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, t: performance.now() };
    return !inMoment && !i.usedGesture && i.start !== null && isTap(i.start, end);
  };

  const routeTo = (goal: { x: number; z: number }) => {
    const p = playerRef.current;
    route.current = findPath({ x: p.x, z: p.z }, goal, OBSTACLES, NAV) ?? [];
  };

  const walkTo = (e: ThreeEvent<MouseEvent>) => {
    if (!tapped(e)) return;
    headingToCouch.current = false;
    routeTo({ x: e.point.x, z: e.point.z });
  };

  const goToCouch = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!tapped(e)) return;
    headingToCouch.current = true;
    routeTo(COUCH_SPOT);
    // a last small step toward the shelves so she settles facing them
    route.current.push({ x: COUCH_SPOT.x + Math.sin(COUCH_FACING) * 0.2, z: COUCH_SPOT.z + Math.cos(COUCH_FACING) * 0.2 });
  };

  useFrame((_, delta) => {
    const p = playerRef.current;
    const i = input.current;

    // holding a finger down walks toward the spot under it
    let target: { x: number; z: number } | null = null;
    if (i.hold && !inMoment) {
      ndc.current.set(i.hold.x, i.hold.y);
      raycaster.current.setFromCamera(ndc.current, camera);
      const r = raycaster.current.ray;
      target = rayToFloor(r.origin, r.direction, FLOOR_Y);
      route.current = [];
      headingToCouch.current = false;
    } else if (route.current.length) {
      const next = route.current[0];
      const isLast = route.current.length === 1;
      if (!isLast && Math.hypot(next.x - p.x, next.z - p.z) < WAYPOINT_PASS) route.current.shift();
      target = route.current[0];
    }

    const moving = target ? stepMotion(p, target, delta, MOTION) : false;
    resolveCollisions(p, ROOM, OBSTACLES);
    p.walking = moving;
    if (!moving && route.current.length === 1) {
      route.current = [];
      if (headingToCouch.current) {
        headingToCouch.current = false;
        onReachCouch();
      }
    }

    if (marker.current) {
      const goal = route.current[route.current.length - 1];
      marker.current.visible = !!goal && !inMoment;
      if (goal) marker.current.position.set(goal.x, FLOOR_Y + 0.02, goal.z);
    }

    // the camera swings round behind her as she walks, unless she's just looked around
    const orbit = cameraOrbitRef.current;
    const speed = Math.hypot(p.vx, p.vz);
    if (speed > 0.3 && performance.now() - i.lastLook > AUTO_TURN_PAUSE) {
      orbit.yaw = easeAngle(orbit.yaw, Math.atan2(p.vx, p.vz), 1 - Math.exp(-delta * AUTO_TURN));
    }

    if (inMoment) {
      camGoal.current.set(COUCH_CAMERA.position.x, COUCH_CAMERA.position.y, COUCH_CAMERA.position.z);
      lookGoal.current.set(COUCH_CAMERA.target.x, COUCH_CAMERA.target.y, COUCH_CAMERA.target.z);
    } else {
      head.current.set(p.x, HEAD_Y, p.z);
      camGoal.current.set(p.x - Math.sin(orbit.yaw) * CAMERA_DISTANCE, CAMERA_HEIGHT, p.z - Math.cos(orbit.yaw) * CAMERA_DISTANCE);
      // pull the camera in front of any wall or column between it and her
      if (storeRef.current) {
        toCam.current.subVectors(camGoal.current, head.current);
        const dist = toCam.current.length();
        raycaster.current.set(head.current, toCam.current.normalize());
        raycaster.current.far = dist;
        const hit = raycaster.current.intersectObject(storeRef.current, true)[0];
        raycaster.current.far = Infinity;
        if (hit) {
          const d = Math.max(CAMERA_MIN_DISTANCE, hit.distance - CAMERA_CLEARANCE);
          camGoal.current.copy(head.current).addScaledVector(toCam.current, d);
          camGoal.current.y += (1 - d / dist) * CAMERA_LIFT;
        }
      }
      clampInside(camGoal.current, ROOM, 0.4, CEILING_Y);
      lookGoal.current.set(p.x, 1.1, p.z);
    }
    const ease = 1 - Math.exp(-delta * CAMERA_FOLLOW);
    camera.position.lerp(camGoal.current, ease);
    lookAt.current.lerp(lookGoal.current, ease);
    camera.lookAt(lookAt.current);
  });

  return (
    <>
      <color attach="background" args={["#e9e2d6"]} />
      <Lights />
      <Store onTap={walkTo} sceneRef={storeRef} />
      <mesh position={[0, 5, FRONT_WALL_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[32, 10.5]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.85} />
      </mesh>
      <mesh position={[COUCH_HIT.center.x, COUCH_HIT.center.y, COUCH_HIT.center.z]} onClick={goToCouch}>
        <boxGeometry args={[COUCH_HIT.size[0], COUCH_HIT.size[1], COUCH_HIT.size[2]]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.16, 0.22, 32]} />
        <meshBasicMaterial color="#6b8f87" transparent opacity={0.7} />
      </mesh>
      <Avatar playerRef={playerRef} modelScale={MADELINE_SCALE} groundY={FLOOR_Y} facing={0} walk={MADELINE_WALK} />
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
