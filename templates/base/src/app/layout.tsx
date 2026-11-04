import { font } from "@/components/common/fonts";
import { Providers } from "@/components/common/providers";
import { appConfig } from "@/config";
import { getText } from "@/i18n/get-text";
import { brand } from "@/utils/brand";

import "@/styles/index.css";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getText("common");

  return {
    applicationName: brand.name,
    description: t("description"),
    metadataBase: new URL(appConfig.site.url),
    openGraph: {
      description: t("description"),
      siteName: brand.name,
      title: brand.name,
      type: "website",
    },
    title: {
      default: brand.name,
      template: `%s | ${brand.name}`,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={`${font.variable} font-sans`} lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
