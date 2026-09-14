# 🤝 Contributing to TBE Platform

Thank you for taking the time to contribute to **The Boring Education** platform! This guide covers everything you need to know — from setting up your environment to getting your PR merged. Please read it fully before opening your first PR.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Monorepo Structure](#monorepo-structure)
- [Development Workflow](#development-workflow)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style & Quality](#code-style--quality)
- [Testing Guidelines](#testing-guidelines)
- [Working with Shared Packages](#working-with-shared-packages)
- [Adding a New App or Package](#adding-a-new-app-or-package)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Getting Help](#getting-help)

---

## 📜 Code of Conduct

We are committed to fostering a welcoming and respectful community. By contributing, you agree to uphold our community standards:

- Be kind, patient, and constructive in all interactions
- Respect differing opinions and experience levels
- Give credit where it's due
- Focus feedback on code, not people

Violations can be reported to the maintainers via GitHub Issues (mark as `[COC]` in the title).

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed before anything else:

| Tool | Required Version | Install |
|------|-----------------|---------|
| **Node.js** | >= 20.x | [nodejs.org](https://nodejs.org) |
| **pnpm** | >= 9.12.0 | `npm install -g pnpm@9.15.9` |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |
| **MongoDB** | Local or Cloud | [mongodb.com](https://mongodb.com) |

### 1. Fork & Clone

```bash
# Fork the repo via GitHub UI, then clone your fork
git clone https://github.com/<your-username>/TBE-Web.git
cd TBE-Web

# Add the upstream remote
git remote add upstream https://github.com/The-Boring-Education/TBE-Web.git
```

### 2. Install Dependencies

```bash
pnpm install
```

> **Note:** This installs dependencies for **all apps and packages** across the monorepo in one command. Never use `npm install` or `yarn` — this project uses `pnpm` workspaces exclusively.

### 3. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local

# Fill in the required values (see Environment Variables section)
```

### 4. Start Development

```bash
# Run all apps in parallel
pnpm dev

# Or run a specific app
pnpm dev:platform      # Main platform  → http://localhost:3000
pnpm dev:api           # API service    → http://localhost:3004
pnpm dev:prep-yatra    # Prep Yatra     → http://localhost:3001
pnpm dev:quizes        # Quizes         → http://localhost:3002
pnpm dev:onboarding    # Onboarding     → http://localhost:3003
```

---

## 🏗️ Monorepo Structure

This is a **Turborepo** monorepo managed with **pnpm workspaces**. Understanding the layout is essential before contributing.

```
TBE-Web/
├── apps/                          # Deployable applications
│   ├── platform/                  # Main TBE platform (Next.js, Port 3000)
│   ├── api/                       # Centralized API (Next.js API routes, Port 3004)
│   ├── prep-yatra/                # Interview prep tool (Next.js, Port 3001)
│   ├── quizes/                    # Quiz platform (Next.js, Port 3002)
│   ├── onboarding/                # User onboarding (Vite + React, Port 3003)
│   ├── techyatra/                 # Tech learning journeys (Next.js)
│   ├── dsayatra/                  # DSA practice (Next.js)
│   ├── resume-yatra/              # Resume builder (Next.js)
│   └── testing/                   # Test suite (Vitest + MSW)
│
├── packages/                      # Shared internal packages
│   ├── components/                # @tbe/components — 300+ UI components
│   ├── hooks/                     # @tbe/hooks — 30+ React hooks
│   ├── utils/                     # @tbe/utils — DB, auth, API helpers
│   ├── types/                     # @tbe/types — TypeScript types
│   ├── interface/                 # @tbe/interface — Component prop interfaces
│   ├── constants/                 # @tbe/constants — Shared constants
│   ├── services/                  # @tbe/services — API service functions
│   ├── auth/                      # @tbe/auth — Auth logic & components
│   ├── config/                    # @tbe/config — Shared configurations
│   ├── eslint-config/             # @tbe/eslint-config — ESLint rules
│   └── typescript-config/         # @tbe/typescript-config — TSConfig bases
│
├── .github/
│   ├── workflows/                 # CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md   # PR template (fill this out!)
│
├── docs/                          # Project-wide documentation
├── turbo.json                     # Turborepo task graph config
└── pnpm-workspace.yaml            # pnpm workspace config
```

### Package Naming Convention

All internal packages are scoped under `@tbe/`:

```typescript
import { Button } from "@tbe/components";
import { useAuth } from "@tbe/hooks";
import { connectToDatabase } from "@tbe/utils";
import type { User } from "@tbe/types";
```

---

## 💻 Development Workflow

### Step-by-step for every contribution

```
1. Sync fork → 2. Create branch → 3. Make changes → 4. Test → 5. Commit → 6. Push → 7. Open PR
```

#### 1. Sync your fork before starting new work

```bash
git fetch upstream
git checkout development
git merge upstream/development
git push origin development
```

> Always branch off `development`, not `production`.

#### 2. Create a feature branch

```bash
git checkout -b <type>/<short-description>
# Examples:
git checkout -b fix/login-redirect-loop
git checkout -b feat/add-quiz-leaderboard
git checkout -b docs/update-api-readme
```

#### 3. Make your changes

- Keep changes **focused** — one feature/fix per PR
- **Don't** mix unrelated changes in the same PR
- Run `pnpm lint` and `pnpm check-types` frequently

#### 4. Test your changes

```bash
# Run all unit tests
pnpm test:unit

# Watch mode (during development)
pnpm test:unit:watch

# API tests
pnpm test:api

# Coverage report
pnpm test:coverage
```

#### 5. Commit with a clear message (see Commit Guidelines below)

```bash
git add .
git commit -m "fix(auth): redirect to /dashboard after login (#123)"
```

#### 6. Push & open a PR

```bash
git push origin <your-branch-name>
# Then open a PR on GitHub against the `development` branch
```

---

## 🌿 Branch Naming Conventions

Use the following prefixes so branch purpose is clear at a glance:

| Prefix | When to use | Example |
|--------|------------|---------|
| `feat/` | New feature | `feat/quiz-leaderboard` |
| `fix/` | Bug fix | `fix/phone-validation-issue` |
| `docs/` | Documentation only | `docs/add-contributing-guide` |
| `refactor/` | Code cleanup, no behavior change | `refactor/extract-auth-hook` |
| `chore/` | Build scripts, dependency updates | `chore/upgrade-nextjs-15` |
| `test/` | Adding or fixing tests only | `test/add-onboarding-unit-tests` |
| `style/` | UI/CSS changes only | `style/fix-mobile-navbar` |
| `perf/` | Performance improvement | `perf/lazy-load-course-list` |

**Rules:**
- Use **kebab-case** (lowercase, hyphen-separated)
- Keep it short but descriptive (3–5 words max)
- Append the issue number when fixing a reported issue: `fix/phone-validation-#1216`

---

## ✍️ Commit Message Guidelines

We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification. This enables automatic changelog generation and makes `git log` genuinely useful.

### Format

```
<type>(<scope>): <short description> (#issue-number)

[optional body]

[optional footer]
```

### Types

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, CSS — no logic change |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependency changes |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |
| `revert` | Reverting a previous commit |

### Scope (optional but recommended)

Use the affected app or package name:

```
fix(onboarding): ...
feat(platform): ...
refactor(components): ...
chore(api): ...
```

### Examples

```bash
# Good ✅
git commit -m "fix(onboarding): enforce 10-digit phone validation on client & server (#1216)"
git commit -m "feat(platform): add dark mode toggle to navbar"
git commit -m "docs: add CONTRIBUTING.md with full contributor guide"
git commit -m "test(api): add unit tests for onboarding route phone validation"
git commit -m "chore: upgrade pnpm to 9.15.9"

# Bad ❌
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "changes"
git commit -m "update"
```

### Multi-line commit (for complex changes)

```bash
git commit -m "feat(quizes): add leaderboard with real-time ranking (#456)

- Add LeaderboardCard component to @tbe/components
- Add /api/v1/quiz/leaderboard endpoint with pagination
- Add useLeaderboard hook with SWR polling every 30s
- Add unit tests for leaderboard API route

Closes #456"
```

---

## 🔀 Pull Request Process

### Before Opening a PR

- [ ] All CI checks pass locally (`pnpm lint`, `pnpm check-types`, `pnpm test:unit`)
- [ ] No unrelated changes included
- [ ] Tests added for new functionality
- [ ] Existing tests still pass
- [ ] Documentation updated if needed

### Filling the PR Template

Every PR must use the project's PR template (`.github/PULL_REQUEST_TEMPLATE.md`). Fill out **every section** — don't delete headings you didn't fill.

### PR Size Guidelines

Keep PRs small and focused. Large PRs are hard to review and slow to merge.

| PR Size | Lines Changed | Status |
|---------|--------------|--------|
| 🟢 Small | < 200 lines | Ideal |
| 🟡 Medium | 200–500 lines | Acceptable |
| 🔴 Large | > 500 lines | Break it up if possible |

### Review Process

1. A maintainer will review within **2–3 business days**
2. Address all review comments — push new commits (don't force-push during review)
3. Once approved, a maintainer will **squash-merge** your PR into `development`
4. Delete your branch after merge (GitHub does this automatically)

### PR Title Format

Your PR title should follow the same Conventional Commits format as your commits:

```
fix(onboarding): enforce 10-digit phone number validation (#1216)
feat(platform): add dark mode toggle to navbar
docs: add detailed CONTRIBUTING.md
```

---

## 🎨 Code Style & Quality

### Automated Tooling

All code quality is enforced automatically. Run these before every commit:

```bash
pnpm lint          # ESLint — catches code issues
pnpm format        # Prettier — auto-formats code
pnpm check-types   # TypeScript — catches type errors
```

> **Tip:** A Husky pre-commit hook runs `lint-staged` automatically on `git commit`. Fix any errors it reports before pushing.

### TypeScript

- **Always use strict types** — avoid `any`. Use `unknown` + type narrowing instead.
- Prefer `interface` for component props, `type` for unions and utilities.
- All new files must be `.ts` or `.tsx` — no `.js` files.
- Export types from `@tbe/types` or `@tbe/interface` when shared across packages.

```typescript
// ✅ Good
const handleChange = (value: string): void => { ... };
interface CardProps { title: string; isLoading?: boolean; }

// ❌ Bad
const handleChange = (value: any) => { ... };
```

### React & Next.js

- Use **functional components** with hooks — no class components.
- Keep components **small and single-purpose** (< 150 lines ideally).
- Use `@tbe/components` shared components before creating new ones.
- Prefer `Server Components` in Next.js app router — only use `"use client"` when you need browser APIs or event handlers.
- Always handle loading and error states.

```tsx
// ✅ Good — uses shared component, handles states
import { Button, Spinner } from "@tbe/components";

const SaveButton = ({ isLoading, onClick }: SaveButtonProps) => (
  <Button onClick={onClick} disabled={isLoading}>
    {isLoading ? <Spinner /> : "Save"}
  </Button>
);
```

### API Routes (apps/api)

- Validate all request inputs before touching the database.
- Return consistent response shapes using the project's `sendResponse` / `sendError` utilities.
- Always handle `try/catch` and return appropriate HTTP status codes.
- Never log or expose sensitive data (tokens, passwords, PII).

```typescript
// ✅ Good
if (!contactNo || !/^\+\d{1,4}\d{10}$/.test(contactNo)) {
  return res.status(422).json({ message: "Invalid phone number format" });
}
```

### CSS & Styling

- Use **Tailwind CSS** utility classes (the project uses Tailwind).
- Avoid inline styles (`style={{}}`) — use Tailwind classes.
- For complex/reusable styles, create a class in the relevant CSS module.
- Mobile-first: always test your UI at 375px viewport width.

---

## 🧪 Testing Guidelines

All new code must be accompanied by tests. The test suite lives in `apps/testing/` and uses **Vitest** + **MSW** (Mock Service Worker).

### Test Structure

```
apps/testing/src/
├── unit/
│   ├── components/     # Component unit tests
│   ├── hooks/          # Hook unit tests
│   ├── utils/          # Utility function tests
│   ├── api-routes/     # API handler tests
│   └── database/       # DB model/query tests
├── integration/        # Integration tests (real DB via mongodb-memory-server)
└── e2e/               # End-to-end tests (Playwright)
```

### Writing Unit Tests

```typescript
// apps/testing/src/unit/components/common/MyComponent.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("MyComponent", () => {
  it("renders the title", () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", async () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Branches | 65% |

```bash
pnpm test:coverage    # View coverage report
```

### What to Test

- ✅ Component rendering with different prop combinations
- ✅ User interactions (click, type, submit)
- ✅ Error states and edge cases
- ✅ API route input validation (valid + invalid inputs)
- ✅ Utility function outputs with boundary values
- ❌ Third-party library internals
- ❌ Implementation details (test behavior, not code)

---

## 📦 Working with Shared Packages

### Using an Existing Package

```bash
# Import from shared packages — no installation needed
import { Button } from "@tbe/components";
import { useAuth } from "@tbe/hooks";
import type { APIResponse } from "@tbe/types";
```

### Modifying a Shared Package

When you modify `packages/components`, `packages/hooks`, etc., those changes are immediately available to all apps in dev mode (Turborepo handles the linking).

> ⚠️ **Breaking changes to shared packages affect ALL apps.** If you're changing a component's props interface, search for all usages first:
> ```bash
> # Find all usages across the monorepo
> grep -r "MyComponentProps" packages/ apps/ --include="*.ts" --include="*.tsx"
> ```

### Adding a New Shared Component

1. Create the component in `packages/components/src/`
2. Export it from the package's `index.ts`
3. Add its props interface to `packages/interface/src/Components.ts`
4. Add its types to `packages/types/src/` if needed
5. Write unit tests in `apps/testing/src/unit/components/`

```bash
# Confirm no type errors after modifying a package
pnpm --filter @tbe/components build
```

---

## ➕ Adding a New App or Package

### New Application

```bash
# 1. Create app directory
mkdir apps/my-new-app && cd apps/my-new-app

# 2. Initialize (example: Next.js)
npx create-next-app@latest ./ --typescript --tailwind --no-git

# 3. Set package name in package.json to "@tbe/my-new-app"

# 4. Add dev/build scripts to root package.json:
#    "dev:my-new-app": "turbo run dev --filter=@tbe/my-new-app"

# 5. Update turbo.json pipeline if needed

# 6. Update README.md with the new app's details
```

### New Shared Package

```bash
# 1. Create package directory
mkdir packages/my-package && cd packages/my-package

# 2. Create package.json with:
#    "name": "@tbe/my-package"
#    "main": "./src/index.ts"

# 3. Create src/index.ts

# 4. Add it as a dependency to consuming apps
pnpm --filter @tbe/platform add @tbe/my-package
```

---

## 🔐 Environment Variables

### Never commit secrets. Ever.

`.env.local` is in `.gitignore` — keep it that way. If you accidentally commit a secret, **rotate it immediately** and notify the maintainers.

### Required Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/tbe-platform

# Auth
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
GOOGLE_AUTH_CLIENT_ID=<from Google Cloud Console>
GOOGLE_AUTH_CLIENT_SECRET=<from Google Cloud Console>

# External APIs (optional for local dev)
OPENAI_API_KEY=<your key>
YOUTUBE_API_KEY=<your key>

# Payment (optional for local dev)
CASHFREE_CLIENT_ID=<your id>
CASHFREE_SECRET_KEY=<your secret>

# Monitoring (optional for local dev)
NEXT_PUBLIC_SENTRY_DSN=<your dsn>
```

### Adding a New Environment Variable

1. Add it to `.env.example` with a descriptive placeholder and comment
2. Document it in `README.md` under **Environment Variables**
3. If it's `NEXT_PUBLIC_*`, it's exposed to the browser — **never put secrets there**

---

## 🤖 CI/CD Pipeline

GitHub Actions run automatically on every PR to `development` and `production`. Your PR **must pass all checks** before it can be merged:

| Check | Command | Validates |
|-------|---------|-----------|
| **Build** | `pnpm build:api` / `pnpm build:platform` | No compile/type errors, successful builds |
| **Lint** | `pnpm lint` | ESLint rules pass |
| **Type Check** | `pnpm check-types` | No TypeScript errors |
| **Unit Tests** | `pnpm test:unit` | All tests pass, coverage thresholds met |

### Running CI Checks Locally

```bash
# Mirror what CI runs — fix issues before pushing
pnpm lint
pnpm check-types
pnpm test:unit
pnpm build:api
```

### Common CI Failures & Fixes

| Error | Fix |
|-------|-----|
| `string \| undefined` not assignable to `string` | Add nullish fallback: `value ?? ""` |
| Missing export | Add export to the package's `index.ts` |
| Test timeout | Mock the slow dependency or increase timeout |
| Lint error | Run `pnpm lint --fix`, resolve remaining manually |
| Module not found | Run `pnpm install` to sync workspace dependencies |

---

## 🐛 Reporting Bugs

Found a bug? Open a [GitHub Issue](https://github.com/The-Boring-Education/TBE-Web/issues/new) and include:

1. **Clear title** — describe the bug in one sentence
2. **Steps to reproduce** — numbered, specific steps
3. **Expected behavior** — what should have happened
4. **Actual behavior** — what actually happened
5. **Environment** — OS, browser, Node.js version
6. **Screenshots/recordings** — especially for UI bugs

> ⚠️ **Security vulnerabilities:** Do **NOT** open a public issue. Contact maintainers privately. If your report exposes session tokens or secrets, rotate them immediately.

---

## 💡 Suggesting Features

Have an idea? Open a [GitHub Discussion](https://github.com/The-Boring-Education/TBE-Web/discussions) or an Issue tagged `enhancement`:

1. Describe the **problem** your feature solves
2. Propose your **solution**
3. List **alternatives** you considered
4. Note any **tradeoffs or downsides**

Feature requests are reviewed by maintainers and prioritized against the roadmap.

---

## ❓ Getting Help

| Resource | Use for |
|----------|---------|
| [GitHub Issues](https://github.com/The-Boring-Education/TBE-Web/issues) | Bugs & feature requests |
| [GitHub Discussions](https://github.com/The-Boring-Education/TBE-Web/discussions) | Questions & ideas |
| `apps/testing/README.md` | Testing deep dive |
| `docs/code-stability.md` | Refactor & quality backlog |
| Individual app `README.md` files | App-specific setup & docs |

---

## 🙏 Recognition

All contributors are recognized in our release notes and on the platform. We appreciate every contribution — from typo fixes to major features.

**Thank you for making TBE better for every learner! 🎓**

---

**Built with ❤️ by The Boring Education Team and contributors worldwide.**
