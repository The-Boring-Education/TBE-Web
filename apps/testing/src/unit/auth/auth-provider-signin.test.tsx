import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthApiUrl = vi.fn<[], string>();

vi.mock("@tbe/auth/config", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getAuthApiUrl: () => mockGetAuthApiUrl(),
  };
});

import { AuthProvider, useAuth } from "@tbe/auth";

const SignInTrigger = () => {
  const { signIn } = useAuth();
  return (
    <button type="button" onClick={() => signIn("/dashboard")}>
      sign in
    </button>
  );
};

const renderAndClick = async () => {
  render(
    <AuthProvider>
      <SignInTrigger />
    </AuthProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "sign in" }));
};

describe("AuthProvider signIn", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Allow assigning `window.location.href` in JSDOM
    // @ts-expect-error test double
    delete window.location;
    // @ts-expect-error test double
    window.location = {
      ...originalLocation,
      origin: "https://resources.theboringeducation.com",
      href: "",
    } as unknown as Location;
  });

  afterEach(() => {
    // @ts-expect-error test double
    window.location = originalLocation;
  });

  it("navigates to the auth API login endpoint with an encoded redirect_uri", async () => {
    mockGetAuthApiUrl.mockReturnValue(
      "https://api.theboringeducation.com/api/v1",
    );

    await renderAndClick();

    const target = new URL(window.location.href);
    expect(target.origin + target.pathname).toBe(
      "https://api.theboringeducation.com/api/v1/auth/login",
    );
    expect(target.searchParams.get("provider")).toBe("google");
    expect(target.searchParams.get("redirect_uri")).toBe(
      "https://resources.theboringeducation.com/auth/callback?returnTo=%2Fdashboard",
    );
  });

  it("does not navigate to a broken same-origin URL when the API URL is missing", async () => {
    mockGetAuthApiUrl.mockReturnValue("");

    await renderAndClick();

    expect(window.location.href).toBe("/login?error=auth_unavailable");
  });
});
