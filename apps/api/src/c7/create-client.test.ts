import { describe, expect, it } from "vitest";

import { createCommerce7Client } from "./create-client.js";
import { HttpCommerce7Client } from "./http-client.js";
import { MockCommerce7Client } from "./mock-client.js";
import type { Env } from "../env.js";

function makeEnv(override: Partial<Env>): Env {
  return {
    NODE_ENV: "test",
    PORT: 3001,
    DATABASE_URL: undefined,
    APP_BASE_URL: undefined,
    OAUTH_REDIRECT_URL: undefined,
    COMMERCE7_CLIENT_ID: undefined,
    COMMERCE7_CLIENT_SECRET: undefined,
    COMMERCE7_API_BASE: "https://api.commerce7.com/v1",
    COMMERCE7_USE_MOCK: undefined,
    WEBHOOK_BASIC_USER: undefined,
    WEBHOOK_BASIC_PASSWORD: undefined,
    INTERNAL_API_TOKEN: undefined,
    LIFECYCLE_BASIC_USER: undefined,
    LIFECYCLE_BASIC_PASSWORD: undefined,
    ...override,
  } as Env;
}

describe("createCommerce7Client", () => {
  it("uses mock when credentials missing", () => {
    const c = createCommerce7Client(makeEnv({}));
    expect(c).toBeInstanceOf(MockCommerce7Client);
  });

  it("uses HTTP when id+secret set and not forced mock", () => {
    const c = createCommerce7Client(
      makeEnv({
        COMMERCE7_CLIENT_ID: "app-id",
        COMMERCE7_CLIENT_SECRET: "secret",
      }),
    );
    expect(c).toBeInstanceOf(HttpCommerce7Client);
  });

  it("forces mock when COMMERCE7_USE_MOCK=1", () => {
    const c = createCommerce7Client(
      makeEnv({
        COMMERCE7_CLIENT_ID: "app-id",
        COMMERCE7_CLIENT_SECRET: "secret",
        COMMERCE7_USE_MOCK: "1",
      }),
    );
    expect(c).toBeInstanceOf(MockCommerce7Client);
  });

  it("throws in production without credentials", () => {
    expect(() =>
      createCommerce7Client(
        makeEnv({
          NODE_ENV: "production",
          COMMERCE7_CLIENT_ID: undefined,
          COMMERCE7_CLIENT_SECRET: undefined,
        }),
      ),
    ).toThrow(/required in production/);
  });
});
