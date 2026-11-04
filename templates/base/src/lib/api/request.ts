/**
 * Public origin of the current request. Behind a proxy the forwarded headers are
 * authoritative; otherwise the origin of the request URL is used.
 */
export function getRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();

  if (!forwardedHost) {
    return url.origin;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || url.protocol.replace(":", "");

  return `${protocol}://${forwardedHost}`;
}

/**
 * Accepts only same-site absolute paths. A value such as "//host" would be read
 * as a protocol-relative URL, so it falls back to the provided default.
 */
export function sanitizeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  return value;
}
