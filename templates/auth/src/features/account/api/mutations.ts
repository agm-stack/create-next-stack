import { mutationOptions } from "@tanstack/react-query";

import { deleteAccount, updateUserPreferences } from "./service";

import type { UpdateUserPreferencesRequest } from "../types";

export const accountMutations = {
  delete: () =>
    mutationOptions({
      mutationKey: ["account", "delete"],
      mutationFn: (confirmEmail: string) => deleteAccount(confirmEmail),
    }),
  updatePreferences: () =>
    mutationOptions({
      mutationKey: ["account", "preferences", "update"],
      mutationFn: (input: UpdateUserPreferencesRequest) => updateUserPreferences(input),
    }),
};
