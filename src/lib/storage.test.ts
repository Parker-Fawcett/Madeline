import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function blockedStorage() {
  const fail = () => {
    throw new Error("SecurityError");
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
}

describe("storage when localStorage is blocked", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", blockedStorage());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("still remembers the unlock for the rest of the visit", async () => {
    const { getUnlocked, setUnlocked } = await import("./storage");
    setUnlocked();
    expect(getUnlocked()).toBe(true);
  });

  it("still tracks visited sections so the reveal can unlock", async () => {
    const { addVisited, isRevealUnlocked, REQUIRED_ROUTES } = await import("./storage");
    REQUIRED_ROUTES.forEach(addVisited);
    expect(isRevealUnlocked()).toBe(true);
  });
});
