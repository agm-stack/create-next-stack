import { Cookies } from "@/lib/cookies";

export type UserConsent = {
  version: number,
  createdAt: number,
  updatedAt: number,
  hasGivenFullConsent: boolean,
  cookies: {
    analytics: boolean,
    marketing: boolean,
    functional: boolean,
    essential: boolean
  },
  identity: {
    userAgent: string
  }
};

export const CONSENT_COOKIE_KEY = "uc";
export const CONSENT_VERSION = 1;

// true -> accepted all cookies, false -> declines all cookies, object -> custom
export function storeConsent(userConsent: boolean | UserConsent["cookies"]) {
  let consent: UserConsent;
  if (typeof userConsent === "boolean") {
    consent = buildConsent(
      {
        analytics: userConsent,
        marketing: userConsent,
        functional: userConsent,
        essential: true,
      },
      userConsent
    );
  } else {
    consent = buildConsent(userConsent, false);
  }
  Cookies.set(CONSENT_COOKIE_KEY, JSON.stringify(consent), {
    expires: 365,
    sameSite: "strict",
  });
}

export function getStoredConsent() {
  const stored = Cookies.get(CONSENT_COOKIE_KEY);

  if (stored) {
    let parsed: unknown = null;

    try {
      parsed = JSON.parse(stored);
    } catch {
      // Corrupt cookie: handled as invalid below.
    }

    // Return consent if stored and valid
    if (validateConsentStructure(parsed) && checkConsentVersion(parsed)) {
      return parsed;
    } else {
      // Delete consent if invalid
      Cookies.remove(CONSENT_COOKIE_KEY);
    }
  }

  return null;
}

export function buildConsent(cookies: UserConsent["cookies"], hasGivenFullConsent?: boolean): UserConsent {
  return {
    version: CONSENT_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hasGivenFullConsent: !!hasGivenFullConsent,
    cookies,
    identity: {
      userAgent: navigator.userAgent,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateConsentStructure(obj: any): obj is UserConsent {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.version === "number" &&
    typeof obj.createdAt === "number" &&
    typeof obj.updatedAt === "number" &&
    typeof obj.hasGivenFullConsent === "boolean" &&
    obj.cookies != null &&
    typeof obj.cookies === "object" &&
    typeof obj.cookies.analytics === "boolean" &&
    typeof obj.cookies.marketing === "boolean" &&
    typeof obj.cookies.functional === "boolean" &&
    typeof obj.cookies.essential === "boolean" &&
    obj.identity != null &&
    typeof obj.identity === "object" &&
    typeof obj.identity.userAgent === "string"
  );
}

function checkConsentVersion(consent: UserConsent) {
  return consent.version === CONSENT_VERSION;
}

export function hasAnalyticsConsent() {
  const consent = getStoredConsent();
  return consent?.cookies?.analytics;
}
