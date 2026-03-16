import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({ trackEvent: vi.fn() }));

global.fetch = vi.fn();

import { challengesService } from "@tbe/services";
import { trackEvent } from "@tbe/utils";

const mockFetch = vi.mocked(global.fetch);
const mockTrackEvent = vi.mocked(trackEvent);

describe("challengesService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: "https://api.test.com/v1",
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("getByUserId", () => {
    it("returns challenges on success with data", async () => {
      const mockData = [{ id: "1", name: "Challenge 1" }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response);

      const result = await challengesService.getByUserId("user-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/v1/prepyatra/challenges?userId=user-123",
        { headers: { "Content-Type": "application/json" } },
      );
      expect(result).toEqual(mockData);
    });

    it("returns empty array on success with empty data", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      const result = await challengesService.getByUserId("user-123");

      expect(result).toEqual([]);
    });

    it("throws on HTTP error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 } as Response);

      await expect(challengesService.getByUserId("user-123")).rejects.toThrow(
        "HTTP error! status: 500",
      );
    });

    it("throws on unsuccessful API response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, status: false }),
      } as Response);

      await expect(challengesService.getByUserId("user-123")).rejects.toThrow(
        "Failed to fetch challenges",
      );
    });
  });

  describe("create", () => {
    it("creates challenge successfully and tracks analytics", async () => {
      const mockData = { id: "1", name: "New Challenge" };
      const createData = {
        user: "user-123",
        name: "New Challenge",
        totalDays: 30,
        category: "coding",
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response);

      const result = await challengesService.create(createData);

      expect(result).toEqual(mockData);
      expect(mockTrackEvent).toHaveBeenCalledWith("challenge_create", {
        category: "challenge",
        value: 30,
        challengeName: "New Challenge",
        challengeCategory: "coding",
      });
    });

    it("throws on HTTP error with response text", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Invalid request body",
      } as Response);

      await expect(
        challengesService.create({
          user: "user-123",
          name: "Test",
          totalDays: 30,
          category: "coding",
        }),
      ).rejects.toThrow(
        "HTTP error! status: 400, message: Invalid request body",
      );
    });

    it("throws on unsuccessful API response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, status: false }),
      } as Response);

      await expect(
        challengesService.create({
          user: "user-123",
          name: "Test",
          totalDays: 30,
          category: "coding",
        }),
      ).rejects.toThrow(
        "Failed to create challenge - API returned unsuccessful response",
      );
    });

    it("succeeds when trackEvent throws", async () => {
      const mockData = { id: "1", name: "New Challenge" };
      mockTrackEvent.mockImplementation(() => {
        throw new Error("Analytics error");
      });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response);

      const result = await challengesService.create({
        user: "user-123",
        name: "Test",
        totalDays: 30,
        category: "coding",
      });

      expect(result).toEqual(mockData);
    });
  });

  describe("update", () => {
    it("updates challenge with correct payload shape", async () => {
      const mockData = { id: "ch-1", name: "Updated Challenge" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response);

      const result = await challengesService.update({
        challengeId: "ch-1",
        name: "Updated Challenge",
        totalDays: 45,
        category: "dsa",
        isActive: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/v1/prepyatra/challenges/ch-1",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Updated Challenge",
            totalDays: 45,
            category: "dsa",
            isActive: true,
          }),
        },
      );
      expect(result).toEqual(mockData);
    });

    it("tracks updated fields in analytics", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response);

      await challengesService.update({
        challengeId: "ch-1",
        name: "New Name",
        totalDays: 60,
      });

      expect(mockTrackEvent).toHaveBeenCalledWith("challenge_update", {
        category: "challenge",
        challengeId: "ch-1",
        updatedFields: ["name", "totalDays"],
      });
    });
  });

  describe("delete", () => {
    it("deletes challenge successfully and tracks analytics", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await challengesService.delete("ch-1");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/v1/prepyatra/challenges/ch-1",
        { method: "DELETE", headers: { "Content-Type": "application/json" } },
      );
      expect(mockTrackEvent).toHaveBeenCalledWith("challenge_delete", {
        category: "challenge",
        challengeId: "ch-1",
      });
    });

    it("throws on HTTP error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 } as Response);

      await expect(challengesService.delete("ch-1")).rejects.toThrow(
        "HTTP error! status: 404",
      );
    });
  });

  describe("getLogs", () => {
    it("returns logs on success", async () => {
      const mockLogs = [{ day: 1, progressText: "Day 1 complete" }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockLogs }),
      } as Response);

      const result = await challengesService.getLogs("ch-1");

      expect(result).toEqual(mockLogs);
    });

    it("returns empty array when data is empty", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      const result = await challengesService.getLogs("ch-1");

      expect(result).toEqual([]);
    });
  });

  describe("createLog", () => {
    it("creates log successfully and tracks analytics", async () => {
      const mockLog = { id: "log-1", day: 1, hoursSpent: 2 };
      const createData = {
        challengeId: "ch-1",
        day: 1,
        hoursSpent: 2,
        progressText: "Done",
        nextGoals: [],
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockLog }),
      } as Response);

      const result = await challengesService.createLog(createData);

      expect(result).toEqual(mockLog);
      expect(mockTrackEvent).toHaveBeenCalledWith("challenge_log_create", {
        category: "challenge",
        challengeId: "ch-1",
        day: 1,
        hoursSpent: 2,
      });
    });
  });

  describe("getProgress", () => {
    it("returns progress on success", async () => {
      const mockProgress = { completedDays: 5, totalDays: 30 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockProgress }),
      } as Response);

      const result = await challengesService.getProgress("ch-1");

      expect(result).toEqual(mockProgress);
    });

    it("throws on HTTP error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 } as Response);

      await expect(challengesService.getProgress("ch-1")).rejects.toThrow(
        "HTTP error! status: 500",
      );
    });
  });

  describe("generateSocialMediaTemplate", () => {
    it("uses nextGoals when provided", () => {
      process.env.NEXT_PUBLIC_BASE_URL = "https://app.test.com";
      const challenge = { id: "1", name: "DSA Challenge" } as any;
      const currentLog = {
        day: 5,
        progressText: "Solved 3 problems",
        nextGoals: ["Finish array chapter"],
      } as any;
      const customGoals = ["Goal A", "Goal B"];

      const result = challengesService.generateSocialMediaTemplate(
        challenge,
        currentLog,
        customGoals,
      );

      expect(result.nextGoals).toEqual(customGoals);
    });

    it("falls back to currentLog.nextGoals when nextGoals is empty", () => {
      process.env.NEXT_PUBLIC_BASE_URL = "https://app.test.com";
      const challenge = { id: "1", name: "DSA Challenge" } as any;
      const currentLog = {
        day: 5,
        progressText: "Solved 3 problems",
        nextGoals: ["Finish array chapter"],
      } as any;

      const result = challengesService.generateSocialMediaTemplate(
        challenge,
        currentLog,
      );

      expect(result.nextGoals).toEqual(["Finish array chapter"]);
    });
  });

  describe("formatSocialMediaMessage", () => {
    it("formats message correctly with goals", () => {
      const template = {
        challengeName: "DSA 30",
        currentDay: 5,
        progressText: "Solved arrays",
        nextGoals: ["Learn hashmaps", "Solve 2 more"],
        appUrl: "https://app.test.com",
      };

      const result = challengesService.formatSocialMediaMessage(template);

      expect(result).toContain("Today was Day 5 of DSA 30");
      expect(result).toContain("I worked on -");
      expect(result).toContain("Solved arrays");
      expect(result).toContain("My next goal is -");
      expect(result).toContain("1. Learn hashmaps");
      expect(result).toContain("2. Solve 2 more");
      expect(result).toContain("https://app.test.com");
    });
  });
});
