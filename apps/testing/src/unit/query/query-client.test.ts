import { CACHE_TIMES, createQueryClient } from "@tbe/query";
import { describe, expect, it } from "vitest";

describe("createQueryClient", () => {
  it("returns a QueryClient instance", () => {
    const client = createQueryClient();
    expect(client).toBeDefined();
    expect(typeof client.getQueryCache).toBe("function");
    expect(typeof client.getMutationCache).toBe("function");
  });

  it("each call returns a new instance (SSR safety)", () => {
    const client1 = createQueryClient();
    const client2 = createQueryClient();
    expect(client1).not.toBe(client2);
  });

  it("sets STANDARD staleTime as query default", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(CACHE_TIMES.STANDARD.staleTime);
  });

  it("sets STANDARD gcTime as query default", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.gcTime).toBe(CACHE_TIMES.STANDARD.gcTime);
  });

  it("sets retry to 1 for queries", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(1);
  });

  it("disables refetchOnWindowFocus", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
  });

  it("enables refetchOnReconnect", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.refetchOnReconnect).toBe(true);
  });

  it("sets retry to 0 for mutations", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.mutations?.retry).toBe(0);
  });

  it("starts with empty caches", () => {
    const client = createQueryClient();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(client.getMutationCache().getAll()).toHaveLength(0);
  });
});
