import { describe, expect, it } from "vitest";

import { getHttpErrorCategory } from "./http-helpers";

describe("getHttpErrorCategory", () => {
  it("classifies server failures separately from network failures", () => {
    expect(
      getHttpErrorCategory({
        isAxiosError: true,
        response: { status: 500 },
      }),
    ).toBe("server");
    expect(
      getHttpErrorCategory({
        isAxiosError: true,
      }),
    ).toBe("network");
  });

  it("classifies common client response statuses", () => {
    expect(
      getHttpErrorCategory({
        isAxiosError: true,
        response: { status: 400 },
      }),
    ).toBe("badRequest");
    expect(
      getHttpErrorCategory({
        isAxiosError: true,
        response: { status: 429 },
      }),
    ).toBe("rateLimit");
    expect(
      getHttpErrorCategory({
        isAxiosError: true,
        response: { status: 401 },
      }),
    ).toBe("unauthorized");
  });

  it("uses a generic category for non-HTTP errors", () => {
    expect(getHttpErrorCategory(new Error("unexpected"))).toBe("generic");
  });
});
