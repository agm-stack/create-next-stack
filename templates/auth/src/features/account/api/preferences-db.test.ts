import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { parseUserPreferences } = await import("./preferences-db");

describe("parseUserPreferences", () => {
  it("keeps known keys with valid values", () => {
    expect(parseUserPreferences([{ key: "theme", value: "dark" }])).toEqual({ theme: "dark" });
  });

  it("drops unknown keys and values that fail their schema", () => {
    expect(parseUserPreferences([
      { key: "unknown", value: "x" },
      { key: "theme", value: "purple" },
    ])).toEqual({});
  });
});
