const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // 👇 ADD THIS: transpile TypeScript packages from your monorepo
  transpilePackages: ["@tbe/auth", "@tbe/components", "@tbe/utils"],

  // Disable ESLint during Next.js build (we run it separately in package.json)
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    // Handle Canvas for client-side (if using any Canvas libraries)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }

    // Fix for multiple React instances issue
    // Ensure single React instance is used across all packages
    // This prevents "Cannot read properties of null (reading 'useState')" errors

    // Ensure webpack resolves from the app's node_modules first
    const appNodeModules = path.resolve(__dirname, "node_modules");
    if (!Array.isArray(config.resolve.modules)) {
      config.resolve.modules = ["node_modules"];
    }
    if (!config.resolve.modules.includes(appNodeModules)) {
      config.resolve.modules.unshift(appNodeModules);
    }

    return config;
  },

  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  poweredByHeader: false,
  generateEtags: false,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
