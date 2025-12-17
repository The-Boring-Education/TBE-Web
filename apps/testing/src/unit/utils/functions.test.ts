import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    formatDate,
    formatTime,
    getDiscountPercentage,
    setLocalStorageItem,
    getLocalStorageItem,
    removeLocalStorageItem,
    cn
} from '@tbe/utils';

describe('Utility Functions', () => {
    describe('formatDate', () => {
        it('should format date with default options', () => {
            // Arrange: Set up test data
            const testDate = new Date('2024-01-15T10:30:00Z');
            
            // Act: Execute the function
            const result = formatDate({ dateAndTime: testDate.toISOString() });
            
            // Assert: Verify the result
            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('time');
            expect(typeof result.date).toBe('string');
            expect(typeof result.time).toBe('string');
        });

        it('should use current date when no dateAndTime provided', () => {
            // Act: Execute without dateAndTime
            const result = formatDate({});
            
            // Assert: Should return formatted date and time
            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('time');
        });

        it('should handle custom date format', () => {
            // Arrange: Set up test data with custom format
            const testDate = new Date('2024-01-15T10:30:00Z');
            const customDateFormat = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };
            
            // Act: Execute with custom format
            const result = formatDate({
                dateAndTime: testDate.toISOString(),
                dateFormat: customDateFormat as Intl.DateTimeFormatOptions
            });
            
            // Assert: Should use custom format
            expect(result).toHaveProperty('date');
            expect(result.date).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });

        it('should handle custom time format', () => {
            // Arrange: Set up test data with custom time format
            const testDate = new Date('2024-01-15T14:30:00Z');
            const customTimeFormat = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'UTC'
            };
            
            // Act: Execute with custom time format
            const result = formatDate({
                dateAndTime: testDate.toISOString(),
                timeFormat: customTimeFormat as Intl.DateTimeFormatOptions
            });
            
            // Assert: Should use custom time format
            expect(result).toHaveProperty('time');
            expect(result.time).toMatch(/\d{2}:\d{2}/);
        });

        it('should handle ISO string dates', () => {
            // Arrange: ISO string
            const isoString = '2024-01-15T10:30:00.000Z';
            
            // Act: Execute with ISO string
            const result = formatDate({ dateAndTime: isoString });
            
            // Assert: Should format correctly
            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('time');
        });

        it('should handle Date object strings', () => {
            // Arrange: Date string
            const dateString = '2024-01-15';
            
            // Act: Execute with date string
            const result = formatDate({ dateAndTime: dateString });
            
            // Assert: Should format correctly
            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('time');
        });
    });

    describe('formatTime', () => {
        it('should format single digit numbers with leading zero', () => {
            // Arrange
            const time = 5;
            
            // Act
            const result = formatTime(time);
            
            // Assert
            expect(result).toBe('05');
        });

        it('should format double digit numbers without leading zero', () => {
            // Arrange
            const time = 15;
            
            // Act
            const result = formatTime(time);
            
            // Assert
            expect(result).toBe('15');
        });

        it('should format zero correctly', () => {
            // Arrange
            const time = 0;
            
            // Act
            const result = formatTime(time);
            
            // Assert
            expect(result).toBe('00');
        });

        it('should format large numbers correctly', () => {
            // Arrange
            const time = 99;
            
            // Act
            const result = formatTime(time);
            
            // Assert
            expect(result).toBe('99');
        });

        it('should handle negative numbers', () => {
            // Arrange
            const time = -5;
            
            // Act
            const result = formatTime(time);
            
            // Assert
            expect(result).toBe('-5');
        });
    });

    describe('getDiscountPercentage', () => {
        it('should calculate discount percentage correctly', () => {
            // Arrange
            const basePrice = 1000;
            const sellingPrice = 800;
            
            // Act
            const result = getDiscountPercentage(basePrice, sellingPrice);
            
            // Assert
            expect(result).toBe(20);
        });

        it('should return 0% when prices are equal', () => {
            // Arrange
            const basePrice = 1000;
            const sellingPrice = 1000;
            
            // Act
            const result = getDiscountPercentage(basePrice, sellingPrice);
            
            // Assert
            expect(result).toBe(0);
        });

        it('should return 100% when selling price is 0', () => {
            // Arrange
            const basePrice = 1000;
            const sellingPrice = 0;
            
            // Act
            const result = getDiscountPercentage(basePrice, sellingPrice);
            
            // Assert
            expect(result).toBe(100);
        });

        it('should handle decimal prices and floor the result', () => {
            // Arrange
            const basePrice = 1000;
            const sellingPrice = 833.33;
            
            // Act
            const result = getDiscountPercentage(basePrice, sellingPrice);
            
            // Assert
            expect(result).toBe(16); // Math.floor(16.667)
        });

        it('should handle small price differences', () => {
            // Arrange
            const basePrice = 1000;
            const sellingPrice = 990;
            
            // Act
            const result = getDiscountPercentage(basePrice, sellingPrice);
            
            // Assert
            expect(result).toBe(1);
        });

        it('should return negative percentage when selling price is higher', () => {
            // Arrange
            const basePrice = 1000;
            const sellingPrice = 1200;
            
            // Act
            const result = getDiscountPercentage(basePrice, sellingPrice);
            
            // Assert
            expect(result).toBe(-20);
        });
    });

    describe('LocalStorage Functions', () => {
        // Mock localStorage
        let localStorageMock: { [key: string]: string } = {};

        beforeEach(() => {
            // Reset localStorage mock before each test
            localStorageMock = {};
            
            // Mock localStorage methods
            global.Storage.prototype.setItem = vi.fn((key: string, value: string) => {
                localStorageMock[key] = value;
            });
            
            global.Storage.prototype.getItem = vi.fn((key: string) => {
                return localStorageMock[key] || null;
            });
            
            global.Storage.prototype.removeItem = vi.fn((key: string) => {
                delete localStorageMock[key];
            });
            
            global.Storage.prototype.clear = vi.fn(() => {
                localStorageMock = {};
            });
        });

        describe('setLocalStorageItem', () => {
            it('should store string value in localStorage', () => {
                // Arrange
                const key = 'test-key';
                const value = 'test-value';
                
                // Act
                setLocalStorageItem(key, value);
                
                // Assert
                expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
            });

            it('should store object value in localStorage', () => {
                // Arrange
                const key = 'test-key';
                const value = { name: 'Test', id: 123 };
                
                // Act
                setLocalStorageItem(key, value);
                
                // Assert
                expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
            });

            it('should store array value in localStorage', () => {
                // Arrange
                const key = 'test-key';
                const value = [1, 2, 3, 'test'];
                
                // Act
                setLocalStorageItem(key, value);
                
                // Assert
                expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
            });

            it('should handle null value', () => {
                // Arrange
                const key = 'test-key';
                const value = null;
                
                // Act
                setLocalStorageItem(key, value);
                
                // Assert
                expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
            });

            it('should handle errors gracefully', () => {
                // Arrange
                const key = 'test-key';
                const value = { test: 'value' };
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
                
                // Mock localStorage.setItem to throw error
                global.Storage.prototype.setItem = vi.fn(() => {
                    throw new Error('Storage quota exceeded');
                });
                
                // Act
                setLocalStorageItem(key, value);
                
                // Assert
                expect(consoleErrorSpy).toHaveBeenCalled();
                
                // Cleanup
                consoleErrorSpy.mockRestore();
            });
        });

        describe('getLocalStorageItem', () => {
            it('should retrieve string value from localStorage', () => {
                // Arrange
                const key = 'test-key';
                const value = 'test-value';
                localStorage.setItem(key, JSON.stringify(value));
                
                // Act
                const result = getLocalStorageItem(key);
                
                // Assert
                expect(result).toBe(value);
            });

            it('should retrieve object value from localStorage', () => {
                // Arrange
                const key = 'test-key';
                const value = { name: 'Test', id: 123 };
                localStorage.setItem(key, JSON.stringify(value));
                
                // Act
                const result = getLocalStorageItem(key);
                
                // Assert
                expect(result).toEqual(value);
            });

            it('should retrieve array value from localStorage', () => {
                // Arrange
                const key = 'test-key';
                const value = [1, 2, 3, 'test'];
                localStorage.setItem(key, JSON.stringify(value));
                
                // Act
                const result = getLocalStorageItem(key);
                
                // Assert
                expect(result).toEqual(value);
            });

            it('should return null when key does not exist', () => {
                // Arrange
                const key = 'non-existent-key';
                
                // Act
                const result = getLocalStorageItem(key);
                
                // Assert
                expect(result).toBeNull();
            });

            it('should handle invalid JSON gracefully', () => {
                // Arrange
                const key = 'test-key';
                localStorage.setItem(key, 'invalid-json{');
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
                
                // Act
                const result = getLocalStorageItem(key);
                
                // Assert
                expect(consoleErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
                
                // Cleanup
                consoleErrorSpy.mockRestore();
            });

            it('should handle errors gracefully', () => {
                // Arrange
                const key = 'test-key';
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
                
                // Mock localStorage.getItem to throw error
                global.Storage.prototype.getItem = vi.fn(() => {
                    throw new Error('Storage error');
                });
                
                // Act
                const result = getLocalStorageItem(key);
                
                // Assert
                expect(consoleErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
                
                // Cleanup
                consoleErrorSpy.mockRestore();
            });
        });

        describe('removeLocalStorageItem', () => {
            it('should remove item from localStorage', () => {
                // Arrange
                const key = 'test-key';
                const value = 'test-value';
                localStorage.setItem(key, JSON.stringify(value));
                
                // Act
                removeLocalStorageItem(key);
                
                // Assert
                expect(localStorage.getItem(key)).toBeNull();
            });

            it('should handle removing non-existent key gracefully', () => {
                // Arrange
                const key = 'non-existent-key';
                
                // Act & Assert: Should not throw error
                expect(() => removeLocalStorageItem(key)).not.toThrow();
            });

            it('should handle errors gracefully', () => {
                // Arrange
                const key = 'test-key';
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
                
                // Mock localStorage.removeItem to throw error
                global.Storage.prototype.removeItem = vi.fn(() => {
                    throw new Error('Storage error');
                });
                
                // Act
                removeLocalStorageItem(key);
                
                // Assert
                expect(consoleErrorSpy).toHaveBeenCalled();
                
                // Cleanup
                consoleErrorSpy.mockRestore();
            });
        });
    });

    describe('cn (class name utility)', () => {
        it('should merge class names correctly', () => {
            // Arrange
            const class1 = 'bg-blue-500';
            const class2 = 'text-white';
            
            // Act
            const result = cn(class1, class2);
            
            // Assert
            expect(result).toContain('bg-blue-500');
            expect(result).toContain('text-white');
        });

        it('should handle conditional classes', () => {
            // Arrange
            const isActive = true;
            const baseClass = 'button';
            
            // Act
            const result = cn(baseClass, isActive && 'active');
            
            // Assert
            expect(result).toContain('button');
            expect(result).toContain('active');
        });

        it('should handle false conditional classes', () => {
            // Arrange
            const isActive = false;
            const baseClass = 'button';
            
            // Act
            const result = cn(baseClass, isActive && 'active');
            
            // Assert
            expect(result).toContain('button');
            expect(result).not.toContain('active');
        });

        it('should handle undefined and null values', () => {
            // Arrange
            const baseClass = 'button';
            
            // Act
            const result = cn(baseClass, undefined, null);
            
            // Assert
            expect(result).toContain('button');
        });

        it('should merge conflicting Tailwind classes', () => {
            // Arrange
            // twMerge should handle conflicting classes
            const class1 = 'p-4';
            const class2 = 'p-6';
            
            // Act
            const result = cn(class1, class2);
            
            // Assert
            // twMerge should keep the last one (p-6)
            expect(result).toContain('p-6');
            expect(result).not.toContain('p-4');
        });

        it('should handle empty strings', () => {
            // Arrange
            const baseClass = 'button';
            
            // Act
            const result = cn(baseClass, '');
            
            // Assert
            expect(result).toContain('button');
        });

        it('should handle array of classes', () => {
            // Arrange
            const classes = ['bg-blue-500', 'text-white', 'p-4'];
            
            // Act
            const result = cn(...classes);
            
            // Assert
            expect(result).toContain('bg-blue-500');
            expect(result).toContain('text-white');
            expect(result).toContain('p-4');
        });
    });
});

