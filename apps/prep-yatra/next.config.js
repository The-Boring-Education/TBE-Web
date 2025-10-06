/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  
    // 👇 ADD THIS: transpile TypeScript packages from your monorepo
    transpilePackages: ["@tbe/components", "@tbe/utils"],
  
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
  