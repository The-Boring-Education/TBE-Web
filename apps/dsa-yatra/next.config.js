/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tbe/components'],
  images: {
    domains: [],
  },
  experimental: {
    // Disable tracing to avoid symlink issues on Windows
    outputFileTracing: false
  },
}

module.exports = nextConfig

