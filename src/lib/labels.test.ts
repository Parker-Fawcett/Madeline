import { describe, it, expect } from "vitest";
import { labelOffsetFor, LABEL_WORLD_Y, GROUND_Y } from "./labels";

describe("labelOffsetFor", () => {
  it("places the label at the same world height for every marker", () => {
    for (const markerY of [-0.1, 0.27, 0.311]) {
      expect(markerY + labelOffsetFor(markerY)).toBeCloseTo(LABEL_WORLD_Y);
    }
  });

  it("puts labels above the ground so they're visible", () => {
    expect(LABEL_WORLD_Y).toBeGreaterThan(GROUND_Y);
  });
});
