/* global module */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
  transpilePackages: [
    "@tbe/auth",
    "@tbe/components",
    "@tbe/hooks",
    "@tbe/constants",
    "@tbe/utils",
    "@tbe/interface",
    "@tbe/query",
    "@tbe/services",
    "@tbe/types",
    "@tbe/typescript-config",
    "@tbe/eslint-config",
    "@tbe/config",
    "@tbe/gamification",
  ],
  experimental: {
    esmExternals: "loose",
  },
};

module.exports = nextConfig;
