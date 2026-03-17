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
    "@tbe/types",
    "@tbe/utils",
    "@tbe/interface",
    "@tbe/services",
    "@tbe/query",
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
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN,
});
