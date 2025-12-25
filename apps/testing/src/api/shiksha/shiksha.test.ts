import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, executeHandler } from '../utils/api-test-helpers';

// Mock database functions
vi.mock('@/lib/database', () => ({
    getAllCourseFromDB: vi.fn(),
    getCourseBySlugFromDB: vi.fn(),
    getCourseBySlugWithUserFromDB: vi.fn(),
    getAllEnrolledCoursesFromDB: vi.fn(),
    addACourseToDB: vi.fn(),
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
import handler from '../../../../api/src/pages/api/v1/shiksha/index';
import {
    getAllCourseFromDB,
    getCourseBySlugFromDB,
    getCourseBySlugWithUserFromDB,
    getAllEnrolledCoursesFromDB,
    addACourseToDB,
} from '@/lib/database';
import { apiStatusCodes } from '@/lib/constants';

describe('Shiksha API - /api/v1/shiksha', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/shiksha - Get Courses', () => {
        it('should return all courses successfully', async () => {
            const mockCourses = [
                {
                    _id: '1',
                    slug: 'javascript-basics',
                    title: 'JavaScript Basics',
                    description: 'Learn JavaScript fundamentals',
                    isActive: true,
                },
                {
                    _id: '2',
                    slug: 'react-advanced',
                    title: 'Advanced React',
                    description: 'Master React concepts',
                    isActive: true,
                },
            ];

            vi.mocked(getAllCourseFromDB).mockResolvedValue({
                data: mockCourses,
                error: null,
            });

            const req = createMockRequest('GET');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.status).toBe(true);
            expect(Array.isArray(result.data.data)).toBe(true);
            expect(getAllCourseFromDB).toHaveBeenCalled();
        });

        it('should return all courses with enrollment status when userId is provided', async () => {
            const mockCourses = [
                {
                    _id: '1',
                    slug: 'javascript-basics',
                    title: 'JavaScript Basics',
                    isActive: true,
                },
                {
                    _id: '2',
                    slug: 'react-advanced',
                    title: 'Advanced React',
                    isActive: true,
                },
            ];

            const mockEnrolledCourses = [
                {
                    _id: '1',
                    slug: 'javascript-basics',
                    isEnrolled: true,
                },
            ];

            vi.mocked(getAllCourseFromDB).mockResolvedValue({
                data: mockCourses,
                error: null,
            });

            vi.mocked(getAllEnrolledCoursesFromDB).mockResolvedValue({
                data: mockEnrolledCourses,
                error: null,
            });

            const req = createMockRequest('GET', undefined, { userId: 'user123' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.status).toBe(true);
            expect(result.data.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ _id: '1', isEnrolled: true }),
                ])
            );
            expect(getAllEnrolledCoursesFromDB).toHaveBeenCalledWith('user123');
        });

        it('should return a specific course by slug', async () => {
            const mockCourse = {
                _id: '1',
                slug: 'javascript-basics',
                title: 'JavaScript Basics',
                description: 'Learn JavaScript fundamentals',
                chapters: [],
                isActive: true,
            };

            vi.mocked(getCourseBySlugWithUserFromDB).mockResolvedValue({
                data: mockCourse,
                error: null,
            });

            const req = createMockRequest('GET', undefined, { slug: 'javascript-basics' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.status).toBe(true);
            expect(result.data.data).toEqual(mockCourse);
            expect(getCourseBySlugWithUserFromDB).toHaveBeenCalledWith(
                'javascript-basics',
                undefined
            );
        });

        it('should return a course with user data when both slug and userId are provided', async () => {
            const mockCourse = {
                _id: '1',
                slug: 'javascript-basics',
                title: 'JavaScript Basics',
                isEnrolled: true,
                completedChapters: ['ch1', 'ch2'],
            };

            vi.mocked(getCourseBySlugWithUserFromDB).mockResolvedValue({
                data: mockCourse,
                error: null,
            });

            const req = createMockRequest('GET', undefined, {
                slug: 'javascript-basics',
                userId: 'user123',
            });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.data).toEqual(mockCourse);
            expect(getCourseBySlugWithUserFromDB).toHaveBeenCalledWith(
                'javascript-basics',
                'user123'
            );
        });

        it('should return 404 when course not found', async () => {
            vi.mocked(getCourseBySlugWithUserFromDB).mockResolvedValue({
                data: null,
                error: 'Course not found',
            });

            const req = createMockRequest('GET', undefined, { slug: 'non-existent' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.NOT_FOUND);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Course not found');
        });

        it('should handle database errors when fetching all courses', async () => {
            vi.mocked(getAllCourseFromDB).mockResolvedValue({
                data: null,
                error: 'Database connection failed',
            });

            const req = createMockRequest('GET');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.INTERNAL_SERVER_ERROR);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Failed while fetching courses');
        });

        it('should handle errors when fetching enrolled courses', async () => {
            const mockCourses = [{ _id: '1', slug: 'course1' }];

            vi.mocked(getAllCourseFromDB).mockResolvedValue({
                data: mockCourses,
                error: null,
            });

            vi.mocked(getAllEnrolledCoursesFromDB).mockResolvedValue({
                data: null,
                error: 'Failed to fetch enrolled courses',
            });

            const req = createMockRequest('GET', undefined, { userId: 'user123' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.INTERNAL_SERVER_ERROR);
            expect(result.data.message).toBe('Failed while fetching enrolled courses');
        });
    });

    describe('POST /api/v1/shiksha - Create Course', () => {
        it('should create a new course successfully', async () => {
            const mockCoursePayload = {
                slug: 'new-course',
                title: 'New Course',
                description: 'Course description',
                chapters: [],
                isActive: true,
            };

            const mockCreatedCourse = {
                _id: 'new-course-id',
                ...mockCoursePayload,
            };

            // Mock that course doesn't exist
            vi.mocked(getCourseBySlugFromDB).mockResolvedValue({
                data: null,
                error: 'Course not found', // This means course doesn't exist
            });

            vi.mocked(addACourseToDB).mockResolvedValue({
                data: mockCreatedCourse,
                error: null,
            });

            const req = createMockRequest('POST', mockCoursePayload);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.OKAY);
            expect(result.data.status).toBe(true);
            expect(result.data.message).toBe('Course added successfully');
            expect(result.data.data).toEqual(mockCreatedCourse);
        });

        it('should reject creation when course with slug already exists', async () => {
            const mockCoursePayload = {
                slug: 'existing-course',
                title: 'Existing Course',
                description: 'Description',
            };

            // Mock that course already exists (error is null means it exists)
            vi.mocked(getCourseBySlugFromDB).mockResolvedValue({
                data: { _id: 'existing-id', slug: 'existing-course' },
                error: null, // No error means course exists
            });

            const req = createMockRequest('POST', mockCoursePayload);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.BAD_REQUEST);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Course already exists');
        });

        it('should handle database errors during course creation', async () => {
            const mockCoursePayload = {
                slug: 'new-course',
                title: 'New Course',
                description: 'Description',
            };

            vi.mocked(getCourseBySlugFromDB).mockResolvedValue({
                data: null,
                error: 'Course not found',
            });

            vi.mocked(addACourseToDB).mockResolvedValue({
                data: null,
                error: 'Database error occurred',
            });

            const req = createMockRequest('POST', mockCoursePayload);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(apiStatusCodes.INTERNAL_SERVER_ERROR);
            expect(result.data.status).toBe(false);
            expect(result.data.message).toBe('Course not added');
        });
    });

    describe('OPTIONS request', () => {
        it('should handle OPTIONS request for CORS', async () => {
            const req = createMockRequest('OPTIONS');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(200);
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

