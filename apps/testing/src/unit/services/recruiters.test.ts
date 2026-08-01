import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  trackEvent: vi.fn(),
}));

import { recruitersService } from "@tbe/services/recruiters";
import { trackEvent } from "@tbe/utils";

const mockTrackEvent = vi.mocked(trackEvent);

describe("recruitersService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const recruiter = {
    id: "r1",
    name: "Jane Doe",
    company: "Acme",
    applicationStatus: "PENDING",
  };

  describe("create", () => {
    it("posts recruiter data and tracks an analytics event", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true, data: recruiter }),
      } as Response);

      const result = await recruitersService.create({
        name: "Jane Doe",
        company: "Acme",
      } as any);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/prepyatra/recruiter"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(recruiter);
      expect(mockTrackEvent).toHaveBeenCalled();
    });

    it("throws with the API's error message on failure", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: false, message: "Invalid recruiter" }),
      } as Response);

      await expect(
        recruitersService.create({ name: "Jane" } as any),
      ).rejects.toThrow("Invalid recruiter");
    });

    it("does not fail when analytics tracking throws", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true, data: recruiter }),
      } as Response);
      mockTrackEvent.mockImplementation(() => {
        throw new Error("analytics down");
      });

      await expect(
        recruitersService.create({ name: "Jane Doe" } as any),
      ).resolves.toEqual(recruiter);
    });
  });

  describe("update", () => {
    it("PUTs the recruiter id and partial data", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true, data: recruiter }),
      } as Response);

      const result = await recruitersService.update("r1", {
        applicationStatus: "SHORTLISTED",
      } as any);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/prepyatra/recruiter"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            recruiterId: "r1",
            applicationStatus: "SHORTLISTED",
          }),
        }),
      );
      expect(result).toEqual(recruiter);
    });
  });

  describe("delete", () => {
    it("DELETEs the recruiter by id", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true }),
      } as Response);

      await recruitersService.delete("r1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/prepyatra/recruiter/r1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("throws on failure", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: false, message: "Not found" }),
      } as Response);

      await expect(recruitersService.delete("missing")).rejects.toThrow(
        "Not found",
      );
    });
  });

  describe("getById / getAll / getByStatus / getByUserId", () => {
    it("getById returns the recruiter", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true, data: recruiter }),
      } as Response);

      await expect(recruitersService.getById("r1")).resolves.toEqual(recruiter);
    });

    it("getAll returns an empty array fallback when data is missing", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true }),
      } as Response);

      await expect(recruitersService.getAll()).resolves.toEqual([]);
    });

    it("getByStatus filters by query param", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true, data: [recruiter] }),
      } as Response);

      await expect(
        recruitersService.getByStatus("PENDING" as any),
      ).resolves.toEqual([recruiter]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=PENDING"),
      );
    });

    it("getByUserId filters by query param", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: true, data: [recruiter] }),
      } as Response);

      await expect(recruitersService.getByUserId("user-1")).resolves.toEqual([
        recruiter,
      ]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("userId=user-1"),
      );
    });

    it("throws when the API returns an error for getAll", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ status: false, message: "Server error" }),
      } as Response);

      await expect(recruitersService.getAll()).rejects.toThrow("Server error");
    });
  });
});
