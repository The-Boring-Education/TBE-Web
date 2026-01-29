import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAPIResponseMapper from '@tbe/hooks/useAPIResponseMapper';

describe('useAPIResponseMapper Hook', () => {
    describe('Mapping Function', () => {
        it('should map data using provided mapping function', () => {
            const mockData = [{ id: 1, name: 'Item 1' }];
            const mappingFunction = vi.fn((data) =>
                data.map((item: any) => ({ ...item, mapped: true }))
            );

            const { result } = renderHook(() =>
                useAPIResponseMapper(mockData, mappingFunction)
            );

            expect(mappingFunction).toHaveBeenCalledWith(mockData, undefined);
            expect(result.current).toEqual([{ id: 1, name: 'Item 1', mapped: true }]);
        });

        it('should pass additional params to mapping function', () => {
            const mockData = [{ id: 1 }];
            const additionalParams = { filter: 'active' };
            const mappingFunction = vi.fn((data, params) => {
                return data.map((item: any) => ({ ...item, ...params }));
            });

            const { result } = renderHook(() =>
                useAPIResponseMapper(mockData, mappingFunction, additionalParams)
            );

            expect(mappingFunction).toHaveBeenCalledWith(mockData, additionalParams);
            expect(result.current).toEqual([{ id: 1, filter: 'active' }]);
        });
    });

    describe('Data Updates', () => {
        it('should update mapped data when input data changes', () => {
            const mappingFunction = (data: any) => data.map((item: any) => ({ ...item, mapped: true }));

            const { result, rerender } = renderHook(
                ({ data }) => useAPIResponseMapper(data, mappingFunction),
                { initialProps: { data: [{ id: 1 }] } }
            );

            expect(result.current).toEqual([{ id: 1, mapped: true }]);

            rerender({ data: [{ id: 2 }, { id: 3 }] });

            expect(result.current).toEqual([
                { id: 2, mapped: true },
                { id: 3, mapped: true },
            ]);
        });

        it('should not map when data is null or undefined', () => {
            const mappingFunction = vi.fn((data) => data);

            const { result } = renderHook(() =>
                useAPIResponseMapper(null, mappingFunction)
            );

            expect(mappingFunction).not.toHaveBeenCalled();
            expect(result.current).toEqual([]);
        });
    });

    describe('Mapping Function Changes', () => {
        it('should remap when mapping function changes', () => {
            const data = [{ id: 1, value: 10 }];
            const mappingFunction1 = (data: any) => data.map((item: any) => ({ ...item, type: 'A' }));
            const mappingFunction2 = (data: any) => data.map((item: any) => ({ ...item, type: 'B' }));

            const { result, rerender } = renderHook(
                ({ mapper }) => useAPIResponseMapper(data, mapper),
                { initialProps: { mapper: mappingFunction1 } }
            );

            expect(result.current).toEqual([{ id: 1, value: 10, type: 'A' }]);

            rerender({ mapper: mappingFunction2 });

            expect(result.current).toEqual([{ id: 1, value: 10, type: 'B' }]);
        });
    });

    describe('Initial State', () => {
        it('should return empty array initially', () => {
            const mappingFunction = vi.fn((data) => data);

            const { result } = renderHook(() =>
                useAPIResponseMapper(null, mappingFunction)
            );

            expect(result.current).toEqual([]);
        });
    });
});
