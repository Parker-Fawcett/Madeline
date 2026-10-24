import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { headingOf, turnTowards } from "@/lib/heading";
import { GROUND_Y } from "@/lib/labels";
import type { PlayerState } from "./PlayerRig";

const STRIDE_EASE = 6;
const LEAN = 0.06; // radians forward at full walk

export interface WalkStyle {
  turnSpeed: number; // radians per second
  stepSpeed: number;
  hopHeight: number;
  sway: number;
  groundY?: number; // defaults to the original field's ground
}

// Places a character at its state's position, turns it to face the way it
// moves and bobs it gently while walking, easing the bob in and out so
// starting and stopping don't snap. Put `rootRef` on the outer group and
// `bodyRef` on the group holding the model.
export function useWalkAnimation(
  stateRef: React.MutableRefObject<PlayerState>,
  style: WalkStyle
) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const last = useRef({ x: stateRef.current.x, z: stateRef.current.z });
  const stepPhase = useRef(0);
  const stride = useRef(0); // 0 standing .. 1 full walk

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
    root.position.set(p.x, style.groundY ?? GROUND_Y, p.z);

    const ease = 1 - Math.exp(-delta * STRIDE_EASE);
    stride.current += ((p.walking ? 1 : 0) - stride.current) * ease;
    stepPhase.current += delta * style.stepSpeed * stride.current;
    // two bobs per stride cycle, one per footstep, smooth at the bottom
    body.position.y = ((1 - Math.cos(stepPhase.current * 2)) / 2) * style.hopHeight * stride.current;
    body.rotation.z = Math.sin(stepPhase.current) * style.sway * stride.current;
    body.rotation.x = LEAN * stride.current;
  });

  return { rootRef, bodyRef };
}
