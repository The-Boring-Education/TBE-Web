/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // API-only configuration
    poweredByHeader: false,

    // Transpile packages
    transpilePackages: [
        "@tbe/constants",
        "@tbe/types",
        "@tbe/utils",
        "@tbe/database",
        "@tbe/interface",
        "@tbe/services"
    ],

    // Environment variables
    env: {
        // Add other environment variables here if needed
        // NODE_ENV is automatically handled by Next.js
    },

    // Redirect all non-API routes to API documentation or health check
    async redirects() {
        return [
            {
                source: "/",
                destination: "/api/health",
                permanent: false
            }
        ]
    },

    // Headers for CORS
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT"
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig
