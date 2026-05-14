import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { loadEnv } from "./env.js";

const env = loadEnv();

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.APP_BASE_URL ?? "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "@commerce7/api",
    env: env.NODE_ENV,
  }),
);

app.get("/", (c) =>
  c.json({
    message: "Commerce7 integration API — add OAuth callback + webhook routes next.",
    docs: "See docs/EXECUTION-PLAYBOOK.md",
  }),
);

// Placeholders — implement per docs/developer/app-platform/authenticate-app.md
app.get("/oauth/callback", (c) => {
  const q = c.req.query();
  return c.json({ step: "oauth-callback", receivedQueryKeys: Object.keys(q) });
});

app.post("/webhooks/commerce7", async (c) => {
  const raw = await c.req.text();
  return c.json({
    step: "webhook-received",
    bytes: raw.length,
    hint: "Verify signature + parse JSON per docs/developer/app-platform/webhooks.md",
  });
});

const port = env.PORT;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`@commerce7/api listening on http://localhost:${info.port}`);
});
