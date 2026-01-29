import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"
import pluginReactHooks from "eslint-plugin-react-hooks"
import pluginReact from "eslint-plugin-react"
import globals from "globals"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import { config as baseConfig } from "./base.js"

/**
 * ESLint configuration for React component libraries (hooks, components).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
    ...baseConfig,
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker,
                ...globals.browser
            }
        }
    },
    {
        plugins: {
            "react-hooks": pluginReactHooks,
            "simple-import-sort": simpleImportSort
        },
        settings: { react: { version: "detect" } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            // React scope no longer necessary with new JSX transform.
            "react/react-in-jsx-scope": "off",
            // React library specific rules
            "react/display-name": "off",
            "react/jsx-curly-brace-presence": [
                "warn",
                { props: "never", children: "never" }
            ],
            "react/no-unescaped-entities": "off",
            "react/jsx-boolean-value": ["warn", "never"],
            "react/self-closing-comp": "warn",
            // Import sorting and management
            "simple-import-sort/exports": "warn",
            "simple-import-sort/imports": "warn",
            // TypeScript-specific rules (using @typescript-eslint instead of unused-imports due to ESLint 9 compatibility)
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_"
                }
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/no-unused-expressions": "off" // Disable problematic rule
        }
    },
    {
        ignores: ["dist/**", "node_modules/**", "*.d.ts"]
    }
]
