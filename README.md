# The Boring Education

Welcome to **The Boring Education**! This is an open-source educational platform built with **Next.js** and **MongoDB**. Our goal is to provide a simple, engaging way to learn web development and product design.

## Project Overview

This project is designed to help students and developers improve their programming skills through interactive tutorials, examples, and challenges. We're building a community where learning is fun and accessible to everyone.

## Getting Started

To set up this project locally and start developing, follow these steps:

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/your-userName/TBE-Web.git
cd the-boring-education
```

### 2. Install Dependencies

```
npm install
```

### 3. Set Up Environment Variables

You will need to create a `.env.local` file to configure the environment:

```bash
# Create .env.local file
touch .env.local
```

Add environment variables to your `.env.local` file as needed:

```bash
# Add environment variables here as needed
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Start the Development Server

```
npm run dev
```

## Building & Deployment

### Development Build

```bash
npm run build
```

### Production Build

```bash
NODE_ENV=production npm run build
```

**That's it!** The build automatically configures the correct URLs for your environment.

# Want to contribute?

Please refer to our [Contribution Guidelines](CONTRIBUTING.md) for detailed information on how to contribute to this project.

## 🧪 Testing & Quality Assurance

Our automated quality gates cover everything from isolated units to full browser flows.

1. **Unit & Integration Tests (Jest)** – Located under `src/**/__tests__` or `tests/`. Run locally with:
   ```bash
   npm test         # quick feedback
   npm run test:ci  # generates coverage report in ./coverage
   ```
2. **API Route Tests** – Powered by `next-test-api-route-handler`, executed together with Jest. See `tests/api/*` for examples.
3. **End-to-End (E2E) Tests** – Headless browser checks written with Playwright and stored in `e2e/`.
   ```bash
   npm run test:e2e
   ```
4. **Continuous Integration** – Every Pull Request triggers `.github/workflows/ci-tests.yml` which:
   - installs dependencies
   - runs all Jest suites & publishes coverage artifacts
   - spins up the dev server and executes Playwright scenarios

Feel free to add more tests; any file that matches `*.test.{js,ts,tsx}` will be picked up automatically.

### Mocking patterns

#### Component / Module

```ts
import { render } from '@testing-library/react';

// Mock the next/router for deterministic navigation
jest.mock('next/router', () => require('next-router-mock'));

// Mock a utility module
jest.mock('@/utils/api', () => ({
  fetcher: jest.fn(() => Promise.resolve({ data: 'fake' })),
}));

// Now render your component and assert
```

#### API mocking with MSW

```ts
// tests/msw/handlers.ts
import { rest } from 'msw';
export const handlers = [
  rest.get('/api/user/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: req.params.id, name: 'Mocky' }));
  }),
];
```

The server is auto-started in `jest.setup.js` making network calls deterministic.

### Advanced Patterns

1. **Testing Framer-Motion components** – Wrap expectations in `await waitFor` if animation influences DOM timing.
2. **Mocking child components** – Use `jest.mock('@/components', () => ({ ... }))` to isolate the unit under test (see `Navbar.test.tsx`).
3. **Using MSW in component tests** – Component fetches data:
   ```ts
   rest.get('/api/v1/posts', (_req, res, ctx) =>
     res(ctx.json([{ id: 1, title: 'Demo' }]))
   );
   ```
   Push local handler inside test via `server.use()` to override default behaviour.
4. **Playwright fixtures** – Add file `e2e/fixtures.ts` exporting custom fixtures for signed-in state, reducing boilerplate across specs.

## 📧 Email System

The TBE Email System provides a robust, scalable email sending solution with support for multiple email types and external API integration.

### Features

- ✅ Multiple email types (Welcome, Course Enrollment, Project Enrollment, Interview Prep, Course Completion)
- ✅ External API support for third-party integrations
- ✅ Comprehensive logging and error tracking
- ✅ Template-based email generation
- ✅ Request tracking with unique IDs

### Quick Start

```javascript
// Send a welcome email
const response = await fetch('/api/v1/email/external', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailType: 'WELCOME',
    userData: {
      email: 'user@example.com',
      name: 'John Doe',
      id: 'user123',
    },
  }),
});
```

### API Endpoints

- `POST /api/v1/email/send` - Send custom emails
- `POST /api/v1/email/triggers` - Send trigger-based emails
- `POST /api/v1/email/external` - Simplified API for external products

### Documentation

For detailed documentation and integration examples, see:

- [Email Service Documentation](src/services/email/README.md)
- [External Integration Examples](examples/external-email-usage.md)
