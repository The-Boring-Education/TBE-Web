import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils/analytics", () => ({
  trackEvent: vi.fn(),
}));
vi.mock("@tbe/utils/api", () => ({
  sendRequest: vi.fn(),
}));

import { trackEvent } from "@tbe/utils/analytics";
import { sendRequest } from "@tbe/utils/api";
import { prepLogsService } from "@tbe/utils/prepLogs";

const mockSendRequest = vi.mocked(sendRequest);
const mockTrackEvent = vi.mocked(trackEvent);

describe("prepLogsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const log = {
    _id: "log-1",
    user: "user-1",
    title: "Solved DP problems",
    timeSpent: 2,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    __v: 0,
  };

  describe("getByUserId", () => {
    it("fetches prep logs for a user", async () => {
      mockSendRequest.mockResolvedValue({ success: true, data: [log] });

      const result = await prepLogsService.getByUserId("user-1");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/prepyatra/prep-logs?userId=user-1",
        method: "GET",
      });
      expect(result).toEqual([log]);
    });

    it("throws and logs when the request is unsuccessful", async () => {
      mockSendRequest.mockResolvedValue({ success: false });

      await expect(prepLogsService.getByUserId("user-1")).rejects.toThrow(
        "Failed to fetch prep logs",
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("creates a prep log and tracks analytics", async () => {
      mockSendRequest.mockResolvedValue({ success: true, data: log });

      const result = await prepLogsService.create({
        title: "Solved DP problems",
        timeSpent: 2,
        user: "user-1",
      });

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/prepyatra/prep-logs",
        method: "POST",
        data: { title: "Solved DP problems", timeSpent: 2, user: "user-1" },
      });
      expect(mockTrackEvent).toHaveBeenCalled();
      expect(result).toEqual(log);
    });

    it("throws when creation fails", async () => {
      mockSendRequest.mockResolvedValue({ success: false });

      await expect(
        prepLogsService.create({
          title: "x",
          timeSpent: 1,
          user: "user-1",
        }),
      ).rejects.toThrow("Failed to create prep log");
    });

    it("does not fail when analytics tracking throws", async () => {
      mockSendRequest.mockResolvedValue({ success: true, data: log });
      mockTrackEvent.mockImplementation(() => {
        throw new Error("analytics down");
      });

      await expect(
        prepLogsService.create({
          title: "x",
          timeSpent: 1,
          user: "user-1",
        }),
      ).resolves.toEqual(log);
    });
  });

  describe("update", () => {
    it("updates a prep log and tracks analytics", async () => {
      mockSendRequest.mockResolvedValue({ success: true, data: log });

      const result = await prepLogsService.update({
        logId: "log-1",
        title: "Updated title",
      });

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/prepyatra/prep-logs/log-1",
        method: "PUT",
        data: {
          title: "Updated title",
          description: undefined,
          timeSpent: undefined,
          mentorFeedback: undefined,
        },
      });
      expect(result).toEqual(log);
    });

    it("throws when the update fails", async () => {
      mockSendRequest.mockResolvedValue({ success: false });

      await expect(prepLogsService.update({ logId: "log-1" })).rejects.toThrow(
        "Failed to update prep log",
      );
    });
  });

  describe("delete", () => {
    it("deletes a prep log and tracks analytics", async () => {
      mockSendRequest.mockResolvedValue({ success: true });

      await prepLogsService.delete("log-1");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/prepyatra/prep-logs/log-1",
        method: "DELETE",
      });
      expect(mockTrackEvent).toHaveBeenCalled();
    });

    it("throws when deletion fails", async () => {
      mockSendRequest.mockResolvedValue({ success: false });

      await expect(prepLogsService.delete("log-1")).rejects.toThrow(
        "Failed to delete prep log",
      );
    });
  });
});
