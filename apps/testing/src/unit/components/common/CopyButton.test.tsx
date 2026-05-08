import { CopyButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCopyLink = vi.fn();
const mockUseCopyLink = vi.fn();

vi.mock("@tbe/hooks", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tbe/hooks")>();
  return {
    ...mod,
    useCopyLink: () => mockUseCopyLink(),
  };
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

describe("CopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCopyLink.mockReturnValue({
      copied: false,
      copyLink: mockCopyLink,
    });
  });

  it("renders default copy label", () => {
    render(<CopyButton variant="OUTLINE" />);

    expect(screen.getByRole("button", { name: /copy link/i })).toBeVisible();
  });

  it("calls copyLink with provided value when clicked", () => {
    render(
      <CopyButton
        variant="OUTLINE"
        value="https://example.com/page"
        text="Copy Link"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /copy link/i }));
    expect(mockCopyLink).toHaveBeenCalledWith("https://example.com/page");
  });

  it("shows copied text and copied classes when copied", () => {
    mockUseCopyLink.mockReturnValue({
      copied: true,
      copyLink: mockCopyLink,
    });

    render(
      <CopyButton
        variant="OUTLINE"
        text="Copy Link"
        copiedText="Copied!"
        className="text-gray-300"
        copiedClassName="text-green-400"
      />,
    );

    const button = screen.getByRole("button", { name: /copied!/i });
    expect(button).toBeVisible();
    expect(button.className).toContain("text-green-400");
  });
});
