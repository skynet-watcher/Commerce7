import { describe, expect, it, vi } from "vitest";

import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemoryOAuthSessionStore } from "./oauth-store.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("GET /oauth/callback", () => {
  it("persists stub when tenantId present", async () => {
    const store = new InMemoryOAuthSessionStore();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      oauth: { store },
    });
    const res = await app.request(
      "http://localhost/oauth/callback?tenantId=wine&code=abc&error=",
    );
    expect(res.status).toBe(200);
    const row = await store.getStub("wine");
    expect(row?.code).toBe("abc");
  });

  it("exchanges code and stores token metadata when configured", async () => {
    const store = new InMemoryOAuthSessionStore();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "access-123",
          refresh_token: "refresh-123",
          expires_in: 3600,
          token_type: "Bearer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      oauth: {
        store,
        exchange: {
          tokenUrl: "https://commerce7.example/oauth/token",
          clientId: "app-id",
          clientSecret: "app-secret",
          redirectUrl: "https://app.example/oauth/callback",
          fetchImpl,
        },
      },
    });
    const res = await app.request(
      "http://localhost/oauth/callback?tenantId=wine&code=abc",
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { exchangeStatus: string }).exchangeStatus).toBe("exchanged");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const token = await store.getTokenSession("wine");
    expect(token?.accessToken).toBe("access-123");
    expect(token?.refreshToken).toBe("refresh-123");
    expect(token?.expiresAt).toBeTruthy();
  });

  it("reports OAuth status without exposing tokens", async () => {
    const store = new InMemoryOAuthSessionStore();
    await store.saveCallbackStub({ tenantId: "wine", code: "abc", error: null, raw: {} });
    await store.saveTokenSession({
      tenantId: "wine",
      accessToken: "secret-access",
      refreshToken: "secret-refresh",
      expiresAt: new Date("2026-05-18T00:00:00.000Z"),
      raw: { access_token: "secret-access" },
    });
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      oauth: { store },
    });
    const res = await app.request("http://localhost/oauth/status?tenantId=wine");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      hasAccessToken: boolean;
      hasRefreshToken: boolean;
      accessToken?: string;
    };
    expect(body.hasAccessToken).toBe(true);
    expect(body.hasRefreshToken).toBe(true);
    expect(body.accessToken).toBeUndefined();
  });
});
