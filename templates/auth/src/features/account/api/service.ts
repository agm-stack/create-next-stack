import { browserHttpClient } from "@/lib/http/browser-http-client";

import type { UpdateUserPreferencesRequest, UserPreferences } from "../types";

type UserPreferencesResponse = {
  data: UserPreferences
};

export async function deleteAccount(confirmEmail: string): Promise<void> {
  await browserHttpClient.post("/api/account/delete", { confirmEmail });
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const { data } = await browserHttpClient.get<UserPreferencesResponse>("/api/account/preferences");

  return data.data;
}

export async function updateUserPreferences(input: UpdateUserPreferencesRequest): Promise<UserPreferences> {
  const { data } = await browserHttpClient.patch<UserPreferencesResponse>("/api/account/preferences", input);

  return data.data;
}
