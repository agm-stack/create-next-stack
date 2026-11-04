import { SignInPage } from "@/features/auth/pages/sign-in";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    robots: { index: false, follow: false },
  };
}

export default SignInPage;
