import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateUserInDB = vi.fn();
const mockGetUserByEmailFromDB = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockGetUserDataByUserNameFromDB = vi.fn();
const mockSendWelcomeEmail = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  createUserInDB: (...args: unknown[]) => mockCreateUserInDB(...args),
  getUserByEmailFromDB: (...args: unknown[]) =>
    mockGetUserByEmailFromDB(...args),
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
  getUserDataByUserNameFromDB: (...args: unknown[]) =>
    mockGetUserDataByUserNameFromDB(...args),
}));

vi.mock("../../../../api/src/lib/services", () => ({
  sendWelcomeEmail: (...args: unknown[]) => mockSendWelcomeEmail(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
  captureAPIError: vi.fn(),
  captureAuthError: vi.fn(),
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { error: vi.fn() },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

import handler from "../../../../api/src/pages/api/v1/user/index";

describe("User Index API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendWelcomeEmail.mockResolvedValue(undefined);
  });

  it("GET by email - success (200)", async () => {
    const userData = { _id: "u1", email: "test@example.com", name: "Test" };
    mockGetUserByEmailFromDB.mockResolvedValue({ data: userData, error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { email: "test@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(userData);
    expect(mockGetUserByEmailFromDB).toHaveBeenCalledWith("test@example.com");
  });

  it("GET by email - error (500)", async () => {
    mockGetUserByEmailFromDB.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { email: "test@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Error while fetching user");
  });

  it("GET by userId - success (200)", async () => {
    const userData = { _id: "u1", email: "test@example.com", name: "Test" };
    mockGetUserByIdFromDB.mockResolvedValue({ data: userData, error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(userData);
    expect(mockGetUserByIdFromDB).toHaveBeenCalledWith("u1");
  });

  it("GET by userId - error (500)", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Error while fetching user");
  });

  it("GET by username - success (200)", async () => {
    const userData = { _id: "u1", username: "johndoe", name: "John" };
    mockGetUserDataByUserNameFromDB.mockResolvedValue({
      data: userData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { username: "johndoe" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(userData);
    expect(mockGetUserDataByUserNameFromDB).toHaveBeenCalledWith("johndoe");
  });

  it("GET by username - error (500)", async () => {
    mockGetUserDataByUserNameFromDB.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { username: "johndoe" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Error while fetching user");
  });

  it("GET no params → 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Please provide Email or User id or Username");
  });

  it("POST - new user created successfully (200)", async () => {
    mockGetUserByEmailFromDB.mockResolvedValue({ data: null, error: null });
    mockCreateUserInDB.mockResolvedValue({
      data: { _id: "new-user-1", email: "new@example.com", name: "New User" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { name: "New User", email: "new@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data._id).toBe("new-user-1");
    expect(mockCreateUserInDB).toHaveBeenCalled();
  });

  it("POST - new user, welcome email sent", async () => {
    const createdUser = {
      _id: { toString: () => "new-user-1" },
      email: "new@example.com",
      name: "New User",
    };
    mockGetUserByEmailFromDB.mockResolvedValue({ data: null, error: null });
    mockCreateUserInDB.mockResolvedValue({
      data: createdUser,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { name: "New User", email: "new@example.com" },
    });

    await handler(req, res);

    expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
      email: "new@example.com",
      name: "New User",
      id: "new-user-1",
    });
  });

  it("POST - existing user returned (200)", async () => {
    const existingUser = {
      _id: "existing-1",
      email: "existing@example.com",
      name: "Existing User",
    };
    mockGetUserByEmailFromDB.mockResolvedValue({
      data: existingUser,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { name: "Existing User", email: "existing@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.message).toBe("User already exists");
    expect(data.data).toEqual(existingUser);
    expect(mockCreateUserInDB).not.toHaveBeenCalled();
  });

  it("POST - missing fields (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { name: "Only Name" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Error while creating user");
    expect(data.error).toBe("Please provide email and name");
  });

  it("POST - create error (500)", async () => {
    mockGetUserByEmailFromDB.mockResolvedValue({ data: null, error: null });
    mockCreateUserInDB.mockResolvedValue({
      data: null,
      error: new Error("Create failed"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { name: "New User", email: "new@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Error while creating user");
  });
});
