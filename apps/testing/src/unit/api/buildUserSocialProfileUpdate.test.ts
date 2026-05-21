import { describe, expect, it } from "vitest";

import { buildUserSocialProfileUpdate } from "../../../../api/src/lib/utils/userSocialProfile";

describe("buildUserSocialProfileUpdate", () => {
  it("maps identity and social fields when provided", () => {
    expect(
      buildUserSocialProfileUpdate({
        name: "Ada",
        userName: "ada",
        linkedInUrl: "https://linkedin.com/in/ada",
        githubUrl: "https://github.com/ada",
        leetCodeUrl: "https://leetcode.com/ada",
      }),
    ).toEqual({
      name: "Ada",
      userName: "ada",
      linkedInUrl: "https://linkedin.com/in/ada",
      githubUrl: "https://github.com/ada",
      leetCodeUrl: "https://leetcode.com/ada",
    });
  });

  it("omits undefined fields so callers can clear URLs with empty strings", () => {
    expect(
      buildUserSocialProfileUpdate({
        linkedInUrl: "",
        githubUrl: undefined,
      }),
    ).toEqual({
      linkedInUrl: "",
    });
  });
});
