import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LocalStorage } from "./storage";

describe("safe browser storage", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("round-trips values", () => {
    LocalStorage.set("key", { a: 1 });

    expect(LocalStorage.get("key")).toEqual({ a: 1 });
  });

  it("returns null and clears corrupt JSON", () => {
    window.localStorage.setItem("key", "{not json");

    expect(LocalStorage.get("key")).toBeNull();
    expect(window.localStorage.getItem("key")).toBeNull();
  });

  it("does not throw when writing fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(() => LocalStorage.set("key", 1)).not.toThrow();
  });
});
