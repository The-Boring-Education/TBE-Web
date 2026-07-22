/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile TypeScript packages from monorepo
  transpilePackages: [
    "@tbe/components",
    "@tbe/hooks",
    "@tbe/utils",
    "@tbe/types",
    "@tbe/services",
    "@tbe/constants",
    "@tbe/interface",
    "@tbe/auth",
    "@tbe/config",
    "@tbe/query",
    "@tbe/gamification",
  ],

  // Disable ESLint during Next.js build
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

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

  webpack(config, { isServer }) {
    // jsdom is only used for server-side HTML sanitization (@tbe/components).
    // Keep it out of the client bundle.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        jsdom: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
