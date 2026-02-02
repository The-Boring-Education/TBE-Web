const { withSentryConfig } = require('@sentry/nextjs');
const withTM = require('next-transpile-modules')([
  '@tbe/auth',
  '@tbe/components', // <-- your workspace package
  '@tbe/hooks',
  '@tbe/constants',
  '@tbe/utils',
  '@tbe/interface',
  '@tbe/services',
  '@tbe/types',
  '@tbe/typescript-config',
  '@tbe/eslint-config',
  '@tbe/config',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: true,
  swcMinify: true,
  compress: true,

  experimental: {
    optimizePackageImports: ['framer-motion'],
    scrollRestoration: true,
    // Use 'loose' mode to handle mixed ESM/CJS packages
    // This allows webpack to convert require() to import() for ESM packages like date-fns
    esmExternals: 'loose',
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    domains: [
      'lh3.googleusercontent.com',
      'lh3.google.com',
      'ik.imagekit.io',
      'images.unsplash.com',
      'i.ytimg.com',
      'via.placeholder.com',
      'avatars.githubusercontent.com',
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  webpack(config, { isServer, isEdgeRuntime }) {
    const path = require('path');
    
    // Ensure webpack resolves from the app's node_modules first
    // This ensures date-fns v3 from app is used instead of v2 from components package
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
    
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });

    // Exclude pdfjs-dist from server bundle (browser-only library)
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('pdfjs-dist');
      } else {
        config.externals = [config.externals, 'pdfjs-dist'];
      }
    }

    // Add comprehensive fallbacks for Node.js modules in both client and server
    config.resolve.fallback = {
      ...config.resolve.fallback,
      performance: false,
      'performance-now': false,
      perf_hooks: false,
      timers: false,
      util: false,
      buffer: false,
      process: false,
      events: false,
      stream: false,
      crypto: false,
      url: false,
      querystring: false,
      path: false,
      fs: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
      assert: false,
      constants: false,
      domain: false,
      punycode: false,
      string_decoder: false,
      tty: false,
      vm: false,
      worker_threads: false,
      child_process: false,
      cluster: false,
      dgram: false,
      dns: false,
      net: false,
      readline: false,
      repl: false,
      tls: false,
      v8: false,
      inspector: false,
      trace_events: false,
      async_hooks: false,
      module: false,
    };

    return config;
  },
};

// Only apply Sentry in production to avoid OpenTelemetry conflicts in development
if (process.env.NODE_ENV === 'production') {
  // Sentry config
  const sentryWebpackPluginOptions = {
    org: 'the-boring-education',
    project: 'tbe-webapp',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  };

  module.exports = withSentryConfig(withTM(nextConfig), sentryWebpackPluginOptions);
} else {
  // Skip Sentry in development to avoid OpenTelemetry errors
  module.exports = withTM(nextConfig);
}

