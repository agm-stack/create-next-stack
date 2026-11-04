"use client";

import { Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";

import { AuthForm } from "../components/auth-form";

export function SignUpPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
