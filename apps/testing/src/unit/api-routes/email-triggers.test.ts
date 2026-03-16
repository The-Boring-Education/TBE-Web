import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSendTriggerEmail = vi.fn();

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

vi.mock("../../../../api/src/lib/services", () => ({
  emailTriggerService: {
    sendTriggerEmail: (...args: unknown[]) => mockSendTriggerEmail(...args),
  },
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { error: vi.fn() },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

import handler from "../../../../api/src/pages/api/v1/email/triggers";

describe("Email Triggers API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reject non-POST (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("Not Allowed");
  });

  it("missing trigger field (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        data: {
          userEmail: "u@example.com",
          userName: "User",
          userId: "u1",
        },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Missing required fields: trigger, data");
  });

  it("missing data field (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { trigger: "welcome" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Missing required fields: trigger, data");
  });

  it("missing userEmail in data (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        trigger: "welcome",
        data: {
          userName: "User",
          userId: "u1",
        },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe(
      "Missing required user data: userEmail, userName, userId",
    );
  });

  it("missing userName in data (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        trigger: "welcome",
        data: {
          userEmail: "u@example.com",
          userId: "u1",
        },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe(
      "Missing required user data: userEmail, userName, userId",
    );
  });

  it("email sent successfully (200)", async () => {
    mockSendTriggerEmail.mockResolvedValue({ success: true });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        trigger: "welcome",
        data: {
          userEmail: "u@example.com",
          userName: "User",
          userId: "u1",
        },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.message).toBe("welcome email sent successfully");
    expect(mockSendTriggerEmail).toHaveBeenCalledWith("welcome", {
      userEmail: "u@example.com",
      userName: "User",
      userId: "u1",
    });
  });

  it("email send failed (500)", async () => {
    mockSendTriggerEmail.mockResolvedValue({
      success: false,
      error: new Error("Send failed"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        trigger: "welcome",
        data: {
          userEmail: "u@example.com",
          userName: "User",
          userId: "u1",
        },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Failed to send welcome email");
  });

  it("internal error (500)", async () => {
    mockSendTriggerEmail.mockRejectedValue(new Error("Unexpected error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        trigger: "welcome",
        data: {
          userEmail: "u@example.com",
          userName: "User",
          userId: "u1",
        },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Failed to send email trigger");
  });
});
