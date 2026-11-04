import { mutationOptions } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@/lib/react-query";
import { routes } from "@/utils/routes";

import { signInWithGoogle, signInWithMagicLink, signOut, verifyEmailCode } from "./service";

import type { Route } from "next";

export const authMutations = {
  signInWithMagicLink: () =>
    mutationOptions({
      mutationKey: ["auth", "sign-in", "magic-link"],
      mutationFn: (payload: { email: string, captchaToken?: string, redirectTo?: string | Route }) =>
        signInWithMagicLink(payload),
    }),
  signInWithGoogle: () =>
    mutationOptions({
      mutationKey: ["auth", "sign-in", "google"],
      mutationFn: (payload: { redirectTo?: string | Route }) => signInWithGoogle(payload),
    }),
  verifyEmailCode: () =>
    mutationOptions({
      mutationKey: ["auth", "sign-in", "email-code"],
      mutationFn: (payload: { email: string, token: string, redirectTo?: string | Route }) =>
        verifyEmailCode(payload),
    }),
  signOut: () =>
    mutationOptions({
      mutationKey: ["auth", "sign-out"],
      mutationFn: () => signOut(),
    }),
};

export function useSignInWithMagicLink() {
  return useMutation(authMutations.signInWithMagicLink());
}

export function useSignInWithGoogle() {
  return useMutation({
    ...authMutations.signInWithGoogle(),
    onSuccess: (data) => {
      if (data.url) {
        window.location.assign(data.url);
      }
    },
  });
}

export function useVerifyEmailCode() {
  return useMutation({
    ...authMutations.verifyEmailCode(),
    // A full page load so the proxy, server components and useUser all see
    // the new session cookies. The server already sanitized the path.
    onSuccess: (data) => {
      window.location.assign(data.redirectTo);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    ...authMutations.signOut(),
    onSuccess: () => {
      queryClient.clear();
      router.push(routes.home);
      router.refresh();
    },
  });
}
