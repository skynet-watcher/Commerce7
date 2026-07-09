import { describe, expect, it, vi, afterEach } from "vitest";

import { fetchWithBackoff } from "./fetch-with-backoff.js";

describe("fetchWithBackoff", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns response when not rate limited", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const res = await fetchWithBackoff("https://example.com/test", {});
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on 429 then succeeds", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const res = await fetchWithBackoff("https://example.com/test", {}, { initialDelayMs: 2, maxAttempts: 3 });
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retries transient fetch failures", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const res = await fetchWithBackoff("https://example.com/test", {}, { initialDelayMs: 2, maxAttempts: 3 });
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
