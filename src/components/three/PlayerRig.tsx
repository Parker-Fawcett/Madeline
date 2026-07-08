"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { JoystickVector } from "./Joystick";

const MOVE_SPEED = 2.2;
const GROUND_RADIUS = 11.3;
const DEADZONE = 0.08;
const BASE_HEIGHT = 1.1;
const BASE_DISTANCE = 2.3;
const PLAYER_START = new THREE.Vector3(0, 0, 8);
const BOB_SPEED = 9;
const BOB_AMPLITUDE = 0.06;
export const PITCH_MIN = -0.15;
export const PITCH_MAX = 0.65;
const Y_AXIS = new THREE.Vector3(0, 1, 0);

export interface CollisionTarget {
  id: string;
  position: [number, number, number];
  radius: number;
}

export interface CameraOrbit {
  yaw: number;
  pitch: number;
}

export function PlayerRig({
  joystickVectorRef,
  cameraOrbitRef,
  collisionTargets,
  proximityTargetId,
  proximityRadius = 2.2,
  onProximityChange,
}: {
  joystickVectorRef: React.MutableRefObject<JoystickVector>;
  cameraOrbitRef: React.MutableRefObject<CameraOrbit>;
  collisionTargets: CollisionTarget[];
  proximityTargetId?: string;
  proximityRadius?: number;
  onProximityChange?: (id: string, inRange: boolean) => void;
}) {
  const { camera } = useThree();
  const playerPos = useRef(PLAYER_START.clone());
  const wasInRange = useRef(false);
  const bobPhase = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useFrame((_, delta) => {
    const v = joystickVectorRef.current;
    const len = Math.hypot(v.x, v.y);
    const isWalking = len > DEADZONE;

    const yaw = cameraOrbitRef.current.yaw;
    const pitch = cameraOrbitRef.current.pitch;

    if (isWalking) {
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(Y_AXIS, yaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, yaw);

      const next = playerPos.current.clone();
      next.x += (right.x * v.x + forward.x * v.y) * MOVE_SPEED * delta;
      next.z += (right.z * v.x + forward.z * v.y) * MOVE_SPEED * delta;

      const distFromCenter = Math.hypot(next.x, next.z);
      if (distFromCenter > GROUND_RADIUS) {
        const scale = GROUND_RADIUS / distFromCenter;
        next.x *= scale;
        next.z *= scale;
      }

      for (const target of collisionTargets) {
        const dx = next.x - target.position[0];
        const dz = next.z - target.position[2];
        const dist = Math.hypot(dx, dz);
        if (dist < target.radius && dist > 0.0001) {
          const push = target.radius / dist;
          next.x = target.position[0] + dx * push;
          next.z = target.position[2] + dz * push;
        }
      }

      playerPos.current.x = next.x;
      playerPos.current.z = next.z;
    }

    const clampedPitch = THREE.MathUtils.clamp(pitch, PITCH_MIN, PITCH_MAX);
    const horizontalScale = Math.cos(clampedPitch);
    const orbitOffset = new THREE.Vector3(0, 0, BASE_DISTANCE)
      .applyAxisAngle(Y_AXIS, yaw)
      .multiply(new THREE.Vector3(horizontalScale, 0, horizontalScale));
    orbitOffset.y = BASE_HEIGHT + BASE_DISTANCE * Math.sin(clampedPitch);

    const targetCamPos = playerPos.current.clone().add(orbitOffset);

    if (!reducedMotion) {
      if (isWalking) {
        bobPhase.current += delta * BOB_SPEED;
        targetCamPos.y += Math.sin(bobPhase.current) * BOB_AMPLITUDE;
      } else {
        bobPhase.current = 0;
      }
    }

    if (reducedMotion) {
      camera.position.copy(targetCamPos);
    } else {
      const alpha = 1 - Math.pow(0.0001, delta);
      camera.position.lerp(targetCamPos, alpha);
    }
    camera.lookAt(
      playerPos.current.x,
      playerPos.current.y + 0.8,
      playerPos.current.z
    );

    if (proximityTargetId && onProximityChange) {
      const target = collisionTargets.find((t) => t.id === proximityTargetId);
      if (target) {
        const dx = playerPos.current.x - target.position[0];
        const dz = playerPos.current.z - target.position[2];
        const inRange = Math.hypot(dx, dz) < proximityRadius;
        if (inRange !== wasInRange.current) {
          wasInRange.current = inRange;
          onProximityChange(proximityTargetId, inRange);
        }
      }
    }
  });

  return null;
}
