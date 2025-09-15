/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Handle Canvas for client-side (if using any Canvas libraries)
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false
            }
        }

        return config
    },
    experimental: {
        // Remove optimizeCss as it's causing issues with static export
    },
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === "production"
    },
    // Add some additional configurations to prevent issues
    poweredByHeader: false,
    generateEtags: false,
    // Ensure proper error handling
    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2
    }
}
