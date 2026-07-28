import { config } from "@tbe/eslint-config/next-js";

export default [
  ...config,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/auth",
              importNames: ["decodeToken"],
              message:
                "Do not use unverified JWT decode in API code. Use verifyToken() for all auth/security checks.",
            },
          ],
        },
      ],
    },
  },
];
