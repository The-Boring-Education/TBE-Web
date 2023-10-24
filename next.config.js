/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src'],
  },

  reactStrictMode: true,
  swcMinify: true,

  // Uncoment to add domain whitelist
  images: {
    domains: ['lh3.googleusercontent.com', 'lh3.google.com', 'ik.imagekit.io'],
  },

  // SVGR
  webpack(config) {
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

    return config;
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/micro-camps/:microCamp',
  //       destination: '/',
  //       permanent: true,
  //     },
  //   ]
  // },
};

module.exports = nextConfig;
