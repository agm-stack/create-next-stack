import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { legalData } from "../legal-data";

export type TermsAcceptanceSource = "auth-callback" | "email-code";

export async function recordTermsAcceptance(
  userId: string,
  source: TermsAcceptanceSource = "auth-callback"
) {
  const { error } = await createAdminClient()
    .from("terms_acceptances")
    .upsert(
      {
        acceptance_source: source,
        terms_version: legalData.termsVersion,
        user_id: userId,
      },
      {
        ignoreDuplicates: true,
        onConflict: "user_id,terms_version",
      }
    );

  if (error) {
    throw error;
  }
}
