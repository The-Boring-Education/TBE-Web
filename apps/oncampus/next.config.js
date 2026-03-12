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
    "@tbe/auth",
    "@tbe/config",
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
};

module.exports = nextConfig;
