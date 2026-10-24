import type { GroundPosition } from "./movement";

export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WalkConfig {
  speed: number;
  arriveDistance: number;
  bounds: Rect;
}

function pushOutOf(pos: GroundPosition, r: Rect): void {
  if (pos.x <= r.minX || pos.x >= r.maxX || pos.z <= r.minZ || pos.z >= r.maxZ) return;
  const exits = [
    { d: pos.x - r.minX, apply: 0 },
    { d: r.maxX - pos.x, apply: 1 },
    { d: pos.z - r.minZ, apply: 2 },
    { d: r.maxZ - pos.z, apply: 3 },
  ];
  let best = exits[0];
  for (const e of exits) if (e.d < best.d) best = e;
  if (best.apply === 0) pos.x = r.minX;
  else if (best.apply === 1) pos.x = r.maxX;
  else if (best.apply === 2) pos.z = r.minZ;
  else pos.z = r.maxZ;
}

// Steps `pos` toward `target` without entering any obstacle or leaving the
// bounds. Mutates `pos`; returns whether it is still walking.
export function walkTowards(
  pos: GroundPosition,
  target: GroundPosition,
  delta: number,
  config: WalkConfig,
  obstacles: Rect[]
): boolean {
  const dx = target.x - pos.x;
  const dz = target.z - pos.z;
  const dist = Math.hypot(dx, dz);
  if (dist <= config.arriveDistance) return false;

  const step = Math.min(dist, config.speed * delta);
  pos.x += (dx / dist) * step;
  pos.z += (dz / dist) * step;

  const b = config.bounds;
  pos.x = Math.min(b.maxX, Math.max(b.minX, pos.x));
  pos.z = Math.min(b.maxZ, Math.max(b.minZ, pos.z));
  for (const r of obstacles) pushOutOf(pos, r);
  return true;
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
