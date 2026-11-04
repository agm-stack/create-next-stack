import { NextResponse } from "next/server";

import { createAccountContext } from "@/features/account/api/context";
import { updateUserPreferencesSchema } from "@/features/account/types";
import { routeHandler } from "@/lib/api/route-handler";

import type { UserPreferences } from "@/features/account/types";

/** The signed-in user's known preferences. */
export const GET = routeHandler(
  {
    createContext: createAccountContext,
    rateLimit: "standard",
  },
  async ({ context }) => {
    const data: UserPreferences = await context.preferences.list(context.userId);

    return NextResponse.json({ data });
  },
);

/** Updates any subset of known preferences and returns the stored result. */
export const PATCH = routeHandler(
  {
    createContext: createAccountContext,
    rateLimit: "standard",
    schema: updateUserPreferencesSchema,
  },
  async ({ context, data: input }) => {
    await context.preferences.update(context.userId, input);
    const data: UserPreferences = await context.preferences.list(context.userId);

    return NextResponse.json({ data });
  },
);
