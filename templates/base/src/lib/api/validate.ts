import "server-only";
import { z } from "zod";

import { HTTP_STATUS_CODES } from "@/lib/http";

import { ApiError } from "./errors";

const uuidSchema = z.uuid();

/** Largest JSON body any API route accepts unless it opts in to more. */
export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

/** A 400 `ApiError`, so route handlers return one error shape for every failure. */
export class ValidationError extends ApiError {
  constructor(details: unknown) {
    super(HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", details);
    this.name = "ValidationError";
  }
}

function zodIssues(err: z.ZodError) {
  return z.treeifyError(err);
}

export async function validate<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<z.infer<TSchema>> {
  let body: unknown;

  const declaredLength = Number(request.headers.get("content-length"));

  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    throw ApiError.payloadTooLarge();
  }

  const text = await request.text();

  // Content-Length can be absent or wrong, so check the real size too.
  if (new TextEncoder().encode(text).length > maxBodyBytes) {
    throw ApiError.payloadTooLarge();
  }

  try {
    body = JSON.parse(text);
  } catch {
    throw new ValidationError({ error: "Invalid JSON" });
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ValidationError({
      error: "Invalid request body",
      issues: zodIssues(result.error),
    });
  }

  return result.data;
}

export function validatePathUuid(request: Request, fromEnd = 0): string {
  const pathnameParts = new URL(request.url).pathname.split("/").filter(Boolean);
  const maybeUuid = pathnameParts[pathnameParts.length - 1 - fromEnd];
  if (!maybeUuid) {
    throw new ValidationError({ error: "Invalid path UUID" });
  }
  const parsed = uuidSchema.safeParse(maybeUuid);
  if (!parsed.success) {
    throw new ValidationError({ error: "Invalid path UUID", issues: zodIssues(parsed.error) });
  }
  return parsed.data;
}
