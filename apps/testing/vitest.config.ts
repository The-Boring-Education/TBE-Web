import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-utils/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist', 'src/e2e/**/*'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'src/test-utils/',
                'src/e2e/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData/',
                '**/mocks/',
                'src/api/mocks/'
            ],
            thresholds: {
                statements: 70,
                branches: 65,
                functions: 70,
                lines: 70
            }
        },
        testTimeout: 10000,
        hookTimeout: 10000
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@test-utils': path.resolve(__dirname, './src/test-utils')
        }
    }
});
