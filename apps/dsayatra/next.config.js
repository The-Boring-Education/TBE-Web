const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tbe/components"],
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "lh3.google.com",
      "ik.imagekit.io",
      "images.unsplash.com",
      "i.ytimg.com",
      "via.placeholder.com",
      "avatars.githubusercontent.com",
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
  experimental: {
    // Use 'loose' mode to handle mixed ESM/CJS packages
    // This allows webpack to convert require() to import() for ESM packages like date-fns
    esmExternals: "loose",
  },
  webpack: (config, { isServer }) => {
    // Ensure webpack resolves from the app's node_modules first
    // This ensures date-fns v3 from app is used instead of v2 from components package
    const appNodeModules = path.resolve(__dirname, "node_modules");
    if (!Array.isArray(config.resolve.modules)) {
      config.resolve.modules = ["node_modules"];
    }
    if (!config.resolve.modules.includes(appNodeModules)) {
      config.resolve.modules.unshift(appNodeModules);
    }

    // Configure webpack to handle ESM packages properly
    // This ensures date-fns (ESM-only) can be used by react-datepicker (CJS)
    config.module.rules.push({
      test: /node_modules\/react-datepicker\/.*\.js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

module.exports = nextConfig;
