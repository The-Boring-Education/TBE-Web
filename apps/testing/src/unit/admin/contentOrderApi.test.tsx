import { useContentOrder } from "@admin/api/contentOrderApi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ContentOrderType } from "@tbe/types";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const patch = vi.hoisted(() => vi.fn());
vi.mock("@/lib/axios", () => ({ default: { patch } }));

const order = { previousIds: ["one", "two"], orderedIds: ["two", "one"] };
const parentId = "507f1f77bcf86cd799439011";

const setup = (contentType: ContentOrderType) => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useContentOrder(contentType, parentId), {
    wrapper,
  });
  return { ...hook, invalidate };
};

describe("Admin content order mutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patch.mockResolvedValue({ data: { status: true } });
  });

  it.each<{
    contentType: ContentOrderType;
    queryKeys: string[][];
  }>([
    {
      contentType: "course-chapters",
      queryKeys: [["courses"], ["course", parentId]],
    },
    { contentType: "project-sections", queryKeys: [["projects"]] },
    {
      contentType: "interview-questions",
      queryKeys: [
        ["interview-sheets"],
        ["interview-sheet", parentId],
        ["interview-all-sheets"],
        ["interview-sheet-detail", parentId],
        ["interview-database-questions", parentId],
      ],
    },
  ])(
    "persists $contentType and refreshes all affected admin views",
    async ({ contentType, queryKeys }) => {
      const { result, invalidate } = setup(contentType);
      await act(async () => {
        await result.current.mutateAsync(order);
      });
      expect(patch).toHaveBeenCalledWith("/admin/content-order", {
        ...order,
        parentId,
        contentType,
      });
      expect(invalidate.mock.calls).toEqual(
        queryKeys.map((queryKey) => [{ queryKey }]),
      );
    },
  );

  it("refreshes stale data after a rejected save and propagates the error", async () => {
    const error = new Error("Content changed");
    patch.mockRejectedValue(error);
    const { result, invalidate } = setup("course-chapters");
    await act(async () => {
      await expect(result.current.mutateAsync(order)).rejects.toBe(error);
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["course", parentId] });
  });

  it("does not treat a failure envelope as a successful save", async () => {
    patch.mockResolvedValue({
      data: { status: false, message: "Could not reorder" },
    });
    const { result } = setup("course-chapters");
    await act(async () => {
      await expect(result.current.mutateAsync(order)).rejects.toThrow(
        "Could not reorder",
      );
    });
  });
});
