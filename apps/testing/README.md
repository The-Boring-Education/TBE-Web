# 🧪 TBE Platform Testing Suite

Comprehensive testing infrastructure for The Boring Education Platform - ensuring quality, reliability, and bug-free deployments.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Testing Stack](#testing-stack)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This testing app provides a centralized, independent testing suite for the entire TBE Platform monorepo, covering:

- **Unit Tests** - Components, hooks, utilities, and services
- **API Tests** - REST API endpoints and integrations
- **E2E Tests** - Complete user flows across all apps

### Why This Approach?

✅ **Independent** - Doesn't interfere with production apps  
✅ **Centralized** - All tests in one place, easy to manage  
✅ **Scalable** - Easy to add tests for new features  
✅ **Fast** - Parallel execution, smart caching  
✅ **CI/CD Ready** - Integrated into deployment pipeline

## 🚀 Quick Start

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Install Playwright Browsers (for E2E tests)

```bash
cd apps/testing
pnpm playwright:install
```

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Run unit tests only (fast)
pnpm test:unit

# Run unit tests in watch mode (for development)
pnpm test:unit:watch

# Run API tests
pnpm test:api

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI (debugging)
pnpm test:e2e:ui

# Generate coverage report
pnpm test:coverage
```

## 🛠️ Testing Stack

### Unit Testing

- **Vitest** - Fast, modern test runner with native ESM support
- **React Testing Library** - Test React components as users interact with them
- **@testing-library/user-event** - Simulate user interactions
- **jsdom** - DOM environment for Node.js

**Why Vitest?**
- 5-10x faster than Jest
- Zero config for TypeScript
- Built-in watch mode with HMR
- Perfect for monorepos

### API Testing

- **MSW (Mock Service Worker)** - API mocking at network level
- **Supertest** - HTTP assertion library for API routes

**Why MSW?**
- Realistic API mocking
- Works in both Node.js and browser
- Reusable mock handlers

### E2E Testing

- **Playwright** - Modern browser automation
- Multi-browser support (Chromium, Firefox, WebKit)
- Auto-wait, no flaky tests
- Built-in trace viewer and screenshot diffing

**Why Playwright?**
- Faster than Cypress
- True cross-browser testing
- Better debugging tools
- Free parallelization

## 📁 Project Structure

```
apps/testing/
├── package.json                 # Testing dependencies
├── tsconfig.json               # TypeScript config
├── vitest.config.ts            # Unit test config
├── playwright.config.ts        # E2E test config
├── src/
│   ├── unit/                   # Unit tests
│   │   └── example.test.ts    # Example unit test
│   ├── api/                    # API tests
│   │   ├── example.test.ts    # Example API test
│   │   └── mocks/             # MSW mock handlers
│   ├── e2e/                    # E2E tests
│   │   ├── example.spec.ts    # Example E2E test
│   │   └── fixtures/          # Test data
│   └── test-utils/             # Shared test utilities
│       ├── setup.ts           # Global test setup
│       ├── test-helpers.tsx   # Helper functions
│       ├── mock-factories.ts  # Test data factories
│       └── custom-matchers.ts # Custom assertions
└── README.md
```

## 🏃 Running Tests

### Local Development

#### Unit Tests (Fastest - Use During Development)

```bash
# Watch mode - re-runs tests on file changes
pnpm test:unit:watch

# Run once
pnpm test:unit

# Run specific test file
pnpm test:unit src/unit/components/Button.test.tsx

# Run tests matching pattern
pnpm test:unit -- --grep="Button"
```

#### API Tests

```bash
# Run all API tests
pnpm test:api

# Run specific API test suite
pnpm test:api src/api/auth/login.test.ts
```

#### E2E Tests

```bash
# Run all E2E tests (all browsers)
pnpm test:e2e

# Run E2E tests for specific browser
pnpm test:e2e --project=chromium

# Run E2E in UI mode (great for debugging)
pnpm test:e2e:ui

# Run E2E in debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e src/e2e/platform/login.spec.ts
```

#### Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/index.html
```

### CI/CD Execution

```bash
# Run all tests as CI would
pnpm test:ci
```

## ✍️ Writing Tests

Check the example test files in `src/` for simple starting points:

- **Unit Test:** `src/unit/example.test.ts`
- **API Test:** `src/api/example.test.ts`  
- **E2E Test:** `src/e2e/example.spec.ts`

### Quick Examples

**Unit Test (Components, Utils, Hooks):**
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
    it('should work correctly', () => {
        expect(2 + 2).toBe(4);
    });
});
```

**API Test:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

describe('API Endpoint', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());

    it('should fetch data', async () => {
        const res = await fetch('http://localhost:3004/api/endpoint');
        const data = await res.json();
        expect(data.status).toBe(true);
    });
});
```

**E2E Test:**
```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    expect(page).toHaveTitle(/TBE/i);
});
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Pull requests to `development` and `production` branches
- Direct pushes to `development` and `production` branches

### Test Strategy by Branch

#### Development Branch
- ✅ Unit tests (fast feedback)
- ✅ API tests
- ✅ Smoke E2E tests (Chromium only)

#### Production Branch
- ✅ Complete test suite
- ✅ Multi-browser E2E (Chromium, Firefox, WebKit)
- 🚫 Blocks merge if tests fail

### Workflow Steps

1. **Install Dependencies** - pnpm install with caching
2. **Build Shared Packages** - Required for testing
3. **Run Unit Tests** - Fast feedback (~2-3 min)
4. **Run API Tests** - Integration testing (~3-5 min)
5. **Run E2E Tests** - Full user flows (~10-15 min)
6. **Generate Coverage** - Code coverage reports
7. **Upload Artifacts** - Test results, screenshots, videos

## 📚 Best Practices

### Unit Tests

✅ **DO:**
- Test user behavior, not implementation details
- Use semantic queries (`getByRole`, `getByLabelText`)
- Mock external dependencies (API calls, database)
- Keep tests fast (<100ms per test)
- Test edge cases and error states

❌ **DON'T:**
- Test third-party libraries
- Test implementation details (internal state)
- Use `data-testid` unless necessary
- Write slow tests with unnecessary delays

### API Tests

✅ **DO:**
- Test all HTTP methods (GET, POST, PATCH, DELETE)
- Test authentication and authorization
- Test validation errors
- Test rate limiting (if applicable)
- Clean up test data after each test

❌ **DON'T:**
- Test database internals
- Leave test data in database
- Skip error case testing
- Use production APIs in tests

### E2E Tests

✅ **DO:**
- Test critical user journeys
- Use Page Object Model pattern
- Run tests in parallel
- Take screenshots on failure
- Test across multiple browsers (production)
- Use explicit waits, not arbitrary timeouts

❌ **DON'T:**
- Test every edge case (use unit tests)
- Make tests dependent on each other
- Use `page.waitForTimeout()` (use auto-wait)
- Test UI minutiae (pixel-perfect layouts)

## 🧰 Test Utilities

### Mock Factories

Create test data easily:

```typescript
import { createMockUser, createMockQuiz } from '@test-utils/mock-factories';

const user = createMockUser({ email: 'custom@example.com' });
const quiz = createMockQuiz({ difficulty: 'hard' });
```

### Custom Matchers

TBE-specific assertions:

```typescript
expect('test@example.com').toBeValidEmail();
expect('507f1f77bcf86cd799439011').toBeValidMongoId();
expect(apiResponse).toHaveValidAPIResponse();
```

### Test Helpers

```typescript
import { renderWithProviders, createMockSession } from '@test-utils/test-helpers';

// Render with providers
renderWithProviders(<MyComponent />);

// Create mock session
const session = createMockSession({ user: { role: 'admin' } });

// Mock fetch
mockFetch({ status: true, data: { id: '123' } });
```

## 🐛 Troubleshooting

### Tests Failing Locally

```bash
# Clear test cache
rm -rf node_modules/.vitest

# Rebuild packages
pnpm run build

# Re-run tests
pnpm test:unit
```

### E2E Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
timeout: 60000 // 60 seconds

# Or run in debug mode
pnpm test:e2e:debug
```

### Coverage Not Generated

```bash
# Ensure coverage directory exists
mkdir -p coverage

# Run with coverage flag
pnpm test:coverage
```

### Playwright Browsers Not Found

```bash
cd apps/testing
pnpm playwright:install
```

## 📊 Coverage Requirements

Minimum thresholds enforced in CI:

- **Statements:** 70%
- **Branches:** 65%
- **Functions:** 70%
- **Lines:** 70%

Priority areas for coverage:
1. Authentication flows
2. Payment processing
3. Quiz evaluation logic
4. User data handling
5. API middleware

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

## 🤝 Contributing

When adding new features to TBE Platform:

1. **Write tests first** (TDD approach recommended)
2. **Ensure tests pass** locally before committing
3. **Maintain coverage** above minimum thresholds
4. **Update documentation** if adding new test patterns
5. **Add E2E tests** for critical user flows

## 📝 Example Test Checklist

When implementing a new feature:

- [ ] Unit tests for new components
- [ ] Unit tests for new hooks
- [ ] Unit tests for new utilities
- [ ] API tests for new endpoints
- [ ] E2E tests for critical flows
- [ ] Coverage meets minimum threshold
- [ ] Tests pass in CI/CD
- [ ] Documentation updated

---

**Happy Testing! 🎉**

For questions or issues, reach out to the TBE Platform team.
