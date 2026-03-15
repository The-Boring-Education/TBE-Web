import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../api/src/pages/api/v1/user/index";

// Mock dependencies
const mockGetUserByEmailFromDB = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockGetUserDataByUserNameFromDB = vi.fn();
const mockCreateUserInDB = vi.fn();
const mockSendWelcomeEmail = vi.fn();
const mockCors = vi.fn();
const mockConnectDB = vi.fn();
const mockSendAPIResponse = vi.fn((data) => data);
const mockCaptureAPIError = vi.fn();
const mockCaptureAuthError = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getUserByEmailFromDB: (...args: any[]) => mockGetUserByEmailFromDB(...args),
  getUserByIdFromDB: (...args: any[]) => mockGetUserByIdFromDB(...args),
  getUserDataByUserNameFromDB: (...args: any[]) =>
    mockGetUserDataByUserNameFromDB(...args),
  createUserInDB: (...args: any[]) => mockCreateUserInDB(...args),
}));

vi.mock("../../../../api/src/lib/services", () => ({
  sendWelcomeEmail: (...args: any[]) => mockSendWelcomeEmail(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  cors: (...args: any[]) => mockCors(...args),
  sendAPIResponse: (data: any) => mockSendAPIResponse(data),
  captureAPIError: (...args: any[]) => mockCaptureAPIError(...args),
  captureAuthError: (...args: any[]) => mockCaptureAuthError(...args),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: () => mockConnectDB(),
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

describe("User API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCors.mockResolvedValue(undefined);
    mockConnectDB.mockResolvedValue(undefined);
  });

  describe("GET /api/v1/user", () => {
    it("should get user by email", async () => {
      const mockUser = {
        _id: "123",
        email: "test@example.com",
        name: "Test User",
      };
      mockGetUserByEmailFromDB.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { email: "test@example.com" },
      });

      await handler(req, res);

      expect(mockGetUserByEmailFromDB).toHaveBeenCalledWith("test@example.com");
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(data.data).toEqual(mockUser);
    });

    it("should get user by userId", async () => {
      const mockUser = {
        _id: "123",
        email: "test@example.com",
        name: "Test User",
      };
      mockGetUserByIdFromDB.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: "123" },
      });

      await handler(req, res);

      expect(mockGetUserByIdFromDB).toHaveBeenCalledWith("123");
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
    });

    it("should get user by username", async () => {
      const mockUser = { _id: "123", username: "testuser", name: "Test User" };
      mockGetUserDataByUserNameFromDB.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { username: "testuser" },
      });

      await handler(req, res);

      expect(mockGetUserDataByUserNameFromDB).toHaveBeenCalledWith("testuser");
      expect(res._getStatusCode()).toBe(200);
    });

    it("should return error when no query params provided", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
      expect(data.message).toContain("Email or User id or Username");
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Database connection failed");
      mockGetUserByEmailFromDB.mockResolvedValue({
        data: null,
        error: dbError,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { email: "test@example.com" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(mockCaptureAPIError).toHaveBeenCalled();
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
    });
  });

  describe("POST /api/v1/user", () => {
    it("should create a new user", async () => {
      const newUser = {
        _id: "123",
        name: "New User",
        email: "new@example.com",
        provider: "google",
      };
      mockGetUserByEmailFromDB.mockResolvedValue({ data: null, error: null });
      mockCreateUserInDB.mockResolvedValue({ data: newUser, error: null });
      mockSendWelcomeEmail.mockResolvedValue(undefined);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          name: "New User",
          email: "new@example.com",
          provider: "google",
          providerAccountId: "google-123",
        },
      });

      await handler(req, res);

      expect(mockCreateUserInDB).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(data.data).toEqual(newUser);
    });

    it("should return existing user if email already exists", async () => {
      const existingUser = {
        _id: "123",
        name: "Existing User",
        email: "existing@example.com",
      };
      mockGetUserByEmailFromDB.mockResolvedValue({
        data: existingUser,
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          name: "Existing User",
          email: "existing@example.com",
          provider: "google",
        },
      });

      await handler(req, res);

      expect(mockCreateUserInDB).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(data.message).toContain("already exists");
    });

    it("should return error when email or name is missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "test@example.com",
          // name is missing
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
      // Check either error or message field
      const errorMessage = data.error || data.message || "";
      expect(errorMessage).toContain("email and name");
    });

    it("should handle user creation errors", async () => {
      const dbError = new Error("Failed to create user");
      mockGetUserByEmailFromDB.mockResolvedValue({ data: null, error: null });
      mockCreateUserInDB.mockResolvedValue({ data: null, error: dbError });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          name: "New User",
          email: "new@example.com",
          provider: "google",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
    });

    it("should send welcome email after user creation", async () => {
      const newUser = {
        _id: "123",
        name: "New User",
        email: "new@example.com",
      };
      mockGetUserByEmailFromDB.mockResolvedValue({ data: null, error: null });
      mockCreateUserInDB.mockResolvedValue({ data: newUser, error: null });
      mockSendWelcomeEmail.mockResolvedValue(undefined);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          name: "New User",
          email: "new@example.com",
          provider: "google",
        },
      });

      await handler(req, res);

      expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
        email: "new@example.com",
        name: "New User",
        id: "123",
      });
    });
  });
});
