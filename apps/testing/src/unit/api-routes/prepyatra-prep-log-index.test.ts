import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddPrepLogToDB = vi.fn();
const mockDeletePrepLogInDB = vi.fn();
const mockGetPrepLogsByUserFromDB = vi.fn();
const mockHandleGamificationPoints = vi.fn();
const mockUpdatePrepLogInDB = vi.fn();
const mockSendEmail = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    METHOD_NOT_ALLOWED: 405,
    RESOURCE_CREATED: 201,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addPrepLogToDB: (...args: unknown[]) => mockAddPrepLogToDB(...args),
  deletePrepLogInDB: (...args: unknown[]) => mockDeletePrepLogInDB(...args),
  getPrepLogsByUserFromDB: (...args: unknown[]) =>
    mockGetPrepLogsByUserFromDB(...args),
  handleGamificationPoints: (...args: unknown[]) =>
    mockHandleGamificationPoints(...args),
  updatePrepLogInDB: (...args: unknown[]) => mockUpdatePrepLogInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("../../../../api/src/lib/services", () => ({
  emailClient: {
    sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  ) => fn,
}));

import handler from "../../../../api/src/pages/api/v1/prepyatra/prep-log/index";

describe("PrepYatra Prep Log API Route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_SECRET: "TBEAdmin" };
    mockSendEmail.mockResolvedValue(undefined);
  });

  it("rejects unsupported methods with 405", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "OPTIONS",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("POST - missing fields returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("required");
  });

  it("POST - successful create with gamification returns 201", async () => {
    mockAddPrepLogToDB.mockResolvedValue({
      data: { _id: "log-1", title: "Log" },
      error: null,
    });
    mockHandleGamificationPoints.mockResolvedValue(undefined);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        title: "Study",
        timeSpent: 60,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(mockHandleGamificationPoints).toHaveBeenCalled();
  });

  it("POST - addPrepLogToDB error returns 400", async () => {
    mockAddPrepLogToDB.mockResolvedValue({
      data: null,
      error: "Validation failed",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        title: "Study",
        timeSpent: 60,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Validation failed");
  });

  it("POST - gamification error does not fail request returns 201", async () => {
    mockAddPrepLogToDB.mockResolvedValue({
      data: { _id: "log-1" },
      error: null,
    });
    mockHandleGamificationPoints.mockRejectedValue(
      new Error("Gamification fail"),
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        title: "Study",
        timeSpent: 60,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
  });

  it("GET - missing userId returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("userId");
  });

  it("GET - successful fetch returns 200", async () => {
    const logs = [{ _id: "l1", title: "Log 1" }];
    mockGetPrepLogsByUserFromDB.mockResolvedValue({
      data: logs,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data).toEqual(logs);
  });

  it("GET - fetch error returns 500", async () => {
    mockGetPrepLogsByUserFromDB.mockResolvedValue({
      data: null,
      error: "DB error",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });

  it("PUT - missing prepLogId returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      body: { title: "Updated" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("prepLogId");
  });

  it("PUT - successful update returns 200", async () => {
    mockUpdatePrepLogInDB.mockResolvedValue({
      data: { _id: "log-1", title: "Updated" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      body: { prepLogId: "log-1", title: "Updated" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
  });

  it("PUT - update error returns 400", async () => {
    mockUpdatePrepLogInDB.mockResolvedValue({
      data: null,
      error: "Update failed",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      body: { prepLogId: "log-1", title: "Updated" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("PATCH - unauthorized (wrong admin secret) returns 401", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      headers: { "x-admin-secret": "wrong" },
      body: { prepLogId: "log-1", mentorFeedback: "Good job" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Unauthorized");
  });

  it("PATCH - unauthorized (missing admin secret) returns 401", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: { prepLogId: "log-1", mentorFeedback: "Good job" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("PATCH - missing required fields returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      headers: { "x-admin-secret": "TBEAdmin" },
      body: { prepLogId: "log-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("prepLogId");
  });

  it("PATCH - successful feedback + email returns 200", async () => {
    mockUpdatePrepLogInDB.mockResolvedValue({
      data: { _id: "log-1", mentorFeedback: "Good" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      headers: { "x-admin-secret": "TBEAdmin" },
      body: {
        prepLogId: "log-1",
        mentorFeedback: "Good job",
        notifyEmail: true,
        userEmail: "u@test.com",
        userName: "User Name",
        userId: "u1",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(mockSendEmail).toHaveBeenCalled();
  });

  it("PATCH - email send failure does not fail response returns 200", async () => {
    mockUpdatePrepLogInDB.mockResolvedValue({
      data: { _id: "log-1" },
      error: null,
    });
    mockSendEmail.mockRejectedValue(new Error("Email failed"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      headers: { "x-admin-secret": "TBEAdmin" },
      body: {
        prepLogId: "log-1",
        mentorFeedback: "Good",
        notifyEmail: true,
        userEmail: "u@test.com",
        userName: "User",
        userId: "u1",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  it("DELETE - missing prepLogId returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("prepLogId");
  });

  it("DELETE - successful delete returns 200", async () => {
    mockDeletePrepLogInDB.mockResolvedValue({
      data: { _id: "log-1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      query: { prepLogId: "log-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
  });

  it("DELETE - log not found returns 404", async () => {
    mockDeletePrepLogInDB.mockResolvedValue({
      data: null,
      error: "Not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      query: { prepLogId: "log-missing" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Log not found");
  });
});
