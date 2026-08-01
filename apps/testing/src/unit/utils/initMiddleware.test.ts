import initMiddleware from "@tbe/utils/initMiddleware";
import { describe, expect, it, vi } from "vitest";

describe("initMiddleware", () => {
  it("resolves with the middleware's callback result", async () => {
    const middleware = vi.fn((_req, _res, callback) => callback("ok"));
    const run = initMiddleware(middleware);

    const result = await run({} as any, {} as any);

    expect(result).toBe("ok");
    expect(middleware).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.any(Function),
    );
  });

  it("rejects when the middleware calls back with an Error", async () => {
    const error = new Error("middleware failed");
    const middleware = vi.fn((_req, _res, callback) => callback(error));
    const run = initMiddleware(middleware);

    await expect(run({} as any, {} as any)).rejects.toThrow(
      "middleware failed",
    );
  });
});
