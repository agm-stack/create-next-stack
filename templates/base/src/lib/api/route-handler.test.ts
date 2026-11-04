import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { ApiError } from "./errors";
import { routeHandler } from "./route-handler";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/logger", () => ({ Logger: { error: vi.fn() } }));

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    body: typeof body === "string" ? body : JSON.stringify(body),
    method: "POST",
  });
}

describe("routeHandler", () => {
  const schema = z.object({ name: z.string() });

  it("passes validated data and context to the handler", async () => {
    const handler = routeHandler({ createContext: () => ({ userId: "u1" }), schema }, async ({ context, data }) => {
      return Response.json({ baseUrl: context.baseUrl, name: data.name, userId: context.userId });
    });

    const response = await handler(jsonRequest({ name: "Ada" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ baseUrl: "http://localhost", name: "Ada", userId: "u1" });
  });

  it("returns 400 with the shared error shape for invalid bodies", async () => {
    const handler = routeHandler({ schema }, async () => Response.json({}));

    const invalidJson = await handler(jsonRequest("{nope"));
    const invalidShape = await handler(jsonRequest({ name: 1 }));

    expect(invalidJson.status).toBe(400);
    expect(await invalidJson.json()).toMatchObject({ error: "Validation Error", details: { error: "Invalid JSON" } });
    expect(invalidShape.status).toBe(400);
  });

  it("returns 413 for bodies over the size limit", async () => {
    const handler = routeHandler({ maxBodyBytes: 16, schema }, async () => Response.json({}));

    const response = await handler(jsonRequest({ name: "a".repeat(100) }));

    expect(response.status).toBe(413);
  });

  it("maps ApiError to its status", async () => {
    const handler = routeHandler({}, async () => {
      throw ApiError.unauthorized();
    });

    const response = await handler(new Request("http://localhost/api/test"));

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "Authentication required" });
  });

  it("hides unknown errors behind a 500", async () => {
    const handler = routeHandler({}, async () => {
      throw new Error("secret detail");
    });

    const response = await handler(new Request("http://localhost/api/test"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal Server Error" });
  });
});
