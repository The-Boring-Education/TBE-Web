import type { APIError } from "@tbe/services/base";
import { APIClient } from "@tbe/services/base";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("APIClient (base)", () => {
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as unknown as Storage;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalLocalStorage;
  });

  it("builds URL with query params for GET", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      ) as unknown as typeof fetch;

    const client = new APIClient("http://api.test/v1");
    await client.get("quizzes", { params: { a: "1", b: "x y" } });

    const call = vi.mocked(globalThis.fetch).mock.calls[0]!;
    expect(call[0]).toMatch(/quizzes\?a=1&b=x([+%20]y)/);
    expect((call[1] as RequestInit).method).toBe("GET");
  });

  it("strips leading slash from endpoint", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: 1 }), { status: 200 }),
      ) as unknown as typeof fetch;

    const client = new APIClient("http://api.test/v1");
    await client.get("/ping");

    expect(vi.mocked(globalThis.fetch).mock.calls[0]![0]).toBe(
      "http://api.test/v1/ping",
    );
  });

  it("sends Authorization when quizToken is in localStorage", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue("tok-abc");
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ v: 1 }), { status: 200 }),
      ) as unknown as typeof fetch;

    const client = new APIClient("http://api.test");
    await client.get("x");

    const init = vi.mocked(globalThis.fetch).mock.calls[0]![1] as RequestInit;
    const h = new Headers(init.headers);
    expect(h.get("Authorization")).toBe("Bearer tok-abc");
    expect(h.get("Content-Type")).toBe("application/json");
  });

  it("uses cache: no-store on GET to avoid 304 empty-body failures", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      ) as unknown as typeof fetch;

    const client = new APIClient("http://api.test");
    await client.get("gamification", { params: { userId: "123" } });

    const init = vi.mocked(globalThis.fetch).mock.calls[0]![1] as RequestInit;
    expect(init.cache).toBe("no-store");
  });

  it("returns JSON body on success", async () => {
    const payload = { id: "q1", name: "Quiz" };
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      ) as unknown as typeof fetch;

    const client = new APIClient("http://api.test");
    const res = await client.post("quiz", { title: "T" });
    expect(res).toEqual(payload);
  });

  it("throws APIError on non-OK response with message from JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Nope", code: "E1" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    ) as unknown as typeof fetch;

    const client = new APIClient("http://api.test");
    await expect(client.get("bad")).rejects.toMatchObject({
      name: "APIError",
      message: "Nope",
      status: 400,
      code: "E1",
    } as Partial<APIError>);
  });

  it("PUT and DELETE call fetch with expected methods", async () => {
    const okJson = () =>
      new Response(JSON.stringify({ done: true }), { status: 200 });
    globalThis.fetch = vi
      .fn()
      .mockImplementationOnce(() => okJson())
      .mockImplementationOnce(() => okJson()) as unknown as typeof fetch;

    const client = new APIClient("http://api.test");
    await client.put("r", { a: 1 });
    expect(
      (vi.mocked(globalThis.fetch).mock.calls[0]![1] as RequestInit).method,
    ).toBe("PUT");

    await client.delete("r");
    expect(
      (vi.mocked(globalThis.fetch).mock.calls[1]![1] as RequestInit).method,
    ).toBe("DELETE");
  });
});
