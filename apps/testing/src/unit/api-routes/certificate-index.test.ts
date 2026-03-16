import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddACertificateToDB = vi.fn();
const mockCheckCertificateExistForAProgram = vi.fn();
const mockUpdateCertificateToUserShikshaCourseDoc = vi.fn();
const mockUpdateUserPointsInDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addACertificateToDB: (...args: unknown[]) => mockAddACertificateToDB(...args),
  checkCertificateExistForAProgram: (...args: unknown[]) =>
    mockCheckCertificateExistForAProgram(...args),
  updateCertificateToUserShikshaCourseDoc: (...args: unknown[]) =>
    mockUpdateCertificateToUserShikshaCourseDoc(...args),
  updateUserPointsInDB: (...args: unknown[]) =>
    mockUpdateUserPointsInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

import handler from "../../../../api/src/pages/api/v1/certificate/index";

describe("Certificate Index API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("POST - certificate already exists returns 200 with existing", async () => {
    const existingCert = {
      _id: "cert-1",
      type: "SHIKSHA",
      userId: "u1",
      programId: "p1",
    };
    mockCheckCertificateExistForAProgram.mockResolvedValue({
      data: existingCert,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { type: "SHIKSHA", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data._id).toBe("cert-1");
    expect(data.message).toBe("Certificate already exists");
    expect(mockAddACertificateToDB).not.toHaveBeenCalled();
  });

  it("POST - add new non-SHIKSHA certificate returns 200 without points update", async () => {
    mockCheckCertificateExistForAProgram.mockResolvedValue({ data: null });
    mockAddACertificateToDB.mockResolvedValue({
      data: { _id: "cert-2", type: "OTHER", userId: "u1", programId: "p1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { type: "OTHER", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data._id).toBe("cert-2");
    expect(mockUpdateCertificateToUserShikshaCourseDoc).not.toHaveBeenCalled();
    expect(mockUpdateUserPointsInDB).not.toHaveBeenCalled();
  });

  it("POST - add new SHIKSHA certificate returns 200 with points and course doc updated", async () => {
    mockCheckCertificateExistForAProgram.mockResolvedValue({ data: null });
    mockAddACertificateToDB.mockResolvedValue({
      data: { _id: "cert-3", type: "SHIKSHA", userId: "u1", programId: "p1" },
      error: null,
    });
    mockUpdateCertificateToUserShikshaCourseDoc.mockResolvedValue(undefined);
    mockUpdateUserPointsInDB.mockResolvedValue(undefined);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { type: "SHIKSHA", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(mockUpdateCertificateToUserShikshaCourseDoc).toHaveBeenCalledWith(
      "u1",
      "p1",
      "cert-3",
    );
    expect(mockUpdateUserPointsInDB).toHaveBeenCalledWith(
      "u1",
      "COMPLETE_COURSE_CERTIFICATE",
    );
  });

  it("POST - addACertificateToDB fails returns 400", async () => {
    mockCheckCertificateExistForAProgram.mockResolvedValue({ data: null });
    mockAddACertificateToDB.mockResolvedValue({
      data: null,
      error: "Failed to add",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { type: "OTHER", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed while adding Certificate");
  });

  it("POST - internal error returns 500", async () => {
    mockCheckCertificateExistForAProgram.mockRejectedValue(
      new Error("DB crash"),
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { type: "SHIKSHA", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed while adding Certificate");
  });

  it("GET - all fields present, certificate found returns 200", async () => {
    const cert = {
      _id: "cert-1",
      type: "SHIKSHA",
      userId: "u1",
      programId: "p1",
    };
    mockCheckCertificateExistForAProgram.mockResolvedValue({ data: cert });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "SHIKSHA", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data._id).toBe("cert-1");
  });

  it("GET - certificate not found returns 404", async () => {
    mockCheckCertificateExistForAProgram.mockResolvedValue({ data: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "SHIKSHA", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Certificate not found");
  });

  it("GET - missing required fields returns 400 with list of missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "SHIKSHA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Missing required fields");
    expect(data.message).toContain("User ID");
    expect(data.message).toContain("Program ID");
  });

  it("GET - internal error returns 500", async () => {
    mockCheckCertificateExistForAProgram.mockRejectedValue(
      new Error("DB error"),
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "SHIKSHA", userId: "u1", programId: "p1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed while fetching Certificate");
  });
});
