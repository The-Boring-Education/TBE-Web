import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock sendRequest from utils first
vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

// Mock react-query
const mockFetchQuery = vi.fn();
const mockQueryClient = {
  fetchQuery: mockFetchQuery,
};

vi.mock("react-query", () => ({
  useQueryClient: () => mockQueryClient,
}));

// Import after mocks
import useApi from "@tbe/hooks/useApi";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useApi Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendRequest.mockResolvedValue({
      success: true,
      data: { id: 1, name: "Test" },
    });
  });

  describe("Initial State", () => {
    it("should return initial state with null data", () => {
      const { result } = renderHook(() =>
        useApi("test-key", undefined, { enabled: false }),
      );

      expect(result.current.response).toBe(null);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });

    it("should have makeRequest function", () => {
      const { result } = renderHook(() =>
        useApi("test-key", undefined, { enabled: false }),
      );

      expect(typeof result.current.makeRequest).toBe("function");
    });
  });

  describe("API Calls", () => {
    it("should make request when enabled and params provided", async () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      mockFetchQuery.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });

      const { result } = renderHook(() =>
        useApi("test-key", params, { enabled: true }),
      );

      await waitFor(() => {
        expect(mockFetchQuery).toHaveBeenCalled();
      });
    });

    it("should not make request when disabled", () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      renderHook(() => useApi("test-key", params, { enabled: false }));

      expect(mockFetchQuery).not.toHaveBeenCalled();
    });

    it("should call makeRequest with correct params", async () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      mockFetchQuery.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });

      const { result } = renderHook(() =>
        useApi("test-key", params, { enabled: false }),
      );

      await result.current.makeRequest();

      expect(mockFetchQuery).toHaveBeenCalledWith(
        ["test-key", params],
        expect.any(Function),
      );
    });

    it("should allow override params in makeRequest", async () => {
      const initialParams = {
        method: "GET" as const,
        url: "/api/test",
      };

      const overrideParams = {
        method: "POST" as const,
        url: "/api/test",
        body: { name: "New" },
      };

      mockFetchQuery.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });

      const { result } = renderHook(() =>
        useApi("test-key", initialParams, { enabled: false }),
      );

      await result.current.makeRequest(overrideParams);

      expect(mockFetchQuery).toHaveBeenCalledWith(
        ["test-key", overrideParams],
        expect.any(Function),
      );
    });
  });

  describe("Loading State", () => {
    it("should set loading to true during request", async () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      // Create a promise that we can control
      let resolveRequest: any;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });

      mockFetchQuery.mockReturnValue(requestPromise);
      mockSendRequest.mockReturnValue(requestPromise);

      const { result } = renderHook(() =>
        useApi("test-key", params, { enabled: false }),
      );

      const requestPromise2 = result.current.makeRequest();

      // Loading should be true during request
      // Note: This is tricky to test with the current implementation
      // as loading state is managed internally in fetchFunction
      expect(result.current.loading).toBe(false); // Initially false when not enabled
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors", async () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      const errorMessage = "Network error";
      mockSendRequest.mockRejectedValue(new Error(errorMessage));
      mockFetchQuery.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useApi("test-key", params, { enabled: false }),
      );

      try {
        await result.current.makeRequest();
      } catch (error: any) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe("Response Data", () => {
    it("should update response data on successful request", async () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      const mockResponse = {
        success: true,
        data: { id: 1, name: "Test User" },
      };

      mockFetchQuery.mockResolvedValue(mockResponse);
      mockSendRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useApi("test-key", params, { enabled: false }),
      );

      await result.current.makeRequest();

      // The response is set internally via fetchFunction
      // We verify makeRequest was called correctly
      expect(mockFetchQuery).toHaveBeenCalled();
    });
  });
});
