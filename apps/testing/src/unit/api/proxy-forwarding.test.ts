import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAxios = vi.fn();

vi.mock("axios", () => ({
  default: (...args: unknown[]) => mockAxios(...args),
}));

vi.mock("@tbe/constants", () => ({
  envConfig: { API_URL: "https://api.test/api/v1" },
}));

import proxyHandler from "../../../../platform/src/pages/api/proxy/[...path]";

describe("platform /api/proxy/[...path] forwarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.mockResolvedValue({ status: 200, data: { status: true } });
  });

  const invoke = async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      url: "/api/proxy/auth/token",
      query: { path: ["auth", "token"], returnTo: "/dashboard" },
      headers: {
        host: "theboringeducation.com",
        connection: "keep-alive",
        "content-length": "999",
        authorization: "Bearer test-token",
      },
      body: { code: "auth-code" },
    });

    await proxyHandler(req, res);
    return { req, res, call: mockAxios.mock.calls[0]?.[0] as any };
  };

  it("forwards the auth token exchange to the upstream API", async () => {
    const { res, call } = await invoke();

    expect(call.url).toBe("https://api.test/api/v1/auth/token");
    expect(call.data).toEqual({ code: "auth-code" });
    expect(res._getStatusCode()).toBe(200);
  });

  it("drops the catch-all path param and body/hop-by-hop headers", async () => {
    const { call } = await invoke();

    expect(call.params).toEqual({ returnTo: "/dashboard" });
    expect(call.headers.host).toBeUndefined();
    expect(call.headers.connection).toBeUndefined();
    expect(call.headers["content-length"]).toBeUndefined();
    expect(call.headers.authorization).toBe("Bearer test-token");
  });
});
