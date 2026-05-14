import type { Env } from "../env.js";
import { HttpCommerce7Client } from "./http-client.js";
import { MockCommerce7Client } from "./mock-client.js";
import type { Commerce7Client } from "./types.js";

/**
 * Live client when **both** `COMMERCE7_CLIENT_ID` and `COMMERCE7_CLIENT_SECRET` are set
 * and `COMMERCE7_USE_MOCK` is not `1`. Otherwise uses {@link MockCommerce7Client.twoPageDemo}
 * (development / tests only — production must supply credentials).
 */
export function createCommerce7Client(env: Env): Commerce7Client {
  if (env.COMMERCE7_USE_MOCK === "1") {
    if (env.NODE_ENV === "production") {
      throw new Error("COMMERCE7_USE_MOCK=1 is not allowed when NODE_ENV=production");
    }
    return MockCommerce7Client.twoPageDemo();
  }

  const id = env.COMMERCE7_CLIENT_ID;
  const secret = env.COMMERCE7_CLIENT_SECRET;
  if (!id?.length || !secret?.length) {
    if (env.NODE_ENV === "production") {
      throw new Error("COMMERCE7_CLIENT_ID and COMMERCE7_CLIENT_SECRET are required in production");
    }
    return MockCommerce7Client.twoPageDemo();
  }

  return new HttpCommerce7Client({
    baseUrl: env.COMMERCE7_API_BASE,
    appId: id,
    appSecret: secret,
  });
}
