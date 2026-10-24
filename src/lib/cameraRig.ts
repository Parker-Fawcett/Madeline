import type { Rect } from "./tapWalk";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// Keeps the camera `margin` inside the walls and under the ceiling, so it
// never ends up looking at the outside of the model. Mutates `p`.
export function clampInside(p: Vec3, room: Rect, margin: number, maxY: number): void {
  p.x = Math.min(room.maxX - margin, Math.max(room.minX + margin, p.x));
  p.z = Math.min(room.maxZ - margin, Math.max(room.minZ + margin, p.z));
  p.y = Math.min(maxY, p.y);
}

// Where a ray from the camera through the finger meets the floor.
export function rayToFloor(origin: Vec3, dir: Vec3, floorY: number): { x: number; z: number } | null {
  if (dir.y >= 0) return null;
  const t = (floorY - origin.y) / dir.y;
  if (t < 0) return null;
  return { x: origin.x + dir.x * t, z: origin.z + dir.z * t };
}

// Moves an angle a fraction `t` of the way to `target`, the short way round.
export function easeAngle(current: number, target: number, t: number): number {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * t;
}
