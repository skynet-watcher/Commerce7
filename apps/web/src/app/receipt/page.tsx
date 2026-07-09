"use client";

/**
 * /receipt — Commerce7 Frontend Receipt iFrame
 *
 * Register this URL as the "Frontend Receipt Primary" extension in the ADC.
 * Commerce7 automatically loads this iFrame on every order confirmation page
 * for every installed merchant — no snippet, no theme code, no developer needed.
 *
 * The page is invisible (0px height, no UI). It fires a single purchase event
 * to /v1/events on load and uses sessionStorage to prevent double-fire on refresh.
 *
 * ADC extension URL: https://your-domain.com/receipt
 * C7 appends: ?tenantId=…&appToken=…  (and possibly orderId, customerId)
 */

import { Suspense, useEffect, useRef } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { defaultApiBase } from "@/lib/api-base";

const SESSION_KEY = "c7-receipt-fired";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function ReceiptTracker() {
  const search = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    // Guard: React StrictMode double-invoke + page refresh
    if (fired.current) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage blocked (3rd-party cookie restrictions inside iFrame)
      // — proceed anyway; the API's clientEventId idempotency is the final guard
    }
    fired.current = true;

    const tenantId =
      search.get("tenantId") ??
      search.get("tenant") ??
      search.get("tenantid") ??
      "";

    if (!tenantId.trim()) return; // no tenant → nothing to record

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }

    const apiBase = defaultApiBase();
    const payload = JSON.stringify({
      tenantId: tenantId.trim(),
      clientEventId: `receipt:purchase:${tenantId.trim()}:${uid()}`,
      name: "purchase",
      properties: {
        // No surface tag — this is an order-confirmed event, not a click-through.
        // Attribution (which surface drove this order) happens server-side by
        // correlating earlier session click events with this order.
        source: "receipt_iframe",
      },
    });

    // Fire and forget — keepalive keeps the request alive if the page closes
    void fetch(`${apiBase}/v1/events`, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      // Silently ignore network errors — shopper experience is unaffected
    });
  }, [search]);

  return null;
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={null}>
      <ReceiptTracker />
      {/*
        Commerce7 requires this script in iFrame pages to handle
        height communication between the iFrame and the Commerce7 shell.
        Setting height to 0 makes the iFrame invisible to the shopper.
      */}
      <Script
        src="https://dev-center.platform.commerce7.com/v2/commerce7.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Tell C7 the iFrame height is 0 — completely invisible
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ height: 0 }, "*");
          }
        }}
      />
    </Suspense>
  );
}
