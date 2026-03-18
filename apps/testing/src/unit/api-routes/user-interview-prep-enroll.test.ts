import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEnrollInASheet = vi.fn();
const mockGetEnrolledSheetFromDB = vi.fn();
const mockGetInterviewSheetByIDFromDB = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockSendInterviewPrepEnrollmentEmail = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  enrollInASheet: (...args: unknown[]) => mockEnrollInASheet(...args),
  getEnrolledSheetFromDB: (...args: unknown[]) =>
    mockGetEnrolledSheetFromDB(...args),
  getInterviewSheetByIDFromDB: (...args: unknown[]) =>
    mockGetInterviewSheetByIDFromDB(...args),
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
}));

vi.mock("../../../../api/src/lib/services", () => ({
  sendInterviewPrepEnrollmentEmail: (...args: unknown[]) =>
    mockSendInterviewPrepEnrollmentEmail(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), request: vi.fn() },
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => fn,
}));

import handler from "../../../../api/src/pages/api/v1/user/interview-prep/enroll";

describe("User Interview Prep Enroll API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendInterviewPrepEnrollmentEmail.mockResolvedValue(undefined);
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { email: "user@test.com", name: "Test User" },
      error: null,
    });
    mockGetInterviewSheetByIDFromDB.mockResolvedValue({
      data: { name: "Test Sheet", description: "Sheet desc" },
      error: null,
    });
  });

  it("rejects non-POST with 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Method");
  });

  it("returns 500 when getEnrolledSheetFromDB errors", async () => {
    mockGetEnrolledSheetFromDB.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed while enrolling in sheet");
  });

  it("returns 400 when already enrolled in sheet", async () => {
    mockGetEnrolledSheetFromDB.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Already enrolled in sheet");
  });

  it("returns 500 when enrollInASheet errors", async () => {
    mockGetEnrolledSheetFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInASheet.mockResolvedValue({
      data: null,
      error: new Error("Enroll failed"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed while enrolling in sheet");
  });

  it("returns 200 on successful enrollment", async () => {
    mockGetEnrolledSheetFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInASheet.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.message).toBe("Successfully enrolled in sheet");
    expect(data.data._id).toBe("enrollment-1");
  });

  it("sends email with correct data", async () => {
    mockGetEnrolledSheetFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInASheet.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    await vi.waitFor(() => {
      expect(mockSendInterviewPrepEnrollmentEmail).toHaveBeenCalledWith({
        email: "user@test.com",
        name: "Test User",
        id: "user-1",
        sheetName: "Test Sheet",
        sheetDescription: "Sheet desc",
      });
    });
  });

  it("returns 200 even when email fails", async () => {
    mockGetEnrolledSheetFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInASheet.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });
    mockSendInterviewPrepEnrollmentEmail.mockRejectedValue(
      new Error("Email failed"),
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
  });

  it("returns 200 when user/sheet fetch fails", async () => {
    mockGetEnrolledSheetFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInASheet.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });
    mockGetUserByIdFromDB.mockResolvedValue({
      data: null,
      error: new Error("User not found"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
  });

  it("returns 500 on internal error", async () => {
    mockGetEnrolledSheetFromDB.mockRejectedValue(new Error("Unexpected error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", sheetId: "sheet-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed while enrolling in sheet");
  });
});
