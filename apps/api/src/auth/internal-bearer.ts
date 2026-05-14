import { timingSafeEqual } from "node:crypto";

/** Optional Bearer gate for operator-only routes (sync, reconcile, analytics). */
export function verifyInternalBearer(expected: string, authorizationHeader: string | undefined): boolean {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return false;
  }
  const provided = authorizationHeader.slice(7);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
