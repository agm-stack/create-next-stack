import type { HttpClient, HttpClientConfig } from "@/lib/http";

export type ServiceOptions = {
  httpClient: HttpClient,
  httpClientConfig?: HttpClientConfig
};
