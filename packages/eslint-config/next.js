import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"
import pluginReactHooks from "eslint-plugin-react-hooks"
import pluginReact from "eslint-plugin-react"
import globals from "globals"
import pluginNext from "@next/eslint-plugin-next"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import { config as baseConfig } from "./base.js"

/**
 * A custom ESLint configuration for Next.js applications.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
    ...baseConfig,
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        ...pluginReact.configs.flat.recommended,
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker
            }
        }
    },
    {
        plugins: {
            "@next/next": pluginNext
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs["core-web-vitals"].rules
        }
    },
    {
        plugins: {
            "react-hooks": pluginReactHooks,
            "simple-import-sort": simpleImportSort,
            "unused-imports": unusedImports
        },
        settings: { react: { version: "detect" } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            // React scope no longer necessary with new JSX transform.
            "react/react-in-jsx-scope": "off",
            // Import sorting and management
            "simple-import-sort/exports": "warn",
            "simple-import-sort/imports": "warn",
            "unused-imports/no-unused-imports": "warn",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_"
                }
            ],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            // React-specific rules
            "react/display-name": "off",
            "react/jsx-curly-brace-presence": [
                "warn",
                { props: "never", children: "never" }
            ],
            "react/no-unescaped-entities": "off",
            "react/jsx-boolean-value": ["warn", "never"],
            "react/self-closing-comp": "warn",
            // TypeScript-specific rules
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/no-unused-expressions": "off" // Disable problematic rule
        }
    },
    {
        ignores: ["dist/**", "node_modules/**", ".next/**", "*.d.ts"]
    }
]
