import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyWebhookSignature } from "./signature.js";

describe("verifyWebhookSignature", () => {
  it("accepts a matching hex HMAC signature", () => {
    const raw = JSON.stringify({ tenantId: "t1", payload: { id: "o1" } });
    const secret = "super-secret";
    const signature = createHmac("sha256", secret).update(raw, "utf8").digest("hex");

    expect(
      verifyWebhookSignature(raw, signature, {
        secret,
        headerName: "x-commerce7-signature",
        algorithm: "sha256",
      }),
    ).toBe(true);
  });

  it("accepts a prefixed HMAC signature", () => {
    const raw = "{}";
    const secret = "super-secret";
    const signature = createHmac("sha256", secret).update(raw, "utf8").digest("hex");

    expect(
      verifyWebhookSignature(raw, `sha256=${signature}`, {
        secret,
        headerName: "x-commerce7-signature",
        algorithm: "sha256",
      }),
    ).toBe(true);
  });

  it("rejects missing or mismatched signatures", () => {
    expect(
      verifyWebhookSignature("{}", undefined, {
        secret: "super-secret",
        headerName: "x-commerce7-signature",
        algorithm: "sha256",
      }),
    ).toBe(false);
    expect(
      verifyWebhookSignature("{}", "sha256=deadbeef", {
        secret: "super-secret",
        headerName: "x-commerce7-signature",
        algorithm: "sha256",
      }),
    ).toBe(false);
  });
});
