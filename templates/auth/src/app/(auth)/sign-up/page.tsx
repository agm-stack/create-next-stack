import { SignUpPage } from "@/features/auth/pages/sign-up";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    robots: { index: false, follow: false },
  };
}

export default SignUpPage;
