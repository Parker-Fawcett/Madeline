import { describe, it, expect } from "vitest";
import { flankPoint, followStep, type FollowConfig } from "./follow";

const config: FollowConfig = { distance: 0.5, speed: 2, maxGap: 4 };

describe("followStep", () => {
  it("stays put when already close enough", () => {
    const pos = { x: 0, z: 0.4 };
    expect(followStep(pos, { x: 0, z: 0 }, 1, config)).toBe(false);
    expect(pos).toEqual({ x: 0, z: 0.4 });
  });

  it("walks toward the leader", () => {
    const pos = { x: 0, z: 2 };
    expect(followStep(pos, { x: 0, z: 0 }, 0.1, config)).toBe(true);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.z).toBeLessThan(2);
  });

  it("never gets closer than the follow distance", () => {
    const pos = { x: 0, z: 0.6 };
    followStep(pos, { x: 0, z: 0 }, 1, config);
    expect(Math.hypot(pos.x, pos.z)).toBeCloseTo(0.5);
  });

  it("moves no more than speed * delta when just behind", () => {
    const pos = { x: 0, z: 1 };
    followStep(pos, { x: 0, z: 0 }, 0.1, config);
    expect(1 - pos.z).toBeCloseTo(0.2);
  });

  it("hurries to catch up when far behind", () => {
    const near = { x: 0, z: 1 };
    const far = { x: 0, z: 3 };
    followStep(near, { x: 0, z: 0 }, 0.1, config);
    followStep(far, { x: 0, z: 0 }, 0.1, config);
    expect(3 - far.z).toBeGreaterThan(1 - near.z);
  });

  it("jumps straight to the leader's side when hopelessly far behind", () => {
    const pos = { x: 0, z: 10 };
    followStep(pos, { x: 0, z: 0 }, 0.1, config);
    expect(Math.hypot(pos.x, pos.z)).toBeCloseTo(0.5);
  });
});

describe("flankPoint", () => {
  it("is to the right of the leader for a positive side with no camera yaw", () => {
    const out = { x: 0, z: 0 };
    flankPoint({ x: 1, z: 1 }, 0, 0.5, out);
    expect(out.x).toBeCloseTo(1.5);
    expect(out.z).toBeCloseTo(1);
  });

  it("is to the left for a negative side", () => {
    const out = { x: 0, z: 0 };
    flankPoint({ x: 0, z: 0 }, 0, -0.5, out);
    expect(out.x).toBeCloseTo(-0.5);
  });

  it("rotates with the camera yaw so it stays beside her on screen", () => {
    const out = { x: 0, z: 0 };
    flankPoint({ x: 0, z: 0 }, Math.PI / 2, 0.5, out);
    expect(out.x).toBeCloseTo(0);
    expect(out.z).toBeCloseTo(-0.5);
  });
});
