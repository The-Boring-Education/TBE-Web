import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSendRequest = vi.fn();
vi.mock("@tbe/utils", () => ({
  sendRequest: (...a: unknown[]) => mockSendRequest(...a),
}));

import { userService } from "@tbe/services/user";

describe("userService", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errSpy.mockRestore();
  });

  it("returns profile when response has status and data", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { id: "u1", name: "Ada" },
    });

    const profile = await userService.getProfile("u1");

    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/user?userId=u1",
      }),
    );
    expect(profile).toEqual({ id: "u1", name: "Ada" });
  });

  it("returns null when no data in response", async () => {
    mockSendRequest.mockResolvedValue({ status: true, data: null });
    const profile = await userService.getProfile("x");
    expect(profile).toBeNull();
  });

  it("returns null on request failure and logs", async () => {
    mockSendRequest.mockRejectedValue(new Error("network"));
    const profile = await userService.getProfile("x");
    expect(profile).toBeNull();
    expect(errSpy).toHaveBeenCalled();
  });
});
