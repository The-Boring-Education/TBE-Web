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
  webpack: (config, { isServer }) => {
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