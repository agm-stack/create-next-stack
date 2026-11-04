export const appConfig: AppConfig = {
  environment: (process.env.NEXT_PUBLIC_APP_ENVIRONMENT || "local") as Environment,
  // @if supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  },
  // @endif
  httpClient: {
    requestTimeout: 15000,
  },
  // @if react-query
  queries: {
    client: {
      staleTime: Infinity,
      retries: 1,
    },
    server: {
      staleTime: Infinity,
      retries: 1,
      retryDelay: 250,
    },
  },
  // @endif
  // @if auth
  captcha: {
    // Set NEXT_PUBLIC_CAPTCHA_ENABLED=true in production (also enable it in Supabase Auth).
    enabled: ["true", "1"].includes((process.env.NEXT_PUBLIC_CAPTCHA_ENABLED ?? "").trim().toLowerCase()),
    siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "",
  },
  // @endif
  site: {
    url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:__DEV_PORT__").replace(/\/+$/, ""),
  },
};

type Environment = "local" | "preview" | "production";

export type AppConfig = {
  environment: Environment,
  // @if supabase
  supabase: {
    url: string,
    publishableKey: string
  },
  // @endif
  httpClient: {
    requestTimeout?: number
  },
  // @if react-query
  queries: {
    client: {
      staleTime: number,
      retries: number,
      retryDelay?: number
    },
    server: {
      staleTime: number,
      retries: number,
      retryDelay?: number
    }
  },
  // @endif
  // @if auth
  captcha: {
    enabled: boolean,
    siteKey: string
  },
  // @endif
  site: {
    url: string
  }
};
