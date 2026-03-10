import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockRequest,
  createMockResponse,
  executeHandler,
} from "../utils/api-test-helpers";

// Mock database functions
vi.mock("@/lib/database", () => ({
  getAllCourseFromDB: vi.fn(),
  getCourseBySlugFromDB: vi.fn(),
  getCourseBySlugWithUserFromDB: vi.fn(),
  getAllEnrolledCoursesFromDB: vi.fn(),
  addACourseToDB: vi.fn(),
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
import handler from "@api/pages/api/v1/shiksha/index";
import {
  getAllCourseFromDB,
  getCourseBySlugFromDB,
  getCourseBySlugWithUserFromDB,
  addACourseToDB,
} from "@/lib/database";

// Helper to create mock mongoose-like documents
function createMockCourse(id: string, data: any) {
  return {
    _id: { toString: () => id },
    ...data,
    toObject: () => ({ _id: id, ...data }),
  };
}

describe("Shiksha API - /api/v1/shiksha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/shiksha", () => {
    it("should return all courses", async () => {
      const mockCourses = [
        createMockCourse("1", {
          slug: "javascript-basics",
          title: "JavaScript Basics",
        }),
        createMockCourse("2", {
          slug: "react-advanced",
          title: "Advanced React",
        }),
      ];

      vi.mocked(getAllCourseFromDB).mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const req = createMockRequest("GET");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.status).toBe(true);
    });

    it("should return course by slug", async () => {
      const mockCourse = {
        _id: "1",
        slug: "javascript-basics",
        title: "JavaScript",
      };

      vi.mocked(getCourseBySlugWithUserFromDB).mockResolvedValue({
        data: mockCourse,
        error: null,
      });

      const req = createMockRequest("GET", undefined, {
        slug: "javascript-basics",
      });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.data).toEqual(mockCourse);
    });

    it("should return 404 when course not found", async () => {
      vi.mocked(getCourseBySlugWithUserFromDB).mockResolvedValue({
        data: null,
        error: "Not found",
      });

      const req = createMockRequest("GET", undefined, { slug: "non-existent" });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(404);
    });

    it("should handle database errors", async () => {
      vi.mocked(getAllCourseFromDB).mockResolvedValue({
        data: null,
        error: "DB error",
      });

      const req = createMockRequest("GET");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(500);
    });
  });

  describe("POST /api/v1/shiksha", () => {
    it("should create a new course", async () => {
      const mockPayload = { slug: "new-course", title: "New Course" };

      // Course doesn't exist (error returned means not found)
      vi.mocked(getCourseBySlugFromDB).mockResolvedValue({
        data: null,
        error: "Not found",
      });

      vi.mocked(addACourseToDB).mockResolvedValue({
        data: { _id: "new-id", ...mockPayload },
        error: null,
      });

      const req = createMockRequest("POST", mockPayload);
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.status).toBe(true);
    });

    it("should reject when course already exists", async () => {
      // No error means course exists
      vi.mocked(getCourseBySlugFromDB).mockResolvedValue({
        data: { _id: "existing", slug: "existing-course" },
        error: null,
      });

      const req = createMockRequest("POST", { slug: "existing-course" });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(400);
    });
  });

  describe("OPTIONS request", () => {
    it("should handle CORS preflight", async () => {
      const req = createMockRequest("OPTIONS");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
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
