import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"
import onlyWarn from "eslint-plugin-only-warn"
import { config as baseConfig } from "./base.js"

/**
 * ESLint configuration for pure TypeScript packages (types, utils, services, interface).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
    ...baseConfig,
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        plugins: {
            turbo: turboPlugin,
            onlyWarn
        },
        rules: {
            "turbo/no-undeclared-env-vars": "warn",
            // TypeScript-specific rules
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/no-unused-expressions": "off" // Disable problematic rule
        }
    },
    {
        ignores: ["dist/**", "node_modules/**", "*.d.ts"]
    }
]
