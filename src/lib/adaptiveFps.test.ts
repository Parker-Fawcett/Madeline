import { describe, it, expect } from "vitest";
import { createAdaptiveFps } from "./adaptiveFps";

function feed(a: ReturnType<typeof createAdaptiveFps>, frameMs: number, frames: number) {
  for (let i = 0; i < frames; i++) a.record(frameMs);
}

describe("createAdaptiveFps", () => {
  it("starts at the high rate", () => {
    expect(createAdaptiveFps(60, 30).fps()).toBe(60);
  });

  it("stays at 60 when frames keep up", () => {
    const a = createAdaptiveFps(60, 30);
    feed(a, 16.7, 300);
    expect(a.fps()).toBe(60);
  });

  it("drops to 30 when the phone can't hold 60", () => {
    const a = createAdaptiveFps(60, 30);
    feed(a, 28, 120);
    expect(a.fps()).toBe(30);
  });

  it("ignores a single hitch", () => {
    const a = createAdaptiveFps(60, 30);
    feed(a, 16.7, 100);
    a.record(120);
    feed(a, 16.7, 20);
    expect(a.fps()).toBe(60);
  });

  it("stays at 30 once dropped, so it doesn't flicker between rates", () => {
    const a = createAdaptiveFps(60, 30);
    feed(a, 28, 120);
    feed(a, 10, 600);
    expect(a.fps()).toBe(30);
  });
});
