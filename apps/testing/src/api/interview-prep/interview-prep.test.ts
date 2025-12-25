import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, executeHandler } from '../utils/api-test-helpers';

// Mock database functions
vi.mock('@/lib/database', () => ({
    getAllInterviewSheetsFromDB: vi.fn(),
    getInterviewSheetBySlugFromDB: vi.fn(),
    addAInterviewSheetToDB: vi.fn(),
}));

// Mock middleware
vi.mock('@/middleware/api', () => ({
    connectDB: vi.fn().mockResolvedValue(undefined),
}));

// Mock CORS and utils
vi.mock('@/lib/utils', async () => {
    const actual = await vi.importActual('@/lib/utils');
    return {
        ...actual,
        cors: vi.fn().mockImplementation(async () => Promise.resolve()),
        sendAPIResponse: (payload: any) => payload,
    };
});

// Import handler after mocks
import handler from '../../../../api/src/pages/api/v1/interview-prep/index';
import {
    getAllInterviewSheetsFromDB,
    getInterviewSheetBySlugFromDB,
    addAInterviewSheetToDB,
} from '@/lib/database';
import { apiStatusCodes } from '@/lib/constants';

describe('Interview Prep API - /api/v1/interview-prep', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/interview-prep - Get Interview Sheets', () => {
        it('should return all interview sheets successfully', async () => {
            const mockSheets = [
                {
                    _id: '1',
                    slug: 'javascript-interview',
                    title: 'JavaScript Interview Prep',
                    description: 'Comprehensive JS interview questions',
                    isActive: true,
                },
                {
                    _id: '2',
                    slug: 'react-interview',
                    title: 'React Interview Prep',
                    description: 'React interview questions',
                    isActive: true,
                },
            ];

            vi.mocked(getAllInterviewSheetsFromDB).mockResolvedValue({
                data: mockSheets,
                error: null,
            });

            const req = createMockRequest('GET');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.status).toBe(true);
            expect(result.data.data).toEqual(mockSheets);
            expect(getAllInterviewSheetsFromDB).toHaveBeenCalled();
        });

        it('should return a specific sheet by slug', async () => {
            const mockSheet = {
                _id: '1',
                slug: 'javascript-interview',
                title: 'JavaScript Interview Prep',
                description: 'Comprehensive JS interview questions',
                questions: [],
                isActive: true,
            };

            vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
                data: mockSheet,
                error: null,
            });

            const req = createMockRequest('GET', undefined, { slug: 'javascript-interview' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.status).toBe(true);
            expect(result.data.data).toEqual(mockSheet);
            expect(getInterviewSheetBySlugFromDB).toHaveBeenCalledWith(
                'javascript-interview',
                undefined
            );
        });

        it('should return a sheet with user data when userId is provided', async () => {
            const mockSheet = {
                _id: '1',
                slug: 'javascript-interview',
                title: 'JavaScript Interview Prep',
                isEnrolled: true,
                completedQuestions: ['q1', 'q2'],
            };

            vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
                data: mockSheet,
                error: null,
            });

            const req = createMockRequest('GET', undefined, {
                slug: 'javascript-interview',
                userId: 'user123',
            });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.data).toEqual(mockSheet);
            expect(getInterviewSheetBySlugFromDB).toHaveBeenCalledWith(
                'javascript-interview',
                'user123'
            );
        });

        it('should return 404 when sheet not found', async () => {
            vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
                data: null,
                error: 'Sheet not found',
            });

            const req = createMockRequest('GET', undefined, { slug: 'non-existent' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.NOT_FOUND);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Sheet not found');
        });

        it('should handle database errors when fetching all sheets', async () => {
            vi.mocked(getAllInterviewSheetsFromDB).mockResolvedValue({
                data: null,
                error: 'Database connection failed',
            });

            const req = createMockRequest('GET');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.INTERNAL_SERVER_ERROR);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Failed while fetching sheets');
        });
    });

    describe('POST /api/v1/interview-prep - Create Interview Sheet', () => {
        it('should create a new interview sheet successfully', async () => {
            const mockSheetPayload = {
                slug: 'new-interview-sheet',
                title: 'New Interview Sheet',
                description: 'Description of the sheet',
                category: 'MERN',
                companyTypes: ['Startup', 'MNC'],
                isActive: true,
            };

            const mockCreatedSheet = {
                _id: 'new-sheet-id',
                ...mockSheetPayload,
            };

            // Mock that sheet doesn't exist
            vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
                data: null,
                error: 'Sheet not found', // This means sheet doesn't exist (check logic in handler)
            });

            vi.mocked(addAInterviewSheetToDB).mockResolvedValue({
                data: mockCreatedSheet,
                error: null,
            });

            const req = createMockRequest('POST', mockSheetPayload);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.status).toBe(true);
            expect(result.data.message).toBe('Sheet added successfully');
            expect(result.data.data).toEqual(mockCreatedSheet);
        });

        it('should reject creation when sheet with slug already exists', async () => {
            const mockSheetPayload = {
                slug: 'existing-sheet',
                title: 'Existing Sheet',
                description: 'Description',
            };

            // Mock that sheet already exists (error is null means it exists)
            vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
                data: { _id: 'existing-id', slug: 'existing-sheet' },
                error: null, // No error means sheet exists
            });

            const req = createMockRequest('POST', mockSheetPayload);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.BAD_REQUEST);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Sheet already exists');
        });

        it('should handle database errors during sheet creation', async () => {
            const mockSheetPayload = {
                slug: 'new-sheet',
                title: 'New Sheet',
                description: 'Description',
            };

            vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
                data: null,
                error: 'Sheet not found',
            });

            vi.mocked(addAInterviewSheetToDB).mockResolvedValue({
                data: null,
                error: 'Database error occurred',
            });

            const req = createMockRequest('POST', mockSheetPayload);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.INTERNAL_SERVER_ERROR);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Sheet not added');
        });
    });

    describe('Method Not Allowed', () => {
        it('should return 405 for unsupported HTTP methods', async () => {
            const req = createMockRequest('PUT');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.BAD_REQUEST);
            expect(result.data.message).toContain('Not Allowed');
        });
    });
});

