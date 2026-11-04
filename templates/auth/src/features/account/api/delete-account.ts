import "server-only";

import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { HTTP_STATUS_CODES } from "@/lib/http";
import { Logger } from "@/lib/logger";

import { isAccountDeleteConfirmed } from "../delete-confirmation";

export const deleteAccountRequestSchema = z.object({
  confirmEmail: z.string().trim()
    .min(1)
    .max(320),
});

export type DeleteAccountRequest = z.infer<typeof deleteAccountRequestSchema>;

export const ACCOUNT_DELETE_CONFIRMATION_MISMATCH = "confirmation-mismatch";

/**
 * Permanently deletes the signed-in user. Rows that reference auth.users with
 * `on delete cascade` (preferences, terms acceptances) are removed with it.
 */
export async function deleteAccount(input: {
  confirmEmail: string,
  deleteUser: (userId: string) => Promise<{ error: unknown }>,
  user: { id: string, email?: string | null }
}): Promise<void> {
  if (!isAccountDeleteConfirmed(input.confirmEmail, input.user.email)) {
    throw ApiError.badRequest("Confirmation does not match the account email", {
      code: ACCOUNT_DELETE_CONFIRMATION_MISMATCH,
    });
  }

  const { error } = await input.deleteUser(input.user.id);

  if (error) {
    Logger.error("Account deletion failed", { data: { error, userId: input.user.id } });
    throw new ApiError(HTTP_STATUS_CODES.SERVER_ERROR, "Unable to delete account");
  }

  Logger.info("Account deleted", { data: { userId: input.user.id } });
}
