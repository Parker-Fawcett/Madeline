import type { Rect } from "@/lib/tapWalk";
import type { MotionConfig } from "@/lib/motion";
import type { NavGrid } from "@/lib/pathfind";
import { blenderToThree } from "@/lib/tapWalk";

// Positions measured in the Blender model (z-up, metres) and converted to
// the site's y-up space, so this file can be checked against the .blend.
function rect(bxMin: number, bxMax: number, byMin: number, byMax: number): Rect {
  return { minX: bxMin, maxX: bxMax, minZ: -byMax, maxZ: -byMin };
}

export const MODEL_PATH = "/models/rc-willey.glb";

// Walkable floor, and the room the camera must stay inside.
export const ROOM = rect(-15.3, 15.3, -12.5, 12.6);
// Highest the camera may go: under the round ducts (bottom at ~3.98 m),
// not just the ceiling, or it looks straight through them.
export const CEILING_Y = 3.6;
// The modelled section is open at the front (Blender y = -13); a wall
// there keeps the camera from ever seeing outside it.
export const FRONT_WALL_Z = 13;

export const MOTION: MotionConfig = { maxSpeed: 1.6, accel: 3.2, decel: 3.0, arriveDistance: 0.05 };
export const NAV: NavGrid = { bounds: ROOM, cell: 0.25, radius: 0.3 };

// Just inside the atrium, facing out over the showroom.
export const START = blenderToThree(-1, -0.6, 0);

// Standing between the grey L sectional and its coffee table.
export const COUCH_SPOT = blenderToThree(-6.2, -5.85, 0);
// Looking toward the library wall once there.
export const COUCH_FACING = Math.PI;
// Where the camera settles for the moment, and what it looks at.
export const COUCH_CAMERA = { position: blenderToThree(-3.0, -8.6, 1.55), target: blenderToThree(-7.2, -3.2, 1.0) };
// Invisible tap target over the sectional.
export const COUCH_HIT = { center: blenderToThree(-6.85, -6.6, 0.45), size: [3.6, 0.9, 2.6] as const };

const COLUMNS: Rect[] = [];
for (const x of [-12, -4, 4, 12]) {
  for (const y of [-9, -1]) COLUMNS.push(rect(x - 0.5, x + 0.5, y - 0.5, y + 0.5));
}
for (const [x, y] of [[-5, 1.5], [5, 1.5], [-5, 10.5], [5, 10.5]]) {
  COLUMNS.push(rect(x - 0.55, x + 0.55, y - 0.55, y + 0.55));
}

export const OBSTACLES: Rect[] = [
  ...COLUMNS,
  rect(-6.6, 6.6, 8.2, 10.8),        // waterfall and basin
  rect(-0.6, 0.6, 6.4, 7.6),         // atrium display table
  rect(0.6, 6.5, 2.6, 8.8),          // grand staircase
  rect(-10.3, -3.7, -2.9, -2.2),     // library wall and display wall
  rect(-8.35, -5.15, -7.6, -6.6),    // sectional, long side
  rect(-8.35, -7.35, -7.1, -5.0),    // sectional, chaise
  rect(-7.35, -6.05, -5.0, -4.3),    // coffee table
  rect(-5.15, -4.65, -7.35, -6.85),  // side table and lamp
  rect(2.6, 6.4, -7.75, -6.65),      // blue-grey sectional
  rect(1.85, 2.95, -6.9, -4.3),      // blue-grey sectional return
  rect(3.9, 5.3, -6.0, -5.2),        // glass coffee table
  rect(-2.45, 0.45, -12.1, -11.1),   // cream sofa
  rect(0.82, 1.78, -10.8, -9.6),     // cream chair
  rect(3.75, 6.25, -2.7, -0.5),      // dining table and stools
];
