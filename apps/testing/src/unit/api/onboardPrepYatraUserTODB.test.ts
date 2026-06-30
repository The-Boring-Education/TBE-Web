import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindById = vi.fn();
const mockFindByIdAndUpdate = vi.fn();

vi.mock("../../../../api/src/lib/database/models", () => ({
  User: {
    findById: (...args: unknown[]) => mockFindById(...args),
    findByIdAndUpdate: (...args: unknown[]) => mockFindByIdAndUpdate(...args),
  },
}));

import { onboardPrepYatraUserTODB } from "../../../../api/src/lib/database/queries/user";

describe("onboardPrepYatraUserTODB", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockResolvedValue({ from: undefined });
    mockFindByIdAndUpdate.mockResolvedValue({ _id: "u1" });
  });

  it("stores linkedInUrl on the User root, not inside prepYatra", async () => {
    await onboardPrepYatraUserTODB(
      "u1",
      "TECH",
      "https://www.linkedin.com/in/legacy",
    );

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        linkedInUrl: "https://www.linkedin.com/in/legacy",
        prepYatra: {
          workDomain: "TECH",
          pyOnboarded: true,
        },
      }),
      { new: true },
    );

    const updateArg = mockFindByIdAndUpdate.mock.calls[0]?.[1] as Record<
      string,
      unknown
    >;
    expect(updateArg.prepYatra).not.toHaveProperty("linkedInUrl");
  });
});
