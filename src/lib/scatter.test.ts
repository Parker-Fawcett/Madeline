import { describe, it, expect } from "vitest";
import { scatter, type ScatterOptions } from "./scatter";

const base: ScatterOptions = {
  seed: 1,
  count: 40,
  minRadius: 8,
  maxRadius: 11,
  spacing: 0.8,
  avoid: [],
};

describe("scatter", () => {
  it("returns the requested number of points when there is room", () => {
    expect(scatter(base)).toHaveLength(40);
  });

  it("is deterministic for the same seed", () => {
    expect(scatter(base)).toEqual(scatter(base));
  });

  it("gives different layouts for different seeds", () => {
    expect(scatter({ ...base, seed: 2 })).not.toEqual(scatter(base));
  });

  it("keeps every point inside the ring", () => {
    for (const p of scatter(base)) {
      const r = Math.hypot(p.x, p.z);
      expect(r).toBeGreaterThanOrEqual(8);
      expect(r).toBeLessThanOrEqual(11);
    }
  });

  it("keeps points at least `spacing` apart", () => {
    const points = scatter(base);
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = Math.hypot(points[i].x - points[j].x, points[i].z - points[j].z);
        expect(d).toBeGreaterThanOrEqual(0.8);
      }
    }
  });

  it("stays clear of avoid zones", () => {
    const avoid = [{ x: 0, z: 9.5, radius: 2 }];
    for (const p of scatter({ ...base, avoid })) {
      expect(Math.hypot(p.x, p.z - 9.5)).toBeGreaterThanOrEqual(2);
    }
  });

  it("returns fewer points instead of hanging when the ring is too crowded", () => {
    const points = scatter({ ...base, count: 10000, spacing: 2 });
    expect(points.length).toBeGreaterThan(0);
    expect(points.length).toBeLessThan(10000);
  });
});
