const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: [
    '@tbe/components',
    '@tbe/types',
    '@tbe/services',
    '@tbe/utils',
    '@tbe/constants',
    '@tbe/hooks',
    '@tbe/interface',
    '@tbe/config'
  ],
  experimental: {
    // Use 'loose' mode to handle mixed ESM/CJS packages
    // This allows webpack to convert require() to import() for ESM packages like date-fns
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Ensure webpack resolves from the app's node_modules first
    // This ensures date-fns from app is used correctly
    const appNodeModules = path.resolve(__dirname, 'node_modules');
    if (!Array.isArray(config.resolve.modules)) {
      config.resolve.modules = ['node_modules'];
    }
    if (!config.resolve.modules.includes(appNodeModules)) {
      config.resolve.modules.unshift(appNodeModules);
    }
    
    // Configure webpack to handle ESM packages properly
    // This ensures date-fns (ESM-only) can be used by react-datepicker (CJS)
    config.module.rules.push({
      test: /node_modules[\\/]react-datepicker[\\/].*\.js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        buffer: false,
        querystring: false,
        zlib: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        events: false,
        punycode: false,
        readline: false,
        repl: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        vm: false,
        worker_threads: false,
        kerberos: false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
        snappy: false,
        aws4: false,
        'mongodb-client-encryption': false,
      };
    }
    return config;
  }
}

module.exports = nextConfig