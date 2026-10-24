import { describe, it, expect } from "vitest";
import { findPath, segmentClear, type NavGrid } from "./pathfind";
import type { Rect } from "./tapWalk";

const bounds: Rect = { minX: -5, maxX: 5, minZ: -5, maxZ: 5 };
const wall: Rect = { minX: -3, maxX: 3, minZ: -0.2, maxZ: 0.2 };
const grid: NavGrid = { bounds, cell: 0.25, radius: 0.3 };

function hitsRect(a: { x: number; z: number }, b: { x: number; z: number }, r: Rect) {
  for (let t = 0; t <= 1; t += 0.01) {
    const x = a.x + (b.x - a.x) * t;
    const z = a.z + (b.z - a.z) * t;
    if (x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ) return true;
  }
  return false;
}

describe("segmentClear", () => {
  it("is clear when nothing is in the way", () => {
    expect(segmentClear({ x: -4, z: -4 }, { x: 4, z: -4 }, [wall], 0.3)).toBe(true);
  });

  it("is blocked by an obstacle on the line", () => {
    expect(segmentClear({ x: 0, z: -2 }, { x: 0, z: 2 }, [wall], 0.3)).toBe(false);
  });
});

describe("findPath", () => {
  it("goes straight when the way is clear", () => {
    const path = findPath({ x: -4, z: -4 }, { x: 4, z: -4 }, [wall], grid);
    expect(path).toEqual([{ x: 4, z: -4 }]);
  });

  it("walks around an obstacle instead of through it", () => {
    const path = findPath({ x: 0, z: -2 }, { x: 0, z: 2 }, [wall], grid)!;
    expect(path.length).toBeGreaterThan(1);
    let prev = { x: 0, z: -2 };
    for (const p of path) {
      expect(hitsRect(prev, p, wall)).toBe(false);
      prev = p;
    }
    expect(path[path.length - 1]).toEqual({ x: 0, z: 2 });
  });

  it("keeps the route short by cutting corners where it can", () => {
    const path = findPath({ x: 0, z: -2 }, { x: 0, z: 2 }, [wall], grid)!;
    expect(path.length).toBeLessThanOrEqual(3);
  });

  it("moves a target inside furniture to the nearest open spot", () => {
    const path = findPath({ x: 0, z: -2 }, { x: 0, z: 0 }, [wall], grid)!;
    const end = path[path.length - 1];
    expect(end.z < wall.minZ - 0.2 || end.z > wall.maxZ + 0.2 || Math.abs(end.x) > 3).toBe(true);
  });

  it("returns null when there is no way through", () => {
    const sealed: Rect = { minX: -5, maxX: 5, minZ: -0.2, maxZ: 0.2 };
    expect(findPath({ x: 0, z: -2 }, { x: 0, z: 2 }, [sealed], grid)).toBeNull();
  });
});
