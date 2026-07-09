import type { Env } from "../env.js";

/** Whether order reads go through the HTTP client or the in-repo mock (see `createCommerce7Client`). */
export function commerce7DataSourceLabel(env: Env): "mock" | "http" {
  if (env.COMMERCE7_USE_MOCK === "1") {
    return "mock";
  }
  const id = env.COMMERCE7_CLIENT_ID;
  const secret = env.COMMERCE7_CLIENT_SECRET;
  if (id?.length && secret?.length) {
    return "http";
  }
  return "mock";
}
