"use client";

import { useGLTF } from "@react-three/drei";
import type { PlayerState } from "./PlayerRig";
import { useWalkAnimation, type WalkStyle } from "./useWalkAnimation";

const WALK: WalkStyle = { turnSpeed: 10, stepSpeed: 11, hopHeight: 0.05, sway: 0.08 };

// Modelled in Blender from her photos (brown hair with blonde front
// highlights, freckles, mint top, wide-leg jeans). Faces +z, feet at 0.
const MODEL_PATH = "/models/madeline.glb";

function MadelineModel() {
  const { scene } = useGLTF(MODEL_PATH, true, true);
  return <primitive object={scene} />;
}

export function Avatar({
  playerRef,
}: {
  playerRef: React.MutableRefObject<PlayerState>;
}) {
  const { rootRef, bodyRef } = useWalkAnimation(playerRef, WALK);

  return (
    // Start facing into the world (-z), away from the camera.
    <group ref={rootRef} rotation={[0, Math.PI, 0]}>
      <group ref={bodyRef}>
        <MadelineModel />
      </group>
    </group>
  );
}
