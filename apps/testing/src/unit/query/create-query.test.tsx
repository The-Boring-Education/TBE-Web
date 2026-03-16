import { CACHE_TIMES, createMutation, createQuery } from "@tbe/query";
import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("createQuery", () => {
  const mockFetchFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a hook function", () => {
    const useTestQuery = createQuery({
      queryKey: () => ["test"],
      queryFn: mockFetchFn,
    });
    expect(typeof useTestQuery).toBe("function");
  });

  it("calls queryFn with the provided params", async () => {
    mockFetchFn.mockResolvedValue({ items: [] });

    const useTestQuery = createQuery<{ items: string[] }, { page: number }>({
      queryKey: (params) => ["test", params.page],
      queryFn: mockFetchFn,
    });

    renderHookWithQuery(() => useTestQuery({ page: 2 }));

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledWith({ page: 2 });
    });
  });

  it("defaults to STANDARD cache tier", async () => {
    mockFetchFn.mockResolvedValue("data");

    const useTestQuery = createQuery({
      queryKey: () => ["standard-test"],
      queryFn: mockFetchFn,
    });

    const { queryClient } = renderHookWithQuery(() => useTestQuery(undefined));

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalled();
    });

    const query = queryClient
      .getQueryCache()
      .find({ queryKey: ["standard-test"] });
    expect(query?.options.staleTime).toBe(CACHE_TIMES.STANDARD.staleTime);
    expect(query?.options.gcTime).toBe(CACHE_TIMES.STANDARD.gcTime);
  });

  it("applies STATIC cache tier when specified", async () => {
    mockFetchFn.mockResolvedValue("data");

    const useTestQuery = createQuery({
      queryKey: () => ["static-test"],
      queryFn: mockFetchFn,
      cacheTier: "STATIC",
    });

    const { queryClient } = renderHookWithQuery(() => useTestQuery(undefined));

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalled();
    });

    const query = queryClient
      .getQueryCache()
      .find({ queryKey: ["static-test"] });
    expect(query?.options.staleTime).toBe(CACHE_TIMES.STATIC.staleTime);
    expect(query?.options.gcTime).toBe(CACHE_TIMES.STATIC.gcTime);
  });

  it("returns loading state initially", () => {
    mockFetchFn.mockReturnValue(new Promise(() => {}));

    const useTestQuery = createQuery({
      queryKey: () => ["loading-test"],
      queryFn: mockFetchFn,
    });

    const { result } = renderHookWithQuery(() => useTestQuery(undefined));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("returns data on success", async () => {
    const mockData = { id: 1, name: "Test" };
    mockFetchFn.mockResolvedValue(mockData);

    const useTestQuery = createQuery({
      queryKey: () => ["success-test"],
      queryFn: mockFetchFn,
    });

    const { result } = renderHookWithQuery(() => useTestQuery(undefined));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("returns error on failure", async () => {
    mockFetchFn.mockRejectedValue(new Error("API down"));

    const useTestQuery = createQuery({
      queryKey: () => ["error-test"],
      queryFn: mockFetchFn,
    });

    const { result } = renderHookWithQuery(() => useTestQuery(undefined));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.error?.message).toBe("API down");
  });

  it("respects enabled option override", () => {
    const useTestQuery = createQuery({
      queryKey: () => ["disabled-test"],
      queryFn: mockFetchFn,
    });

    renderHookWithQuery(() => useTestQuery(undefined, { enabled: false }));

    expect(mockFetchFn).not.toHaveBeenCalled();
  });

  it("generates unique keys for different params", async () => {
    mockFetchFn.mockResolvedValue("data");

    const useTestQuery = createQuery<string, string>({
      queryKey: (id) => ["item", id],
      queryFn: mockFetchFn,
    });

    const { queryClient } = renderHookWithQuery(() => useTestQuery("abc"));

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalled();
    });

    const queries = queryClient.getQueryCache().getAll();
    expect(queries[0]?.queryKey).toEqual(["item", "abc"]);
  });
});

describe("createMutation", () => {
  const mockMutationFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a hook function", () => {
    const useTestMutation = createMutation({
      mutationFn: mockMutationFn,
    });
    expect(typeof useTestMutation).toBe("function");
  });

  it("calls mutationFn with variables", async () => {
    mockMutationFn.mockResolvedValue({ success: true });

    const useTestMutation = createMutation<
      { success: boolean },
      { name: string }
    >({
      mutationFn: mockMutationFn,
    });

    const { result } = renderHookWithQuery(() => useTestMutation());

    result.current.mutate({ name: "Test" });

    await waitFor(() => {
      expect(mockMutationFn).toHaveBeenCalled();
      expect(mockMutationFn.mock.calls[0]![0]).toEqual({ name: "Test" });
    });
  });

  it("returns idle state initially", () => {
    const useTestMutation = createMutation({
      mutationFn: mockMutationFn,
    });

    const { result } = renderHookWithQuery(() => useTestMutation());
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isPending).toBe(false);
  });

  it("invalidates specified query keys on success", async () => {
    mockMutationFn.mockResolvedValue({ ok: true });

    const useTestMutation = createMutation({
      mutationFn: mockMutationFn,
      invalidates: [["some-query"], ["another-query"]],
    });

    const { result, queryClient } = renderHookWithQuery(() =>
      useTestMutation(),
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["some-query"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["another-query"],
    });
  });

  it("invalidates dynamic keys from function", async () => {
    mockMutationFn.mockResolvedValue({ id: "new-item" });

    const useTestMutation = createMutation<{ id: string }, { type: string }>({
      mutationFn: mockMutationFn,
      invalidates: (data, vars) => [
        ["items", vars.type],
        ["item", data.id],
      ],
    });

    const { result, queryClient } = renderHookWithQuery(() =>
      useTestMutation(),
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    result.current.mutate({ type: "book" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["items", "book"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["item", "new-item"],
    });
  });

  it("calls user-provided onSuccess alongside invalidation", async () => {
    mockMutationFn.mockResolvedValue("done");
    const userOnSuccess = vi.fn();

    const useTestMutation = createMutation({
      mutationFn: mockMutationFn,
      invalidates: [["test"]],
    });

    const { result } = renderHookWithQuery(() =>
      useTestMutation({ onSuccess: userOnSuccess }),
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userOnSuccess).toHaveBeenCalled();
  });

  it("handles mutation error", async () => {
    mockMutationFn.mockRejectedValue(new Error("Server error"));

    const useTestMutation = createMutation({
      mutationFn: mockMutationFn,
    });

    const { result } = renderHookWithQuery(() => useTestMutation());

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.message).toBe("Server error");
  });
});
