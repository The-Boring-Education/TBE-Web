/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  
    // 👇 ADD THIS: transpile TypeScript packages from your monorepo
    transpilePackages: ["@tbe/components", "@tbe/utils"],
  
    // Disable ESLint during Next.js build (we run it separately in package.json)
    eslint: {
      ignoreDuringBuilds: true,
    },

    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Handle Canvas for client-side (if using any Canvas libraries)
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          canvas: false,
        };
      }
  
      return config;
    },
  
    experimental: {
      // (You can add experimental options here if needed)
      // Disable tracing to avoid symlink issues on Windows
      outputFileTracing: false
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
  