import { afterEach, describe, expect, it } from "vitest";

import { Cookies } from "@/lib/cookies";

import { CONSENT_COOKIE_KEY, getStoredConsent } from "./consent";

describe("getStoredConsent", () => {
  afterEach(() => {
    Cookies.remove(CONSENT_COOKIE_KEY);
  });

  it("returns null and removes a corrupt cookie instead of throwing", () => {
    Cookies.set(CONSENT_COOKIE_KEY, "{broken");

    expect(getStoredConsent()).toBeNull();
    expect(Cookies.get(CONSENT_COOKIE_KEY)).toBeUndefined();
  });

  it("returns null for a JSON null payload", () => {
    Cookies.set(CONSENT_COOKIE_KEY, "null");

    expect(getStoredConsent()).toBeNull();
  });
});
