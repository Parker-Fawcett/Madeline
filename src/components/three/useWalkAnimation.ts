import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { headingOf, turnTowards } from "@/lib/heading";
import { GROUND_Y } from "@/lib/labels";
import type { PlayerState } from "./PlayerRig";

export interface WalkStyle {
  turnSpeed: number; // radians per second
  stepSpeed: number;
  hopHeight: number;
  sway: number;
}

// Places a character at its state's position, turns it to face the way it
// moves and hops it while walking. Put `rootRef` on the outer group and
// `bodyRef` on the group holding the model.
export function useWalkAnimation(
  stateRef: React.MutableRefObject<PlayerState>,
  style: WalkStyle
) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const last = useRef({ x: stateRef.current.x, z: stateRef.current.z });
  const stepPhase = useRef(0);

  useFrame((_, delta) => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return;

    const p = stateRef.current;
    const dx = p.x - last.current.x;
    const dz = p.z - last.current.z;
    last.current.x = p.x;
    last.current.z = p.z;

    if (dx * dx + dz * dz > 1e-8) {
      root.rotation.y = turnTowards(root.rotation.y, headingOf(dx, dz), style.turnSpeed * delta);
    }
    root.position.set(p.x, GROUND_Y, p.z);

    stepPhase.current = p.walking ? stepPhase.current + delta * style.stepSpeed : 0;
    body.position.y = Math.abs(Math.sin(stepPhase.current)) * style.hopHeight;
    body.rotation.z = Math.sin(stepPhase.current) * style.sway;
  });

  return { rootRef, bodyRef };
}
