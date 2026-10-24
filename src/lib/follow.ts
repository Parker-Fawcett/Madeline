import type { GroundPosition } from "./movement";

export interface FollowConfig {
  speed: number;
  maxGap: number; // beyond this, snap back beside the leader
}

// A point `side` units to the leader's right as seen from the camera (left
// when negative), written into `out`. Same right-vector as stepPlayer.
export function flankPoint(
  leader: GroundPosition,
  cameraYaw: number,
  side: number,
  out: GroundPosition
): void {
  out.x = leader.x + Math.cos(cameraYaw) * side;
  out.z = leader.z - Math.sin(cameraYaw) * side;
}
