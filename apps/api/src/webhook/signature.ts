import { createHmac, timingSafeEqual } from "node:crypto";

export type WebhookSignatureConfig = {
  secret: string;
  headerName: string;
  algorithm: "sha256" | "sha1" | "sha512";
};

function normalizeSignature(value: string): string {
  const trimmed = value.trim();
  const prefixed = trimmed.match(/^(sha256|sha1|sha512)=([a-fA-F0-9]+)$/);
  return (prefixed?.[2] ?? trimmed).toLowerCase();
}

export function verifyWebhookSignature(
  rawBody: string,
  headerValue: string | undefined,
  config: WebhookSignatureConfig,
): boolean {
  if (!headerValue) {
    return false;
  }

  const received = normalizeSignature(headerValue);
  if (!/^[a-f0-9]+$/.test(received)) {
    return false;
  }

  const expected = createHmac(config.algorithm, config.secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(received, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
