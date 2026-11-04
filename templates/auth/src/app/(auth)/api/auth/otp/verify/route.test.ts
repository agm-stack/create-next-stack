import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  // @if legal
  recordTermsAcceptance: vi.fn(),
  // @endif
  verifyOtp: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/logger", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/api/rate-limit", () => ({ enforceRateLimit: vi.fn(), getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { verifyOtp: mocks.verifyOtp } }),
}));
// @if legal
vi.mock("@/features/legal/api/terms-acceptance", () => ({
  recordTermsAcceptance: mocks.recordTermsAcceptance,
}));
// @endif

import { POST } from "./route";

function verifyRequest(body: unknown) {
  return new Request("http://localhost/api/auth/otp/verify", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("POST /api/auth/otp/verify", () => {
  beforeEach(() => {
    // @if legal
    mocks.recordTermsAcceptance.mockResolvedValue(undefined);
    // @endif
    mocks.verifyOtp.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  });

  it("signs in with the emailed code and returns the sanitized redirect", async () => {
    const response = await POST(verifyRequest({ email: "user@example.com", redirectTo: "/dashboard/settings", token: "123456" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ redirectTo: "/dashboard/settings" });
    expect(mocks.verifyOtp).toHaveBeenCalledWith({ email: "user@example.com", token: "123456", type: "email" });
    // @if legal
    expect(mocks.recordTermsAcceptance).toHaveBeenCalledWith("user-1", "email-code");
    // @endif
  });

  it("never redirects off-site", async () => {
    const response = await POST(verifyRequest({ email: "user@example.com", redirectTo: "//evil.example", token: "123456" }));

    expect(await response.json()).toEqual({ redirectTo: "/dashboard" });
  });

  it("rejects codes that aren't 6 to 10 digits without calling Supabase", async () => {
    const response = await POST(verifyRequest({ email: "user@example.com", token: "12ab56" }));

    expect(response.status).toBe(400);
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it("passes on Supabase's status for a wrong or expired code", async () => {
    mocks.verifyOtp.mockResolvedValue({
      data: { user: null },
      error: { code: "otp_expired", message: "Token has expired or is invalid", status: 403 },
    });

    const response = await POST(verifyRequest({ email: "user@example.com", token: "123456" }));

    expect(response.status).toBe(403);
    // @if legal
    expect(mocks.recordTermsAcceptance).not.toHaveBeenCalled();
    // @endif
  });
});
