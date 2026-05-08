import { FreemiumLockBanner } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children?: ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      whileHover: _wh,
      whileTap: _wt,
      transition: _tr,
      ...rest
    }: {
      children?: ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      transition?: unknown;
      onClick?: () => void;
    }) => (
      <button type="button" {...rest}>
        {children}
      </button>
    ),
  },
}));

describe("FreemiumLockBanner", () => {
  it("renders default freemium copy with unlocked count", () => {
    render(<FreemiumLockBanner unlockedCount={3} onUpgradeClick={() => {}} />);

    expect(
      screen.getByText(/Freemium preview — 3 questions unlocked/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /view plans/i })).toBeVisible();
  });

  it("renders custom message when provided", () => {
    render(
      <FreemiumLockBanner
        unlockedCount={10}
        onUpgradeClick={() => {}}
        message="Custom lock message."
      />,
    );

    expect(screen.getByText("Custom lock message.")).toBeVisible();
  });

  it("calls onUpgradeClick when CTA is pressed", () => {
    const onUpgradeClick = vi.fn();
    render(
      <FreemiumLockBanner
        unlockedCount={1}
        onUpgradeClick={onUpgradeClick}
        ctaLabel="Upgrade now"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /upgrade now/i }));
    expect(onUpgradeClick).toHaveBeenCalledTimes(1);
  });
});
