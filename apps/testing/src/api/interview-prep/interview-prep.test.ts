import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockRequest,
  createMockResponse,
  executeHandler,
} from "../utils/api-test-helpers";

// Mock database functions
vi.mock("@/lib/database", () => ({
  getAllInterviewSheetsFromDB: vi.fn(),
  getInterviewSheetBySlugFromDB: vi.fn(),
  addAInterviewSheetToDB: vi.fn(),
}));

// Mock middleware
vi.mock("@/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

// Mock CORS and utils
vi.mock("@/lib/utils", () => ({
  cors: vi.fn().mockResolvedValue(undefined),
  sendAPIResponse: (payload: any) => payload,
}));

// Mock constants
vi.mock("@/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

// Import after mocks
import handler from "@api/pages/api/v1/interview-prep/index";
import {
  getAllInterviewSheetsFromDB,
  getInterviewSheetBySlugFromDB,
  addAInterviewSheetToDB,
} from "@/lib/database";

describe("Interview Prep API - /api/v1/interview-prep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/interview-prep", () => {
    it("should return all interview sheets", async () => {
      const mockSheets = [
        {
          _id: "1",
          slug: "javascript-interview",
          title: "JavaScript Interview Prep",
        },
        { _id: "2", slug: "react-interview", title: "React Interview Prep" },
      ];

      vi.mocked(getAllInterviewSheetsFromDB).mockResolvedValue({
        data: mockSheets,
        error: null,
      });

      const req = createMockRequest("GET");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.status).toBe(true);
      expect(result.data.data).toEqual(mockSheets);
    });

    it("should return sheet by slug", async () => {
      const mockSheet = {
        _id: "1",
        slug: "javascript-interview",
        title: "JavaScript",
      };

      vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
        data: mockSheet,
        error: null,
      });

      const req = createMockRequest("GET", undefined, {
        slug: "javascript-interview",
      });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.data).toEqual(mockSheet);
    });

    it("should return 404 when sheet not found", async () => {
      vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
        data: null,
        error: "Not found",
      });

      const req = createMockRequest("GET", undefined, { slug: "non-existent" });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(404);
    });
  });

  describe("POST /api/v1/interview-prep", () => {
    it("should create a new sheet", async () => {
      const mockPayload = { slug: "new-sheet", title: "New Sheet" };

      vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
        data: null,
        error: "Not found",
      });

      vi.mocked(addAInterviewSheetToDB).mockResolvedValue({
        data: { _id: "new-id", ...mockPayload },
        error: null,
      });

      const req = createMockRequest("POST", mockPayload);
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.status).toBe(true);
    });

    it("should reject when sheet already exists", async () => {
      vi.mocked(getInterviewSheetBySlugFromDB).mockResolvedValue({
        data: { _id: "existing", slug: "existing-sheet" },
        error: null,
      });

      const req = createMockRequest("POST", { slug: "existing-sheet" });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(400);
    });
  });

  describe("Method Not Allowed", () => {
    it("should return error for PUT", async () => {
      const req = createMockRequest("PUT");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(400);
    });
  });
});
