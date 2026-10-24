import type { GroundPosition } from "./movement";

export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

function pushOutOf(pos: GroundPosition, r: Rect): void {
  if (pos.x <= r.minX || pos.x >= r.maxX || pos.z <= r.minZ || pos.z >= r.maxZ) return;
  const toMinX = pos.x - r.minX;
  const toMaxX = r.maxX - pos.x;
  const toMinZ = pos.z - r.minZ;
  const toMaxZ = r.maxZ - pos.z;
  const nearest = Math.min(toMinX, toMaxX, toMinZ, toMaxZ);
  if (nearest === toMinX) pos.x = r.minX;
  else if (nearest === toMaxX) pos.x = r.maxX;
  else if (nearest === toMinZ) pos.z = r.minZ;
  else pos.z = r.maxZ;
}

// Keeps `pos` inside the room and out of every obstacle. Mutates `pos`.
export function resolveCollisions(pos: GroundPosition, bounds: Rect, obstacles: Rect[]): void {
  pos.x = Math.min(bounds.maxX, Math.max(bounds.minX, pos.x));
  pos.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, pos.z));
  for (const r of obstacles) pushOutOf(pos, r);
}

const TAP_MAX_MOVE = 10; // px
const TAP_MAX_MS = 450;

// A touch counts as a tap (walk here) rather than a drag (look around) if
// it was quick and the finger barely moved.
export function isTap(
  down: { x: number; y: number; t: number },
  up: { x: number; y: number; t: number }
): boolean {
  return Math.hypot(up.x - down.x, up.y - down.y) <= TAP_MAX_MOVE && up.t - down.t <= TAP_MAX_MS;
}

// Blender is z-up; the glTF export (and three.js) is y-up with -y forward.
export function blenderToThree(x: number, y: number, z: number) {
  return { x, y: z, z: -y };
}
