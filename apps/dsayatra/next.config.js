const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@tbe/components",
    "@tbe/hooks",
    "@tbe/utils",
    "@tbe/types",
    "@tbe/services",
    "@tbe/constants",
    "@tbe/auth",
    "@tbe/config",
    "@tbe/query",
    "@tbe/gamification",
  ],
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
