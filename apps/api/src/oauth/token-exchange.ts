import { z } from "zod";

import { fetchWithBackoff } from "../http/fetch-with-backoff.js";

const oauthTokenResponseSchema = z
  .object({
    access_token: z.string().min(1).optional(),
    refresh_token: z.string().min(1).optional(),
    expires_in: z.number().int().positive().optional(),
    token_type: z.string().optional(),
    scope: z.string().optional(),
  })
  .passthrough();

export type OAuthTokenExchangeConfig = {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUrl?: string;
  fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>;
};

export type OAuthTokenExchangeResult = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  raw: Record<string, unknown>;
};

export async function exchangeOAuthCode(
  config: OAuthTokenExchangeConfig,
  code: string,
): Promise<OAuthTokenExchangeResult> {
  const form = new URLSearchParams();
  form.set("grant_type", "authorization_code");
  form.set("code", code);
  form.set("client_id", config.clientId);
  form.set("client_secret", config.clientSecret);
  if (config.redirectUrl) {
    form.set("redirect_uri", config.redirectUrl);
  }

  const fetchImpl = config.fetchImpl ?? ((input, init) => fetchWithBackoff(input, init));
  const res = await fetchImpl(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const text = await res.text().catch(() => "");
  let body: unknown = {};
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { message: text.slice(0, 500) };
    }
  }

  if (!res.ok) {
    throw new Error(`OAuth token exchange failed: HTTP ${res.status} ${text.slice(0, 200)}`);
  }

  const parsed = oauthTokenResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("OAuth token exchange: unexpected JSON shape");
  }

  const expiresAt = parsed.data.expires_in
    ? new Date(Date.now() + parsed.data.expires_in * 1000)
    : null;

  return {
    accessToken: parsed.data.access_token ?? null,
    refreshToken: parsed.data.refresh_token ?? null,
    expiresAt,
    raw: parsed.data,
  };
}
