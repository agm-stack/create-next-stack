// @if i18n
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { formats } from "@/i18n/formats";

// @endif
import { ClientProviders } from "./client-providers";

// @if i18n
export async function Providers({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider formats={formats} messages={messages}>
      <ClientProviders>{children}</ClientProviders>
    </NextIntlClientProvider>
  );
}
// @else
export function Providers({ children }: { children: React.ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
// @endif
