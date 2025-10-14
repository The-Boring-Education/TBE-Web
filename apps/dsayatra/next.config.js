/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tbe/components'],
  images: {
    domains: [],
  },
}

module.exports = nextConfig

