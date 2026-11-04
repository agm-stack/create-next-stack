import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("server-only", () => ({}));

import { ApiError } from "@/lib/api/errors";

import { isAccountDeleteConfirmed } from "../delete-confirmation";

import { ACCOUNT_DELETE_CONFIRMATION_MISMATCH, deleteAccount } from "./delete-account";

const USER = { email: "person@example.com", id: "33333333-3333-4333-8333-333333333333" };

describe("isAccountDeleteConfirmed", () => {
  it("matches the account email ignoring case and surrounding spaces", () => {
    expect(isAccountDeleteConfirmed("  Person@Example.com ", USER.email)).toBe(true);
  });

  it("rejects a different email or an account without one", () => {
    expect(isAccountDeleteConfirmed("other@example.com", USER.email)).toBe(false);
    expect(isAccountDeleteConfirmed("", USER.email)).toBe(false);
    expect(isAccountDeleteConfirmed("person@example.com", null)).toBe(false);
  });
});

describe("deleteAccount", () => {
  const deleteUser = vi.fn<(userId: string) => Promise<{ error: unknown }>>();

  beforeEach(() => {
    deleteUser.mockReset();
    deleteUser.mockResolvedValue({ error: null });
  });

  it("deletes the user when the confirmation matches", async () => {
    await deleteAccount({ confirmEmail: "PERSON@example.com", deleteUser, user: USER });

    expect(deleteUser).toHaveBeenCalledWith(USER.id);
  });

  it("rejects a mismatched confirmation without deleting anything", async () => {
    const result = deleteAccount({ confirmEmail: "other@example.com", deleteUser, user: USER });

    await expect(result).rejects.toMatchObject({
      details: { code: ACCOUNT_DELETE_CONFIRMATION_MISMATCH },
      status: 400,
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("fails with a server error when Supabase cannot delete the user", async () => {
    deleteUser.mockResolvedValue({ error: new Error("boom") });

    const result = deleteAccount({ confirmEmail: USER.email, deleteUser, user: USER });

    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toMatchObject({ status: 500 });
  });
});
