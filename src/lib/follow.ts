import type { GroundPosition } from "./movement";

export interface FollowConfig {
  distance: number; // how far behind the leader to settle
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

// Moves `pos` toward `leader`, stopping `distance` short. Speeds up the
// further behind it falls so it never loses the leader. Mutates `pos`;
// returns whether it moved.
export function followStep(
  pos: GroundPosition,
  leader: GroundPosition,
  delta: number,
  config: FollowConfig
): boolean {
  const dx = leader.x - pos.x;
  const dz = leader.z - pos.z;
  const gap = Math.hypot(dx, dz);
  if (gap <= config.distance) return false;

  const catchUp = Math.max(1, gap / (config.distance * 2));
  const step =
    gap > config.maxGap
      ? gap - config.distance
      : Math.min(gap - config.distance, config.speed * catchUp * delta);
  pos.x += (dx / gap) * step;
  pos.z += (dz / gap) * step;
  return true;
}
