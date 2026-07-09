import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/+$/, "");
const devOrigins = [
  "bbs-drug-totally-requires.trycloudflare.com",
  "polo-name-relationship-marco.trycloudflare.com",
];

// Allow embedding only from Commerce7 admin surfaces and self.
const commerce7FrameAncestors = [
  "'self'",
  "https://*.commerce7.com",
  "https://*.platform.commerce7.com",
  "https://admin.platform.commerce7.com",
].join(" ");

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Do NOT set X-Frame-Options — it would block the C7 iframe embed.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              // Next.js requires unsafe-inline for styles; unsafe-eval for dev HMR only
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              // Allow API calls to the configured dev/staging API and Commerce7.
              `connect-src 'self' ${apiOrigin} https://api.commerce7.com`,
              `frame-ancestors ${commerce7FrameAncestors}`,
              "object-src 'none'",
            ].join("; "),
          },
          {
            // Prevent MIME-type sniffing
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Don't leak the full referrer to third-party domains
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Disable browser features the app doesn't use
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            // Enable DNS prefetch for performance
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
