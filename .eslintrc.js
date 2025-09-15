module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/strict",
        "plugin:import/recommended",
        "plugin:import/typescript"
    ],
    rules: {
        "no-use-before-define": "warn",
        "no-unused-vars": "warn",
        indent: ["warn", 2],
        "react/react-in-jsx-scope": "off"
    },
    settings: {
        react: {
            version: "detect"
        }
    },
    overrides: [
        {
            files: ["*.config.js"],
            env: {
                node: true
            }
        }
    ]
}
