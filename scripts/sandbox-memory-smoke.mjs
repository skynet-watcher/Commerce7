#!/usr/bin/env node

const apiBase = (process.env.C7_API_TUNNEL ?? "https://width-andrea-leaders-stayed.trycloudflare.com").replace(
  /\/+$/,
  "",
);
const webBase = (process.env.C7_WEB_TUNNEL ?? "https://bbs-drug-totally-requires.trycloudflare.com").replace(
  /\/+$/,
  "",
);
const tenantId = process.env.C7_TENANT_ID ?? "sandbox-eric-jacobsen1";
const runId = process.env.C7_SMOKE_RUN_ID ?? new Date().toISOString().replace(/[-:.TZ]/g, "");
const accountJwt = process.env.C7_ACCOUNT_JWT;

async function requestJson(label, url, init, assert) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  const ok = await assert(res, body);
  console.log(`${ok ? "PASS" : "FAIL"} ${label} (${res.status})`);
  if (!ok) {
    console.log(JSON.stringify(body, null, 2));
    process.exitCode = 1;
  }
  return { res, body };
}

await requestJson("API health", `${apiBase}/health`, undefined, async (res, body) => {
  return res.status === 200 && body?.ok === true;
});

{
  const res = await fetch(`${webBase}/dashboard?tenantId=${encodeURIComponent(tenantId)}`, { method: "HEAD" });
  const ok = res.status === 200;
  console.log(`${ok ? "PASS" : "FAIL"} web dashboard HEAD (${res.status})`);
  if (!ok) process.exitCode = 1;
}

const webhookPayload = {
  object: "Order",
  action: "Update",
  tenantId,
  payload: {
    id: `memory-smoke-order-${runId}`,
    updatedAt: "2026-05-18T19:00:00.000Z",
    total: 123.45,
  },
};

const postJson = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

await requestJson(
  "webhook first delivery",
  `${apiBase}/webhooks/commerce7`,
  postJson(webhookPayload),
  async (res, body) => res.status === 200 && body?.ok === true && body?.duplicate === false,
);

await requestJson(
  "webhook duplicate delivery",
  `${apiBase}/webhooks/commerce7`,
  postJson(webhookPayload),
  async (res, body) => res.status === 200 && body?.ok === true && body?.duplicate === true,
);

const analyticsEvents = [
  {
    tenantId,
    clientEventId: `memory-smoke-cart-impression-${runId}`,
    name: "impression",
    properties: { surface: "cart_carrot", campaignId: "memory-smoke" },
  },
  {
    tenantId,
    clientEventId: `memory-smoke-cart-click-${runId}`,
    name: "click",
    properties: { surface: "cart_carrot", campaignId: "memory-smoke" },
  },
  {
    tenantId,
    clientEventId: `memory-smoke-personalization-add-${runId}`,
    name: "add_to_cart",
    properties: { surface: "personalization_block", blockId: "memory-smoke" },
  },
];

for (const event of analyticsEvents) {
  await requestJson(
    `analytics ${event.name}`,
    `${apiBase}/v1/events`,
    postJson(event),
    async (res, body) => res.status === 200 && body?.ok === true && body?.duplicate === false,
  );
}

await requestJson(
  "analytics duplicate event",
  `${apiBase}/v1/events`,
  postJson(analyticsEvents[1]),
  async (res, body) => res.status === 200 && body?.ok === true && body?.duplicate === true,
);

await requestJson(
  "analytics invalid payload",
  `${apiBase}/v1/events`,
  postJson({ tenantId, clientEventId: `bad-${runId}` }),
  async (res, body) => res.status === 400 && body?.error === "validation_error",
);

await requestJson(
  "Commerce7 order sync",
  `${apiBase}/sync/orders`,
  postJson({ tenantId }),
  async (res, body) => res.status === 200 && body?.ok === true && body?.tenantId === tenantId,
);

const overview = await requestJson(
  "insights overview",
  `${apiBase}/v1/insights/overview?tenantId=${encodeURIComponent(tenantId)}`,
  undefined,
  async (res, body) =>
    res.status === 200 &&
    body?.tenantId === tenantId &&
    body?.orders?.ok === true &&
    body?.analytics?.cartCarrot?.total >= 2 &&
    body?.analytics?.personalizationBlock?.total >= 1,
);

if (accountJwt) {
  await requestJson(
    "Commerce7 account JWT",
    `${apiBase}/v1/account/user?tenantId=${encodeURIComponent(tenantId)}`,
    { headers: { Authorization: accountJwt } },
    async (res, body) => res.status === 200 && Boolean(body?.email),
  );
} else {
  console.log("SKIP Commerce7 account JWT (set C7_ACCOUNT_JWT from iframe account query param to test)");
}

if (overview.body?.analytics) {
  console.log(
    JSON.stringify(
      {
        tenantId,
        totalEvents: overview.body.analytics.totalEvents,
        cartCarrot: overview.body.analytics.cartCarrot,
        personalizationBlock: overview.body.analytics.personalizationBlock,
        orders: overview.body.orders,
      },
      null,
      2,
    ),
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
