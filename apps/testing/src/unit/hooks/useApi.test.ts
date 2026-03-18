import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

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
      const { result } = renderHookWithQuery(() =>
        useApi("test-key", undefined, { enabled: false }),
      );

      expect(result.current.response).toBe(null);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });

    it("should have makeRequest function", () => {
      const { result } = renderHookWithQuery(() =>
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

      const { result } = renderHookWithQuery(() =>
        useApi("test-key", params, { enabled: true }),
      );

      await waitFor(() => {
        expect(mockSendRequest).toHaveBeenCalledWith(params);
      });
    });

    it("should not make request when disabled", () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      renderHookWithQuery(() => useApi("test-key", params, { enabled: false }));

      expect(mockSendRequest).not.toHaveBeenCalled();
    });

    it("should call makeRequest with correct params", async () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      const { result } = renderHookWithQuery(() =>
        useApi("test-key", params, { enabled: false }),
      );

      await result.current.makeRequest();

      expect(mockSendRequest).toHaveBeenCalledWith(params);
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

      const { result } = renderHookWithQuery(() =>
        useApi("test-key", initialParams, { enabled: false }),
      );

      await result.current.makeRequest(overrideParams);

      expect(mockSendRequest).toHaveBeenCalledWith(overrideParams);
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
      mockSendRequest.mockResolvedValue(mockResponse);

      const { result } = renderHookWithQuery(() =>
        useApi("test-key-response", params, { enabled: true }),
      );

      await waitFor(() => {
        expect(result.current.response).toEqual(mockResponse);
      });
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors", async () => {
      const params = {
        method: "GET" as const,
        url: "/api/test",
      };

      mockSendRequest.mockRejectedValue(new Error("Network error"));

      const { result } = renderHookWithQuery(() =>
        useApi("test-key-error", params, { enabled: false }),
      );

      try {
        await result.current.makeRequest();
      } catch {
        // expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
      });
    });
  });
});
