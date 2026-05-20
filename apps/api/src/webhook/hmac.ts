import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a Commerce7 HMAC-SHA256 webhook signature.
 *
 * Commerce7 sends the signature in the `X-C7-Signature` header as:
 *   `sha256=<64-char-hex-digest>`
 *
 * The digest is computed as:
 *   HMAC-SHA256(key = APP_CLIENT_SECRET, message = raw_request_body)
 *
 * @param rawBody  The raw request body (string or Buffer) — must be captured
 *                 before any JSON parsing, as parsing loses the original bytes.
 * @param header   Value of the `X-C7-Signature` request header.
 * @param secret   The app's client secret from the Commerce7 developer portal.
 * @returns        `true` if the signature is valid, `false` otherwise.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  header: string | undefined,
  secret: string,
): boolean {
  if (!header?.startsWith("sha256=")) return false;

  const receivedHex = header.slice(7);
  // SHA-256 digest is always 32 bytes = 64 hex characters
  if (receivedHex.length !== 64) return false;

  let received: Buffer;
  try {
    received = Buffer.from(receivedHex, "hex");
  } catch {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  // timingSafeEqual requires equal-length buffers; lengths are both 32 by construction above
  return timingSafeEqual(received, expected);
}
