import { config } from "@tbe/eslint-config/next-js";

export default [
  ...config,
  {
    rules: {
      // Disable Next.js specific rules for Vite app
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [
      // Configs
      ".eslintrc.js",
      "prettier.config.js",
      "tsconfig.js",
      "tailwind.config.js",
      // Distributable
      "dist/**",
      "build/**",
      "*.bundle.js",
      "*.js.map",
      // Version control
      ".git/**",
      ".history/**",
      ".cache/**",
      ".vscode/**",
      "node_modules/**",
    ],
  },
];
