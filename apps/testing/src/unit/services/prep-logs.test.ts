import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockTrackEvent = vi.fn();
vi.mock("@tbe/utils", async (importOriginal) => {
  const m = await importOriginal<typeof import("@tbe/utils")>();
  return { ...m, trackEvent: (...a: unknown[]) => mockTrackEvent(...a) };
});

import { prepLogsService } from "@tbe/services/prep-logs";

describe("prepLogsService", () => {
  const originalFetch = globalThis.fetch;
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    errSpy.mockRestore();
  });

  it("getByUserId returns data array on success", async () => {
    const logs = [{ id: "1", title: "A" }];
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: true, data: logs }), {
        status: 200,
      }),
    ) as unknown as typeof fetch;

    const result = await prepLogsService.getByUserId("user-1");
    expect(result).toEqual(logs);
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
      "http://localhost:3004/api/v1/prepyatra/prep-log?userId=user-1",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("getByUserId throws when response not ok", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 500 }),
      ) as unknown as typeof fetch;

    await expect(prepLogsService.getByUserId("u")).rejects.toThrow(
      "HTTP error! status: 500",
    );
  });

  it("create posts body and returns data", async () => {
    const created = { id: "n1", title: "T" };
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: true, data: created }), {
        status: 200,
      }),
    ) as unknown as typeof fetch;

    const out = await prepLogsService.create({
      title: "T",
      timeSpent: 10,
      userId: "u",
    });
    expect(out).toEqual(created);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "prep_log_create",
      expect.objectContaining({ category: "prep_log" }),
    );
  });

  it("update calls trackEvent on success", async () => {
    const updated = { id: "1" };
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: true, data: updated }), {
        status: 200,
      }),
    ) as unknown as typeof fetch;

    const out = await prepLogsService.update({ prepLogId: "1", title: "X" });
    expect(out).toEqual(updated);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "prep_log_update",
      expect.anything(),
    );
  });

  it("delete completes without return value", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: true }), { status: 200 }),
      ) as unknown as typeof fetch;

    await prepLogsService.delete("id-1");
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
      "http://localhost:3004/api/v1/prepyatra/prep-log?prepLogId=id-1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "prep_log_delete",
      expect.anything(),
    );
  });
});
