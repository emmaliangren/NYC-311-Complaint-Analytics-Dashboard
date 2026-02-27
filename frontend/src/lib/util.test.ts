import { describe, it, expect, vi } from "vitest";
import { logError, getError, cn } from "./util";

describe("getError", () => {
  it("returns message when given an Error", () => {
    expect(getError(new Error("something went wrong"))).toBe("something went wrong");
  });

  it("returns string rep for non-Error values", () => {
    expect(getError("string")).toBe("string");
    expect(getError(42)).toBe("42");
  });
});

describe("logError", () => {
  it("logs the error message to console", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError(new Error("oops"));
    expect(spy).toHaveBeenCalledWith("oops");
    spy.mockRestore();
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isActive = false;
    expect(cn("foo", isActive && "bar", "baz")).toBe("foo baz");
  });
});
