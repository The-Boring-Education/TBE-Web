import useUnskilledGraphData from "@tbe/hooks/useUnskilledGraphData";
import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { describe, expect, it, vi } from "vitest";

/**
 * `NEXT_PUBLIC_UNSKILLED_API_URL` is read from `process.env` at module scope,
 * and this project's Vitest config statically replaces `process.env` with
 * `{}` at build time (see vitest.config.ts), so the var is always undefined
 * in this test environment — the query is always gated off. We assert that
 * disabled/gated behavior here; the "configured" fetch path is exercised in
 * production via the real `NEXT_PUBLIC_UNSKILLED_API_URL` env var.
 */
describe("useUnskilledGraphData", () => {
  it("does not fetch and returns null data/no error when the API URL is not configured", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHookWithQuery(() => useUnskilledGraphData());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
