"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { headingOf, turnTowards } from "@/lib/heading";
import { GROUND_Y } from "@/lib/labels";
import type { PlayerState } from "./PlayerRig";

const TURN_SPEED = 10; // radians per second
const STEP_SPEED = 11;
const HOP_HEIGHT = 0.05;
const SWAY = 0.08;

// Colours from her photos (honey-blonde hair, mint top, dark wide-leg
// jeans); PlaceholderBody is replaced by the Blender model later.
const SKIN = "#f1c7a8";
const HAIR = "#d9b26f";
const TOP = "#a8dccb";
const PANTS = "#2e3a55";

function PlaceholderBody() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.32, 8]} />
        <meshStandardMaterial color={PANTS} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.24, 8]} />
        <meshStandardMaterial color={TOP} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <icosahedronGeometry args={[0.16, 1]} />
        <meshStandardMaterial color={SKIN} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 0.75, -0.04]} scale={1.06}>
        <icosahedronGeometry args={[0.16, 1]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.62, -0.1]}>
        <boxGeometry args={[0.26, 0.28, 0.08]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

export function Avatar({
  playerRef,
}: {
  playerRef: React.MutableRefObject<PlayerState>;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const last = useRef({ x: playerRef.current.x, z: playerRef.current.z });
  const stepPhase = useRef(0);

  useFrame((_, delta) => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return;

    const p = playerRef.current;
    const dx = p.x - last.current.x;
    const dz = p.z - last.current.z;
    last.current.x = p.x;
    last.current.z = p.z;

    if (dx * dx + dz * dz > 1e-8) {
      root.rotation.y = turnTowards(root.rotation.y, headingOf(dx, dz), TURN_SPEED * delta);
    }
    root.position.set(p.x, GROUND_Y, p.z);

    stepPhase.current = p.walking ? stepPhase.current + delta * STEP_SPEED : 0;
    body.position.y = Math.abs(Math.sin(stepPhase.current)) * HOP_HEIGHT;
    body.rotation.z = Math.sin(stepPhase.current) * SWAY;
  });

  return (
    // Start facing into the world (-z), away from the camera.
    <group ref={rootRef} rotation={[0, Math.PI, 0]}>
      <group ref={bodyRef}>
        <PlaceholderBody />
      </group>
    </group>
  );
}
