import { describe, it, expect } from 'vitest';

/**
 * Simple unit test example
 * Add your component, hook, and utility tests here
 */

describe('Example Unit Test', () => {
    it('should perform basic arithmetic', () => {
        expect(2 + 2).toBe(4);
    });

    it('should validate string operations', () => {
        const text = 'Hello TBE';
        expect(text).toContain('TBE');
        expect(text.length).toBe(9);
    });
});

