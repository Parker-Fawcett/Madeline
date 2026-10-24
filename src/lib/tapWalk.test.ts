import { describe, it, expect } from "vitest";
import { walkTowards, isTap, blenderToThree, type WalkConfig } from "./tapWalk";

const config: WalkConfig = {
  speed: 2,
  arriveDistance: 0.05,
  bounds: { minX: -10, maxX: 10, minZ: -10, maxZ: 10 },
};

describe("walkTowards", () => {
  it("walks toward the target at its speed", () => {
    const pos = { x: 0, z: 0 };
    expect(walkTowards(pos, { x: 0, z: 5 }, 0.5, config, [])).toBe(true);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.z).toBeCloseTo(1);
  });

  it("stops exactly on the target instead of overshooting", () => {
    const pos = { x: 0, z: 0 };
    walkTowards(pos, { x: 0, z: 0.5 }, 1, config, []);
    expect(pos.z).toBeCloseTo(0.5);
  });

  it("reports arrival once within the arrive distance", () => {
    const pos = { x: 0, z: 0.98 };
    expect(walkTowards(pos, { x: 0, z: 1 }, 0.1, config, [])).toBe(false);
  });

  it("never walks into furniture", () => {
    const pos = { x: 0, z: 0 };
    const couch = { minX: -1, maxX: 1, minZ: 0.8, maxZ: 2 };
    for (let i = 0; i < 20; i++) walkTowards(pos, { x: 0, z: 3 }, 0.1, config, [couch]);
    expect(pos.z).toBeLessThanOrEqual(0.8 + 1e-6);
  });

  it("stays inside the store", () => {
    const pos = { x: 9.9, z: 0 };
    walkTowards(pos, { x: 20, z: 0 }, 1, config, []);
    expect(pos.x).toBeLessThanOrEqual(10);
  });
});

describe("isTap", () => {
  it("is a tap for a quick touch that barely moves", () => {
    expect(isTap({ x: 100, y: 100, t: 0 }, { x: 103, y: 102, t: 180 })).toBe(true);
  });

  it("is not a tap when the finger drags", () => {
    expect(isTap({ x: 100, y: 100, t: 0 }, { x: 160, y: 100, t: 180 })).toBe(false);
  });

  it("is not a tap when the finger is held down", () => {
    expect(isTap({ x: 100, y: 100, t: 0 }, { x: 100, y: 100, t: 900 })).toBe(false);
  });
});

describe("blenderToThree", () => {
  it("maps Blender's z-up to three's y-up (x, z, -y)", () => {
    expect(blenderToThree(-7, -5, 1)).toEqual({ x: -7, y: 1, z: 5 });
  });
});
