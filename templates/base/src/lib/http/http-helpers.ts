import { isAxiosError } from "axios";

import { HTTP_STATUS_CODES } from "./http-status-codes";

export const isHttpClientError = isAxiosError;
export const isUnauthorizedError = (err?: unknown) => isHttpClientError(err) && err.response?.status === HTTP_STATUS_CODES.UNAUTHORIZED;

export type HttpErrorCategory =
  | "badRequest"
  | "conflict"
  | "forbidden"
  | "generic"
  | "limitReached"
  | "network"
  | "notFound"
  | "rateLimit"
  | "server"
  | "unauthorized"
  | "validation";

/** API errors shaped `{ error, details: { code: "...-limit-reached" } }`. */
function isLimitReachedCode(data: unknown): boolean {
  const code = (data as { details?: { code?: unknown } } | null)?.details?.code;

  return typeof code === "string" && code.endsWith("-limit-reached");
}

export function getHttpErrorCategory(error: unknown): HttpErrorCategory {
  if (!isHttpClientError(error)) {
    return "generic";
  }

  const status = error.response?.status;

  if (!status) {
    return "network";
  }

  if (status === HTTP_STATUS_CODES.BAD_REQUEST) {
    return "badRequest";
  }

  if (status === HTTP_STATUS_CODES.UNAUTHORIZED) {
    return "unauthorized";
  }

  if (status === HTTP_STATUS_CODES.FORBIDDEN) {
    return isLimitReachedCode(error.response?.data) ? "limitReached" : "forbidden";
  }

  if (status === HTTP_STATUS_CODES.NOT_FOUND) {
    return "notFound";
  }

  if (status === HTTP_STATUS_CODES.CONFLICT) {
    return "conflict";
  }

  if (status === HTTP_STATUS_CODES.VALIDATION_ERROR) {
    return "validation";
  }

  if (status === HTTP_STATUS_CODES.TOO_MANY_REQUESTS) {
    return "rateLimit";
  }

  if (status >= HTTP_STATUS_CODES.SERVER_ERROR) {
    return "server";
  }

  return "generic";
}