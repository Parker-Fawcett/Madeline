import { describe, it, expect } from "vitest";
import { resolveCollisions, isTap, blenderToThree, type Rect } from "./tapWalk";

const room: Rect = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };

describe("resolveCollisions", () => {
  it("pushes her out of furniture to its nearest edge", () => {
    const pos = { x: 0, z: 0.9 };
    resolveCollisions(pos, room, [{ minX: -1, maxX: 1, minZ: 0.8, maxZ: 2 }]);
    expect(pos.z).toBeCloseTo(0.8);
  });

  it("keeps her inside the room", () => {
    const pos = { x: 12, z: -11 };
    resolveCollisions(pos, room, []);
    expect(pos).toEqual({ x: 10, z: -10 });
  });

  it("leaves her alone when nothing is in the way", () => {
    const pos = { x: 3, z: 3 };
    resolveCollisions(pos, room, [{ minX: -1, maxX: 1, minZ: -1, maxZ: 1 }]);
    expect(pos).toEqual({ x: 3, z: 3 });
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
