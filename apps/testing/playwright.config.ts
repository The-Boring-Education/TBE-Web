import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './src/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list']
    ],
    use: {
        baseURL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        },

        // Mobile viewports
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] }
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] }
        }
    ],

    // Run local dev server before starting tests (only in local development)
    // In CI or when running via turbo, servers are started manually
    // webServer is disabled when CI=true or when TURBO=true (running via turbo)
    webServer: (process.env.CI || process.env.TURBO) ? undefined : [
        {
            command: 'cd ../.. && pnpm dev:platform',
            url: 'http://localhost:3000',
            reuseExistingServer: true,
            timeout: 120000,
            stdout: 'pipe',
            stderr: 'pipe'
        },
        {
            command: 'cd ../.. && pnpm dev:prep-yatra',
            url: 'http://localhost:3001',
            reuseExistingServer: true,
            timeout: 120000,
            stdout: 'pipe',
            stderr: 'pipe'
        },
        {
            command: 'cd ../.. && pnpm dev:quizes',
            url: 'http://localhost:3002',
            reuseExistingServer: true,
            timeout: 120000,
            stdout: 'pipe',
            stderr: 'pipe'
        },
        {
            command: 'cd ../.. && pnpm dev:api',
            url: 'http://localhost:3004',
            reuseExistingServer: true,
            timeout: 120000,
            stdout: 'pipe',
            stderr: 'pipe'
        }
    ]
});
