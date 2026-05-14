import { describe, expect, it } from "vitest";

import { verifyInternalBearer } from "./internal-bearer.js";

describe("verifyInternalBearer", () => {
  it("accepts exact Bearer token", () => {
    expect(verifyInternalBearer("secret", "Bearer secret")).toBe(true);
  });

  it("rejects wrong token and prefix", () => {
    expect(verifyInternalBearer("secret", "Bearer other")).toBe(false);
    expect(verifyInternalBearer("secret", "Basic x")).toBe(false);
    expect(verifyInternalBearer("secret", undefined)).toBe(false);
  });
});
