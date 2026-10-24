import { describe, it, expect, vi, afterEach } from "vitest";
import { supportsWebGL } from "./webgl";

function stubCanvas(gl: unknown) {
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", {
    createElement: () => ({ getContext: () => gl }),
  });
}

describe("supportsWebGL", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("releases the probe context so it doesn't count against iOS's context limit", () => {
    const loseContext = vi.fn();
    stubCanvas({
      getParameter: () => 0,
      getExtension: (name: string) =>
        name === "WEBGL_lose_context" ? { loseContext } : null,
    });
    expect(supportsWebGL()).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
  });

  it("returns false when no context is available", () => {
    stubCanvas(null);
    expect(supportsWebGL()).toBe(false);
  });
});
