import { describe, it, expect } from 'vitest';

/**
 * Example utility test for date formatting from @tbe/utils
 * This demonstrates how to test utility functions
 */

// Mock implementation for testing
function formatDate(date: Date | string, format = 'default'): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }

    switch (format) {
        case 'short':
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        case 'long':
            return d.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        case 'time':
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        default:
            return d.toLocaleDateString('en-US');
    }
}

describe('formatDate Utility', () => {
    const testDate = new Date('2024-01-15T10:30:00');

    it('should format date with default format', () => {
        const result = formatDate(testDate);
        expect(result).toBe('1/15/2024');
    });

    it('should format date with short format', () => {
        const result = formatDate(testDate, 'short');
        expect(result).toBe('Jan 15, 2024');
    });

    it('should format date with long format', () => {
        const result = formatDate(testDate, 'long');
        expect(result).toBe('January 15, 2024');
    });

    it('should format date with time format', () => {
        const result = formatDate(testDate, 'time');
        expect(result).toMatch(/\d{1,2}:\d{2}\s(?:AM|PM)/);
    });

    it('should handle string dates', () => {
        const result = formatDate('2024-01-15');
        expect(result).toBe('1/15/2024');
    });

    it('should handle invalid dates', () => {
        const result = formatDate('invalid-date');
        expect(result).toBe('Invalid Date');
    });

    it('should handle timestamp', () => {
        const timestamp = testDate.getTime();
        const result = formatDate(new Date(timestamp));
        expect(result).toBe('1/15/2024');
    });
});
