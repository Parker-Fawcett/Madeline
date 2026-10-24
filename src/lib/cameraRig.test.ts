import { describe, it, expect } from "vitest";
import { clampInside, rayToFloor, easeAngle } from "./cameraRig";

describe("clampInside", () => {
  it("keeps the camera a margin inside the walls", () => {
    const p = { x: 20, y: 3, z: -20 };
    clampInside(p, { minX: -10, maxX: 10, minZ: -10, maxZ: 10 }, 0.5, 4.2);
    expect(p).toEqual({ x: 9.5, y: 3, z: -9.5 });
  });

  it("keeps the camera under the ceiling", () => {
    const p = { x: 0, y: 9, z: 0 };
    clampInside(p, { minX: -10, maxX: 10, minZ: -10, maxZ: 10 }, 0.5, 4.2);
    expect(p.y).toBe(4.2);
  });
});

describe("rayToFloor", () => {
  it("finds where a downward ray hits the floor", () => {
    const hit = rayToFloor({ x: 0, y: 2, z: 0 }, { x: 0, y: -1, z: 1 }, 0);
    expect(hit!.x).toBeCloseTo(0);
    expect(hit!.z).toBeCloseTo(2);
  });

  it("returns null for a ray pointing above the horizon", () => {
    expect(rayToFloor({ x: 0, y: 2, z: 0 }, { x: 0, y: 0.2, z: 1 }, 0)).toBeNull();
  });
});

describe("easeAngle", () => {
  it("moves toward the target angle", () => {
    expect(easeAngle(0, 1, 0.5)).toBeCloseTo(0.5);
  });

  it("goes the short way across the -PI/PI seam", () => {
    const next = easeAngle(Math.PI - 0.1, -Math.PI + 0.1, 0.5);
    expect(next).toBeGreaterThan(Math.PI - 0.1);
  });
});
