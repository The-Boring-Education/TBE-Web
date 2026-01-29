/**
 * Authentication helpers for E2E tests
 * Provides utilities to authenticate users in tests
 */

import { Page } from '@playwright/test';

/**
 * Authenticate a user for E2E tests
 * This sets up the session cookie or auth state
 */
export async function authenticateUser(page: Page, email?: string, password?: string) {
    // Option 1: Set auth cookie directly (if using NextAuth)
    // This requires knowing the session structure
    
    // Option 2: Navigate to login and sign in
    // For now, we'll use a mock approach
    
    // Set auth state in localStorage or cookies
    await page.context().addCookies([
        {
            name: 'next-auth.session-token',
            value: 'mock-session-token',
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        }
    ]);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
    const cookies = await page.context().cookies();
    return cookies.some(cookie => 
        cookie.name.includes('auth') || 
        cookie.name.includes('session')
    );
}

/**
 * Logout user
 */
export async function logoutUser(page: Page) {
    await page.context().clearCookies();
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
}
