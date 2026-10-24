import { describe, it, expect } from "vitest";
import { createFrameLimiter } from "./frameLimiter";

function countRendered(fps: number, refreshHz: number, frames: number) {
  const limiter = createFrameLimiter(fps);
  let count = 0;
  for (let i = 0; i < frames; i++) {
    if (limiter.shouldRender(1000 + i * (1000 / refreshHz))) count++;
  }
  return count;
}

describe("createFrameLimiter", () => {
  it("renders the first frame immediately", () => {
    expect(createFrameLimiter(30).shouldRender(1000)).toBe(true);
  });

  it("skips a frame that arrives before the interval has passed", () => {
    const limiter = createFrameLimiter(30);
    limiter.shouldRender(1000);
    expect(limiter.shouldRender(1016.7)).toBe(false);
  });

  it("holds 30fps on a 60Hz display", () => {
    expect(countRendered(30, 60, 60)).toBe(30);
  });

  it("holds 30fps on a 120Hz display", () => {
    expect(countRendered(30, 120, 120)).toBe(30);
  });

  it("does not burst-render to catch up after a long stall", () => {
    const limiter = createFrameLimiter(30);
    limiter.shouldRender(1000);
    expect(limiter.shouldRender(3000)).toBe(true);
    expect(limiter.shouldRender(3016.7)).toBe(false);
  });
});
