/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: true,
    images: {
        unoptimized: true
    },

    // Transpile TypeScript packages from monorepo
    transpilePackages: [
        "@tbe/auth",
        "@tbe/components",
        "@tbe/hooks",
        "@tbe/constants",
        "@tbe/utils",
        "@tbe/interface",
        "@tbe/services",
        "@tbe/types"
    ],

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

    // Removed experimental.outputFileTracing: false
    // This was preventing routes-manifest.json from being generated in Next.js 15
    // Next.js 15 handles file tracing automatically for Vercel deployments

    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === "production"
    },

    poweredByHeader: false,
    generateEtags: false,

    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2
    }
}

module.exports = nextConfig
