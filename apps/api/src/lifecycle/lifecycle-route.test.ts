import { describe, expect, it } from "vitest";

import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemoryAppInstallStore } from "./install-store.js";
import { parseTypedPayload } from "./parse-payload.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("parseTypedPayload", () => {
  it("parses json and x-www-form-urlencoded", () => {
    expect(parseTypedPayload('{"tenantId":"a","x":1}')).toEqual({ tenantId: "a", x: 1 });
    expect(parseTypedPayload("tenantId=b&firstName=c")).toEqual({ tenantId: "b", firstName: "c" });
  });
});

describe("POST /lifecycle/install and /uninstall", () => {
  it("persists install, client settings in raw, and uninstall timestamp", async () => {
    const store = new InMemoryAppInstallStore();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      lifecycle: { store },
    });

    const inst = await app.request("http://localhost/lifecycle/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "wine-co",
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        mode: "live",
      }),
    });
    expect(inst.status).toBe(200);

    const row = await store.getInstall("wine-co");
    expect(row?.installerEmail).toBe("a@example.com");
    expect(row?.raw).toMatchObject({ mode: "live" });
    expect(row?.uninstalledAt).toBeNull();

    const un = await app.request("http://localhost/lifecycle/uninstall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "wine-co" }),
    });
    expect(un.status).toBe(200);
    expect((await store.getInstall("wine-co"))?.uninstalledAt).not.toBeNull();
  });

  it("accepts form-encoded install bodies", async () => {
    const store = new InMemoryAppInstallStore();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      lifecycle: { store },
    });
    const res = await app.request("http://localhost/lifecycle/install", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "tenantId=form-tenant&email=shop%40test.com",
    });
    expect(res.status).toBe(200);
    expect((await store.getInstall("form-tenant"))?.installerEmail).toBe("shop@test.com");
  });

  it("returns 401 when lifecycle Basic auth is configured and header missing", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      lifecycle: {
        store: new InMemoryAppInstallStore(),
        basicAuth: { user: "c7", password: "secret" },
      },
    });
    const res = await app.request("http://localhost/lifecycle/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t" }),
    });
    expect(res.status).toBe(401);
  });

  it("accepts valid Basic auth when configured", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      lifecycle: {
        store: new InMemoryAppInstallStore(),
        basicAuth: { user: "u", password: "p" },
      },
    });
    const basic = Buffer.from("u:p").toString("base64");
    const res = await app.request("http://localhost/lifecycle/install", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basic}`,
      },
      body: JSON.stringify({ tenantId: "auth-ok" }),
    });
    expect(res.status).toBe(200);
  });
});
