# `@tbe/eslint-config`

Shared ESLint flat configs for TBE monorepo apps and packages.

## Entry points

- **`@tbe/eslint-config/next-js`** — Next.js, React, TypeScript, Prettier, import sorting, and shared style rules.
- **`@tbe/eslint-config/base`** — Lighter base (TypeScript, Prettier, turbo); use when not pulling the full Next stack.

### ES6+ / modern style (in `next.js`)

These use **core rule options that ESLint 8 and 9 both accept** (same JSON schema). Apps like `prep-yatra` may still resolve **ESLint 8** from their own `node_modules`, so you must not add newer-only options (e.g. `func-style` with `overrides` / `allowTypeAnnotation`) to the shared config or ESLint will fail to start.

| Rule                      | Notes                                                                                                                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-var`                  | No `var`.                                                                                                                                                                                                                                                        |
| `prefer-const`            | `const` when not reassigned.                                                                                                                                                                                                                                     |
| `object-shorthand`        | ES6 object shorthand.                                                                                                                                                                                                                                            |
| `prefer-arrow-callback`   | Arrows in callbacks when appropriate.                                                                                                                                                                                                                            |
| `prefer-numeric-literals` | `0b10` / `0o7` / `0xFF` over `parseInt` where applicable.                                                                                                                                                                                                        |
| `func-style`              | `["warn","expression",{ allowArrowFunctions: true }]` only. Flags non-default `function` declarations (e.g. `export function Page()`). Use `const Page = () =>` + `export default Page`, or set `func-style: "off"` in an app override if the noise is too high. |

To rely on **newer** `func-style` options, align the monorepo on **one ESLint major** (e.g. pnpm `overrides` so every package uses ESLint 9) and use the 9.x schema, or keep the minimal option set above.

```bash
pnpm --filter @tbe/components lint
```
