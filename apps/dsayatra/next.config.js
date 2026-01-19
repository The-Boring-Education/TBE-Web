/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tbe/components'],
  images: {
    domains: [],
  },
  // Handle ESM packages like date-fns used by react-datepicker
  serverComponentsExternalPackages: ['date-fns'],
  experimental: {
    // Disable ESM externals to handle date-fns properly
    esmExternals: false,
  },
}

module.exports = nextConfig

