import { describe, expect, it } from "vitest";

import { getRequestOrigin, sanitizeRedirectPath } from "./request";

function makeRequest(headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/test?x=1", { headers });
}

describe("getRequestOrigin", () => {
  it("falls back to the request URL origin", () => {
    expect(getRequestOrigin(makeRequest())).toBe("http://localhost:3000");
  });

  it("prefers forwarded host and protocol", () => {
    expect(getRequestOrigin(makeRequest({
      "x-forwarded-host": "example.com",
      "x-forwarded-proto": "https",
    }))).toBe("https://example.com");
  });

  it("uses the first value of comma separated forwarded headers", () => {
    expect(getRequestOrigin(makeRequest({
      "x-forwarded-host": "example.com, internal",
      "x-forwarded-proto": "https,http",
    }))).toBe("https://example.com");
  });

  it("uses the request protocol when only the forwarded host is set", () => {
    expect(getRequestOrigin(makeRequest({ "x-forwarded-host": "example.com" }))).toBe("http://example.com");
  });
});

describe("sanitizeRedirectPath", () => {
  it("keeps same-site paths", () => {
    expect(sanitizeRedirectPath("/dashboard?a=1", "/")).toBe("/dashboard?a=1");
  });

  it.each(["//evil.com", "https://evil.com", "/\\evil.com", "", null, undefined])(
    "rejects %s",
    (value) => {
      expect(sanitizeRedirectPath(value, "/safe")).toBe("/safe");
    },
  );
});
