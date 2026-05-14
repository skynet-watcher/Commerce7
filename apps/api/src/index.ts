import { serve } from "@hono/node-server";

import { createApp } from "./create-app.js";
import { loadEnv } from "./env.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";

const env = loadEnv();
const webhookStore = new InMemoryWebhookDeliveryStore();
const app = createApp({ env, webhookStore });

const port = env.PORT;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`@commerce7/api listening on http://localhost:${info.port}`);
});
