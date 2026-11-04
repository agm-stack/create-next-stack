// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { HttpClientLoopGuardError, createHttpClient } from "./http";

import type { HttpClientLoopGuardConfig } from "./types";

function createFailingClient(loopGuard: Partial<HttpClientLoopGuardConfig>) {
  const client = createHttpClient({ loopGuard });
  const adapter = vi.fn(async (config: unknown) => {
    throw Object.assign(new Error("boom"), { config, isAxiosError: true, response: { status: 500 } });
  });
  client.getInstance().defaults.adapter = adapter as never;

  return { adapter, client };
}

describe("http client loop guard", () => {
  it("blocks an endpoint after consecutive failures without sending more requests", async () => {
    const { adapter, client } = createFailingClient({ maxConsecutiveFailures: 3 });

    for (let i = 0; i < 3; i += 1) {
      await expect(client.post("/api/items", {})).rejects.toThrow("boom");
    }

    await expect(client.post("/api/items", {})).rejects.toBeInstanceOf(HttpClientLoopGuardError);
    expect(adapter).toHaveBeenCalledTimes(3);
  });

  it("blocks an endpoint that is called too often in a short window", async () => {
    const { adapter, client } = createFailingClient({ maxConsecutiveFailures: 100, maxRequests: 5 });

    for (let i = 0; i < 5; i += 1) {
      await expect(client.get("/api/items")).rejects.toThrow("boom");
    }

    await expect(client.get("/api/items")).rejects.toBeInstanceOf(HttpClientLoopGuardError);
    expect(adapter).toHaveBeenCalledTimes(5);
  });

  it("tracks endpoints independently", async () => {
    const { client } = createFailingClient({ maxConsecutiveFailures: 1 });

    await expect(client.post("/api/a", {})).rejects.toThrow("boom");
    await expect(client.post("/api/a", {})).rejects.toBeInstanceOf(HttpClientLoopGuardError);
    await expect(client.post("/api/b", {})).rejects.toThrow("boom");
  });
});
