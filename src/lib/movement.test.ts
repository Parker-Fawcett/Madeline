import { describe, it, expect } from "vitest";
import { stepPlayer, type MoveConfig } from "./movement";

const config: MoveConfig = { speed: 2, deadzone: 0.08, groundRadius: 10 };

describe("stepPlayer", () => {
  it("moves forward (-z) when the stick is pushed up with no camera yaw", () => {
    const pos = { x: 0, z: 0 };
    expect(stepPlayer(pos, { x: 0, y: 1 }, 0, 1, [], config)).toBe(true);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.z).toBeCloseTo(-2);
  });

  it("strafes right (+x) when the stick is pushed right", () => {
    const pos = { x: 0, z: 0 };
    stepPlayer(pos, { x: 1, y: 0 }, 0, 1, [], config);
    expect(pos.x).toBeCloseTo(2);
    expect(pos.z).toBeCloseTo(0);
  });

  it("moves relative to camera yaw", () => {
    const pos = { x: 0, z: 0 };
    stepPlayer(pos, { x: 0, y: 1 }, Math.PI / 2, 1, [], config);
    expect(pos.x).toBeCloseTo(-2);
    expect(pos.z).toBeCloseTo(0);
  });

  it("ignores input inside the deadzone", () => {
    const pos = { x: 1, z: 1 };
    expect(stepPlayer(pos, { x: 0.05, y: 0.02 }, 0, 1, [], config)).toBe(false);
    expect(pos).toEqual({ x: 1, z: 1 });
  });

  it("keeps the player inside the ground circle", () => {
    const pos = { x: 9.5, z: 0 };
    stepPlayer(pos, { x: 1, y: 0 }, 0, 1, [], config);
    expect(Math.hypot(pos.x, pos.z)).toBeCloseTo(10);
  });

  it("pushes the player out of an obstacle to its edge", () => {
    const pos = { x: 0, z: 2 };
    stepPlayer(pos, { x: 0, y: 1 }, 0, 0.6, [{ x: 0, z: 0, radius: 1 }], config);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.z).toBeCloseTo(1);
  });
});
