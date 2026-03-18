const fs = require("fs");
const path = require("path");

/**
 * Resolve a single install of react / react-dom for webpack so workspace packages
 * (@tbe/components, etc.) share the same instance — avoids prerender errors like
 * "Cannot read properties of null (reading 'useEffect')" on Vercel/pnpm.
 */
function resolveSingletonPackage(packageName, startDir) {
  let current = startDir;
  for (let i = 0; i < 8; i++) {
    const pkgJson = path.join(
      current,
      "node_modules",
      packageName,
      "package.json",
    );
    if (fs.existsSync(pkgJson)) {
      return path.dirname(pkgJson);
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  try {
    return path.dirname(
      require.resolve(`${packageName}/package.json`, { paths: [startDir] }),
    );
  } catch {
    throw new Error(
      `[prep-yatra/next.config] Could not resolve "${packageName}" from ${startDir}`,
    );
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // 👇 ADD THIS: transpile TypeScript packages from your monorepo
  transpilePackages: ["@tbe/auth", "@tbe/components", "@tbe/utils"],

  // Disable ESLint during Next.js build (we run it separately in package.json)
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    // Handle Canvas for client-side (if using any Canvas libraries)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }

    // Fix for multiple React instances issue
    // Ensure single React instance is used across all packages
    // This prevents "Cannot read properties of null (reading 'useState')" errors

    // Ensure webpack resolves from the app's node_modules first
    const appNodeModules = path.resolve(__dirname, "node_modules");
    if (!Array.isArray(config.resolve.modules)) {
      config.resolve.modules = ["node_modules"];
    }
    if (!config.resolve.modules.includes(appNodeModules)) {
      config.resolve.modules.unshift(appNodeModules);
    }

    const reactDir = resolveSingletonPackage("react", __dirname);
    const reactDomDir = resolveSingletonPackage("react-dom", __dirname);
    config.resolve.alias = {
      ...config.resolve.alias,
      react: reactDir,
      "react-dom": reactDomDir,
    };

    return config;
  },

  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  poweredByHeader: false,
  generateEtags: false,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
