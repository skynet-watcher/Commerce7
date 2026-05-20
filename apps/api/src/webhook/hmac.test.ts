import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyWebhookSignature } from "./hmac.js";

const SECRET = "test-secret-key";

function sign(body: string, secret = SECRET): string {
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  return `sha256=${digest}`;
}

describe("verifyWebhookSignature", () => {
  it("returns true for a valid signature", () => {
    const body = JSON.stringify({ object: "Order", action: "Update", tenantId: "t1" });
    expect(verifyWebhookSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("returns false when the header is missing", () => {
    const body = JSON.stringify({ object: "Order" });
    expect(verifyWebhookSignature(body, undefined, SECRET)).toBe(false);
  });

  it("returns false when the secret is wrong", () => {
    const body = JSON.stringify({ object: "Order" });
    const header = sign(body, "wrong-secret");
    expect(verifyWebhookSignature(body, header, SECRET)).toBe(false);
  });

  it("returns false when the body has been tampered with", () => {
    const originalBody = JSON.stringify({ object: "Order", action: "Update" });
    const tamperedBody = JSON.stringify({ object: "Order", action: "Delete" });
    const header = sign(originalBody);
    expect(verifyWebhookSignature(tamperedBody, header, SECRET)).toBe(false);
  });

  it("returns false for a malformed header (no sha256= prefix)", () => {
    const body = "{}";
    expect(verifyWebhookSignature(body, "notavalidheader", SECRET)).toBe(false);
  });

  it("works with Buffer input as well as string", () => {
    const body = '{"object":"Order"}';
    const buf = Buffer.from(body, "utf8");
    expect(verifyWebhookSignature(buf, sign(body), SECRET)).toBe(true);
  });
});
