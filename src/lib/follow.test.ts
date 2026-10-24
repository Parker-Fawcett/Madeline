import { describe, it, expect } from "vitest";
import { flankPoint } from "./follow";

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
