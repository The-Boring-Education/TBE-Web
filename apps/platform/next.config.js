const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@tbe/auth',
    '@tbe/components',
    '@tbe/hooks',
    '@tbe/constants',
    '@tbe/utils',
    '@tbe/interface',
    '@tbe/services',
    '@tbe/types',
    '@tbe/typescript-config',
    '@tbe/eslint-config',
    '@tbe/config',
    '@tbe/gamification',
  ],

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

  async headers() {
    // Next.js dev (HMR/React Refresh) requires 'unsafe-eval'; keep it out of
    // production so the CSP meets the 'self' script-src acceptance criteria.
    const isDev = process.env.NODE_ENV !== 'production';
    const scriptSrc = [
      "script-src 'self' 'unsafe-inline'",
      isDev ? " 'unsafe-eval'" : '',
      ' https://www.googletagmanager.com https://www.google-analytics.com https://sdk.cashfree.com',
    ].join('');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.theboringeducation.com https://www.google-analytics.com https://*.sentry.io https://sdk.cashfree.com",
              "frame-src 'self' https://www.youtube.com https://sdk.cashfree.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

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

    // jsdom is only used for server-side HTML sanitization (@tbe/components).
    // Keep it out of the client bundle.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        jsdom: false,
      };
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

  module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
} else {
  module.exports = nextConfig;
}
