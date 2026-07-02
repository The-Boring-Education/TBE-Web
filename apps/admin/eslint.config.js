import { config } from "@tbe/eslint-config/next-js";

export default [
  ...config,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      "build/**",
      "tailwind.config.ts",
      "postcss.config.js",
      "vite.config.ts",
    ],
  },
];
