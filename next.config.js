/* eslint-disable @typescript-eslint/no-var-requires */
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src'],
  },

  reactStrictMode: true,

  // Performance optimizations
  swcMinify: true,
  compress: true,

  // Bundle size optimization - simplified approach
  experimental: {
    optimizePackageImports: ['framer-motion'],
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
  },

  // SVGR
  webpack(config, { isServer, isEdgeRuntime }) {
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

    // Add comprehensive fallbacks for browser APIs that OpenTelemetry expects
    if (isServer || isEdgeRuntime) {
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
    }

    return config;
  },

  async redirects() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Health check endpoints for reverse proxied apps
        {
          source: '/api/health/prepyatra',
          destination: `${process.env.PREPYATRA_APP_URL}/api/health`,
        },
        {
          source: '/api/health/quizzes',
          destination: `${process.env.QUIZ_APP_URL}/api/health`,
        },
      ],
      afterFiles: [
        // Fallback for SPA routes when reverse proxy fails
        {
          source: '/prepyatra/:path*',
          destination: '/prepyatra-fallback?path=:path*',
        },
        {
          source: '/quizzes/:path*',
          destination: '/quizzes-fallback?path=:path*',
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: '/prepyatra/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/quizzes/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'the-boring-education',
  project: 'tbe-webapp',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
