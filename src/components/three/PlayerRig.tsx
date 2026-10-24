"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { JoystickVector } from "./Joystick";
import { stepPlayer, type Obstacle, type MoveConfig } from "@/lib/movement";

const MOVE_CONFIG: MoveConfig = { speed: 2.2, deadzone: 0.08, groundRadius: 11.3 };
// Pulled back from 1.1/2.3 so the avatar sits in frame instead of filling it.
const BASE_HEIGHT = 1.3;
const BASE_DISTANCE = 3;
export const PLAYER_START = { x: 0, z: 8 };
const BOB_SPEED = 9;
const BOB_AMPLITUDE = 0.06;
export const PITCH_MIN = -0.15;
export const PITCH_MAX = 0.65;

export interface CollisionTarget extends Obstacle {
  id: string;
}

export interface CameraOrbit {
  yaw: number;
  pitch: number;
}

// Shared with the avatar so it can follow and animate the player.
export interface PlayerState {
  x: number;
  z: number;
  walking: boolean;
}

export function PlayerRig({
  playerRef,
  joystickVectorRef,
  cameraOrbitRef,
  collisionTargets,
  proximityTargetId,
  proximityRadius = 2.2,
  onProximityChange,
}: {
  playerRef: React.MutableRefObject<PlayerState>;
  joystickVectorRef: React.MutableRefObject<JoystickVector>;
  cameraOrbitRef: React.MutableRefObject<CameraOrbit>;
  collisionTargets: CollisionTarget[];
  proximityTargetId?: string;
  proximityRadius?: number;
  onProximityChange?: (id: string, inRange: boolean) => void;
}) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3());
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
    const pos = playerRef.current;
    const { yaw, pitch } = cameraOrbitRef.current;
    const isWalking = stepPlayer(
      pos,
      joystickVectorRef.current,
      yaw,
      delta,
      collisionTargets,
      MOVE_CONFIG
    );
    pos.walking = isWalking;

    const clampedPitch = THREE.MathUtils.clamp(pitch, PITCH_MIN, PITCH_MAX);
    const horizontal = BASE_DISTANCE * Math.cos(clampedPitch);
    const cam = targetCamPos.current.set(
      pos.x + Math.sin(yaw) * horizontal,
      BASE_HEIGHT + BASE_DISTANCE * Math.sin(clampedPitch),
      pos.z + Math.cos(yaw) * horizontal
    );

    if (!reducedMotion) {
      if (isWalking) {
        bobPhase.current += delta * BOB_SPEED;
        cam.y += Math.sin(bobPhase.current) * BOB_AMPLITUDE;
      } else {
        bobPhase.current = 0;
      }
    }

    if (reducedMotion) {
      camera.position.copy(cam);
    } else {
      const alpha = 1 - Math.pow(0.0001, delta);
      camera.position.lerp(cam, alpha);
    }
    camera.lookAt(pos.x, 0.8, pos.z);

    if (proximityTargetId && onProximityChange) {
      const target = collisionTargets.find((t) => t.id === proximityTargetId);
      if (target) {
        const dx = pos.x - target.x;
        const dz = pos.z - target.z;
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
