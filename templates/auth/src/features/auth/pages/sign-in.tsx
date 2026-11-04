"use client";

import { Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";

import { AuthForm } from "../components/auth-form";

export function SignInPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
