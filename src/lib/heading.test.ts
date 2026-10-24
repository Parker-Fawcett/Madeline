import { describe, it, expect } from "vitest";
import { turnTowards, headingOf } from "./heading";

describe("headingOf", () => {
  it("is 0 when moving toward +z", () => {
    expect(headingOf(0, 1)).toBeCloseTo(0);
  });

  it("is +PI/2 when moving toward +x", () => {
    expect(headingOf(1, 0)).toBeCloseTo(Math.PI / 2);
  });
});

describe("turnTowards", () => {
  it("snaps to the target when within one step", () => {
    expect(turnTowards(0, 0.1, 0.5)).toBeCloseTo(0.1);
  });

  it("moves at most maxStep toward the target", () => {
    expect(turnTowards(0, 1, 0.25)).toBeCloseTo(0.25);
    expect(turnTowards(0, -1, 0.25)).toBeCloseTo(-0.25);
  });

  it("takes the short way around across the -PI/PI seam", () => {
    const next = turnTowards(Math.PI - 0.1, -Math.PI + 0.1, 0.05);
    expect(next).toBeCloseTo(Math.PI - 0.05);
  });
});
