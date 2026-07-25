import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  poweredByHeader: false,

  output: "standalone",

  images: {
    unoptimized: true,
  },

  transpilePackages: [
    "@tbe/constants",
    "@tbe/email",
    "@tbe/types",
    "@tbe/utils",
    "@tbe/interface",
    "@tbe/services",
    "@tbe/query",
    "@tbe/gamification",
  ],

  env: {},

  experimental: {
    isrMemoryCacheSize: 0,
    esmExternals: false,
    instrumentationHook: true,
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/api/health",
        permanent: false,
      },
    ];
  },

  /**
   * Proxy Chitthi (email service) requests through the API backend so the
   * Chitthi URL / API key are never exposed to browser clients. Any TBE app
   * or admin tool that needs to talk to Chitthi should call
   * `/api/chitthi/*` on this backend and let the rewrite forward it.
   *
   * Note: `next.config.js` reads env vars at build/start time, so changing
   * `CHITTHI_URL` requires a restart (standard Next.js behavior). Runtime
   * callers of the email service should use `getChitthiConfig()` from
   * `@tbe/email` which is re-evaluated on every call.
   */
  async rewrites() {
    const chitthiUrl = (
      process.env.CHITTHI_URL ||
      process.env.EMAIL_SERVICE_URL ||
      ""
    ).replace(/\/+$/, "");

    if (!chitthiUrl) return [];

    return [
      {
        source: "/api/chitthi/:path*",
        destination: `${chitthiUrl}/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN,
});
