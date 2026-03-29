import { routes } from "@tbe/constants";
import { describe, expect, it } from "vitest";

describe("routes smoke contract", () => {
  it("defines expected auth and home routes for smoke-tested apps", () => {
    expect(routes.home).toBe("/");
    expect(routes.login).toBe("/login");

    expect(routes.prepYatra.home).toBe("/");
    expect(routes.prepYatra.login).toBe("/login");

    expect(routes.dsayatra.home).toBe("/");
    expect(routes.dsayatra.login).toBe("/login");

    expect(routes.oncampus.home).toBe("/");
    expect(routes.oncampus.login).toBe("/login");
  });

  it("keeps key smoke navigation paths stable", () => {
    expect(routes.interviewPrep).toBe("/interview-prep");
    expect(routes.interviewPrepExplore).toBe("/interview-prep/explore");
    expect(routes.shiksha).toBe("/shiksha");
    expect(routes.shikshaExplore).toBe("/shiksha/explore");
  });
});
