import { apiStatusCodes } from '@/constant';
import { getLastPrepLogByUserFromDB } from '@/database';
import handler from '@/pages/api/v1/prepyatra/prep-log/last';
import { sendAPIResponse } from '@/utils';
import { testApiHandler } from 'next-test-api-route-handler';

// Mock the database function
jest.mock('@/database', () => ({
  getLastPrepLogByUserFromDB: jest.fn(),
}));

// Mock the middleware functions
jest.mock('@/middlewares', () => ({
  connectDB: jest.fn(),
}));

jest.mock('@/utils', () => ({
  cors: jest.fn(),
  sendAPIResponse: jest.fn((data) => data),
}));

const mockGetLastPrepLogByUserFromDB = getLastPrepLogByUserFromDB as jest.MockedFunction<
  typeof getLastPrepLogByUserFromDB
>;

describe('/api/v1/prepyatra/prep-log/last', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return last prep log with encouragement metadata', async () => {
    const mockPrepLog = {
      _id: 'log_id',
      user: 'user_id',
      title: 'Test Prep Log',
      description: 'Test description',
      timeSpent: 60,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    };

    mockGetLastPrepLogByUserFromDB.mockResolvedValue({ data: mockPrepLog });

    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET', query: { userId: 'test_user_id' } });
        expect(res.status).toBe(apiStatusCodes.OKAY);
        expect(mockGetLastPrepLogByUserFromDB).toHaveBeenCalledWith('test_user_id');
        expect(sendAPIResponse).toHaveBeenCalledWith({
          status: true,
          message: 'Last prep log retrieved successfully',
          data: mockPrepLog,
          details: {
            hasLogs: true,
            daysSinceLastLog: 5,
            shouldEncourage: true, // Should encourage because > 3 days
          },
        });
      },
    });
  });

  it('should return appropriate response when user has no prep logs', async () => {
    mockGetLastPrepLogByUserFromDB.mockResolvedValue({ data: null });

    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET', query: { userId: 'test_user_id' } });
        expect(res.status).toBe(apiStatusCodes.OKAY);
        expect(mockGetLastPrepLogByUserFromDB).toHaveBeenCalledWith('test_user_id');
        expect(sendAPIResponse).toHaveBeenCalledWith({
          status: true,
          message: 'No prep logs found for user',
          data: null,
          details: {
            hasLogs: false,
            shouldEncourage: true,
          },
        });
      },
    });
  });

  it('should not encourage when user logged recently', async () => {
    const mockPrepLog = {
      _id: 'log_id',
      user: 'user_id',
      title: 'Recent Prep Log',
      description: 'Recent log',
      timeSpent: 30,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    };

    mockGetLastPrepLogByUserFromDB.mockResolvedValue({ data: mockPrepLog });

    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        await fetch({ method: 'GET', query: { userId: 'test_user_id' } });
        expect(sendAPIResponse).toHaveBeenCalledWith({
          status: true,
          message: 'Last prep log retrieved successfully',
          data: mockPrepLog,
          details: {
            hasLogs: true,
            daysSinceLastLog: 1,
            shouldEncourage: false, // Should NOT encourage because <= 3 days
          },
        });
      },
    });
  });

  it('should return bad request when userId is missing', async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(apiStatusCodes.BAD_REQUEST);
        expect(mockGetLastPrepLogByUserFromDB).not.toHaveBeenCalled();
        expect(sendAPIResponse).toHaveBeenCalledWith({
          status: false,
          message: 'Missing or invalid userId',
        });
      },
    });
  });

  it('should handle database errors properly', async () => {
    mockGetLastPrepLogByUserFromDB.mockResolvedValue({
      error: 'Database connection failed',
    });

    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET', query: { userId: 'test_user_id' } });
        expect(res.status).toBe(apiStatusCodes.INTERNAL_SERVER_ERROR);
        expect(sendAPIResponse).toHaveBeenCalledWith({
          status: false,
          message: 'Database connection failed',
        });
      },
    });
  });

  it('should return method not allowed for non-GET requests', async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST', query: { userId: 'test_user_id' } });
        expect(res.status).toBe(apiStatusCodes.METHOD_NOT_ALLOWED);
        expect(sendAPIResponse).toHaveBeenCalledWith({
          status: false,
          message: 'Method POST not allowed',
        });
      },
    });
  });
});