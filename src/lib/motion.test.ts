import { describe, it, expect } from "vitest";
import { stepMotion, type MotionConfig, type Mover } from "./motion";

const config: MotionConfig = { maxSpeed: 2, accel: 4, decel: 4, arriveDistance: 0.03 };

function mover(x = 0, z = 0): Mover {
  return { x, z, vx: 0, vz: 0 };
}

function simulate(m: Mover, target: { x: number; z: number }, seconds: number, dt = 1 / 60) {
  for (let t = 0; t < seconds; t += dt) stepMotion(m, target, dt, config);
}

describe("stepMotion", () => {
  it("speeds up gradually instead of jumping to full speed", () => {
    const m = mover();
    stepMotion(m, { x: 0, z: 10 }, 1 / 60, config);
    expect(Math.hypot(m.vx, m.vz)).toBeLessThan(0.2);
  });

  it("reaches but never exceeds max speed", () => {
    const m = mover();
    simulate(m, { x: 0, z: 100 }, 3);
    expect(Math.hypot(m.vx, m.vz)).toBeCloseTo(2, 1);
  });

  it("slows down and stops on the target without overshooting", () => {
    const m = mover();
    let maxZ = 0;
    for (let t = 0; t < 6; t += 1 / 60) {
      stepMotion(m, { x: 0, z: 3 }, 1 / 60, config);
      maxZ = Math.max(maxZ, m.z);
    }
    expect(m.z).toBeCloseTo(3, 1);
    expect(maxZ).toBeLessThanOrEqual(3.02);
    expect(Math.hypot(m.vx, m.vz)).toBeLessThan(0.05);
  });

  it("reports when it is still moving", () => {
    const m = mover();
    expect(stepMotion(m, { x: 0, z: 2 }, 1 / 60, config)).toBe(true);
    simulate(m, { x: 0, z: 2 }, 6);
    expect(stepMotion(m, { x: 0, z: 2 }, 1 / 60, config)).toBe(false);
  });

  it("is frame-rate independent", () => {
    const fast = mover();
    const slow = mover();
    simulate(fast, { x: 0, z: 100 }, 1, 1 / 60);
    simulate(slow, { x: 0, z: 100 }, 1, 1 / 30);
    expect(slow.z).toBeCloseTo(fast.z, 0);
  });
});
