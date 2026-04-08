const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@tbe/components",
    "@tbe/constants",
    "@tbe/hooks",
    "@tbe/interface",
    "@tbe/types",
    "@tbe/utils",
    "@tbe/services",
    "@tbe/config",
    "@tbe/gamification",
  ],
  swcMinify: true,
  images: {
    domains: ["localhost"],
  },
  // Disable static optimization for pages that use client-side only features
  output: "standalone",
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ui": path.resolve(__dirname, "../../packages/components/src/ui"),
    };
    return config;
  },
};

module.exports = nextConfig;
