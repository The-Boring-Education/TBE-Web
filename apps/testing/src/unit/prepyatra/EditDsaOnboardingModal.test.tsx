/** @vitest-environment jsdom */

import { EditDsaOnboardingModal } from "@tbe/components";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendRequest } = vi.hoisted(() => ({
  sendRequest: vi.fn(),
}));

const { mockToast } = vi.hoisted(() => ({
  mockToast: vi.fn(),
}));

vi.mock("@tbe/utils", async (importActual) => {
  const utils = await importActual<typeof import("@tbe/utils")>();
  return { ...utils, sendRequest };
});

vi.mock("@tbe/hooks", async (importActual) => {
  const hooks = await importActual<typeof import("@tbe/hooks")>();
  return {
    ...hooks,
    useToast: () => ({ toast: mockToast, dismiss: vi.fn() }),
  };
});

const baseCurrentData = Object.freeze({
  name: "Ada",
  userName: "ada",
});

describe("EditDsaOnboardingModal URL fields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it("shows visible error after blur when value is non-empty and not a URL", async () => {
    const user = userEvent.setup();
    render(
      <EditDsaOnboardingModal
        isOpen
        userId="u1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        currentData={baseCurrentData}
      />,
    );

    const github = screen.getByLabelText(/github/i);
    await user.click(github);
    await user.type(github, "not a profile link");
    fireEvent.blur(github);

    expect(await screen.findByText("Enter a valid URL.")).toBeInTheDocument();

    await user.clear(github);
    fireEvent.blur(github);
    await waitFor(() =>
      expect(screen.queryByText("Enter a valid URL.")).not.toBeInTheDocument(),
    );
  });

  it("blocks save and does not call sendRequest when profile URLs fail validation", async () => {
    const user = userEvent.setup();
    render(
      <EditDsaOnboardingModal
        isOpen
        userId="u1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        currentData={baseCurrentData}
      />,
    );

    const leetCode = screen.getByLabelText(/leetcode/i);
    await user.click(leetCode);
    await user.type(leetCode, "not a profile link");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Enter a valid URL.")).toBeInTheDocument();
    });
    expect(sendRequest).not.toHaveBeenCalled();
  });

  it("submits normalized valid URLs via sendRequest", async () => {
    sendRequest.mockResolvedValue({ status: true });
    const user = userEvent.setup();
    render(
      <EditDsaOnboardingModal
        isOpen
        userId="u1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        currentData={baseCurrentData}
      />,
    );

    const gh = screen.getByLabelText(/github/i);
    await user.click(gh);
    await user.type(gh, "github.com/octocat");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(sendRequest).toHaveBeenCalledTimes(1));
    expect(sendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/dsayatra/onboarding",
        body: expect.objectContaining({
          userId: "u1",
          githubUrl: "https://github.com/octocat",
          linkedInUrl: "",
          leetCodeUrl: "",
        }),
      }),
    );
  });

  it("blocks save when profile URL is a single word (not a real domain)", async () => {
    const user = userEvent.setup();
    render(
      <EditDsaOnboardingModal
        isOpen
        userId="u1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        currentData={baseCurrentData}
      />,
    );

    const gh = screen.getByLabelText(/github/i);
    await user.click(gh);
    await user.type(gh, "junkword");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Enter a full URL including a domain \(e.g. https:\/\/github.com\/you\)\./,
        ),
      ).toBeInTheDocument();
    });
    expect(sendRequest).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only name/username with a toast instead of submitting", async () => {
    const user = userEvent.setup();
    render(
      <EditDsaOnboardingModal
        isOpen
        userId="u1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        currentData={{
          name: "    ",
          userName: "\t ",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Validation Error",
          variant: "destructive",
        }),
      ),
    );
    expect(sendRequest).not.toHaveBeenCalled();
  });

  it("does not render placeholder attributes on optional profile URL inputs", () => {
    render(
      <EditDsaOnboardingModal
        isOpen
        userId="u1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        currentData={baseCurrentData}
      />,
    );

    for (const name of [/linkedin/i, /github/i, /leetcode/i]) {
      const input = screen.getByLabelText(name);
      expect(input.getAttribute("placeholder")).toBeNull();
    }
  });
});
