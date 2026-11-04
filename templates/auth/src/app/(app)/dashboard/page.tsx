import { DashboardPage } from "@/features/dashboard/pages/dashboard";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    robots: { index: false, follow: false },
  };
}

export default DashboardPage;
