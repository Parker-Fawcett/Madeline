import { describe, it, expect } from "vitest";
import { isCorrectName } from "./password";

describe("isCorrectName", () => {
  it("accepts the exact name", () => {
    expect(isCorrectName("Madeline")).toBe(true);
  });

  it("ignores case", () => {
    expect(isCorrectName("madeline")).toBe(true);
    expect(isCorrectName("MADELINE")).toBe(true);
  });

  it("ignores whitespace iOS keyboards add, including non-breaking spaces", () => {
    expect(isCorrectName("  Madeline ")).toBe(true);
    expect(isCorrectName("Madeline ")).toBe(true);
  });

  it("ignores a trailing period from the iOS double-space shortcut", () => {
    expect(isCorrectName("Madeline.")).toBe(true);
    expect(isCorrectName("Madeline. ")).toBe(true);
  });

  it("rejects other names", () => {
    expect(isCorrectName("")).toBe(false);
    expect(isCorrectName("Made")).toBe(false);
    expect(isCorrectName("Parker")).toBe(false);
  });
});
