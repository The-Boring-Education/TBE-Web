/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    typescript: {
        tsconfigPath: "./tsconfig.json"
    },


    // Transpile workspace packages
    transpilePackages: [
        '@tbe/components',
        '@tbe/constants',
        '@tbe/hooks',
        '@tbe/utils',
        '@tbe/types',
        '@tbe/services',
        '@tbe/interface'
    ],

    // Page extensions
    pageExtensions: ['tsx', 'ts'],

    // Webpack configuration
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false
        };
        return config;
    }
};

module.exports = nextConfig;

