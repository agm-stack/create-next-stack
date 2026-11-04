import { createAccountContext } from "@/features/account/api/context";
import { deleteAccount, deleteAccountRequestSchema } from "@/features/account/api/delete-account";
import { routeHandler } from "@/lib/api/route-handler";

/** Permanently deletes the signed-in account after the user retypes their email. */
export const POST = routeHandler(
  {
    createContext: createAccountContext,
    rateLimit: "write",
    schema: deleteAccountRequestSchema,
  },
  async ({ context, data }) => {
    await deleteAccount({
      confirmEmail: data.confirmEmail,
      deleteUser: context.deleteUser,
      user: context.user,
    });

    // The user's sessions are gone with the account; this only clears the
    // auth cookies. The 401 Supabase returns for the dead session is ignored.
    await context.supabase.auth.signOut({ scope: "local" });

    return new Response(null, { status: 204 });
  },
);
