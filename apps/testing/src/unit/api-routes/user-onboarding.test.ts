import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../../../api/src/pages/api/v1/user/onboarding";

const mockOnboardUserToDB = vi.fn();
const mockUserFindById = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getUserByUserNameFromDB: vi.fn(),
  onboardPrepYatraUserTODB: vi.fn(),
  onboardUserToDB: (...args: any[]) => mockOnboardUserToDB(...args),
}));

vi.mock("../../../../api/src/lib/database/models", () => ({
  User: {
    findById: (...args: any[]) => mockUserFindById(...args),
  },
}));

vi.mock("../../../../api/src/lib/services", () => ({
  emailTriggerService: {
    sendExternalEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (data: any) => data,
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  withUserAuth: (handler: any) => handler,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: any) => handler,
}));

vi.mock("../../../../api/src/lib/validation/mongodb", () => ({
  isMongoObjectIdString: () => true,
}));

describe("POST /api/v1/user/onboarding phone number validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindById.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      isOnboarded: false,
    });
  });

  it("accepts valid 10-digit phone number with country code", async () => {
    mockOnboardUserToDB.mockResolvedValue({
      data: {
        _id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        name: "Test User",
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { userId: "507f1f77bcf86cd799439011" },
      body: {
        userName: "rohit",
        occupation: "TECH_STUDENT",
        purpose: ["web_dev"],
        contactNo: "+91 9876543210",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockOnboardUserToDB).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "rohit",
      "TECH_STUDENT",
      ["web_dev"],
      "+91 9876543210",
      undefined,
      expect.any(Object),
    );
  });

  it("rejects oversized (>10 digits) phone numbers", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { userId: "507f1f77bcf86cd799439011" },
      body: {
        userName: "rohit",
        occupation: "TECH_STUDENT",
        purpose: ["web_dev"],
        contactNo: "+91 919876543210",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("Invalid contact number format");
    expect(mockOnboardUserToDB).not.toHaveBeenCalled();
  });

  it("rejects phone numbers with invalid country code", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { userId: "507f1f77bcf86cd799439011" },
      body: {
        userName: "rohit",
        occupation: "TECH_STUDENT",
        purpose: ["web_dev"],
        contactNo: "91 9876543210",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("Invalid contact number format");
  });
});
