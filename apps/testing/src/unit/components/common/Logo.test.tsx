import { Logo } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("Logo", () => {
  it("links home with sr-only label and light logo by default", () => {
    render(<Logo />);

    const link = screen.getByRole("link", { name: /the boring education/i });
    expect(link).toHaveAttribute("href", "/");
    const img = screen.getByRole("img");
    expect(img.getAttribute("alt")).toContain("the-boring-education-logo");
    expect(img.getAttribute("src")).toContain("logo.svg");
    expect(img.getAttribute("src")).not.toContain("logo-dark");
  });

  it("uses dark logo asset when isDark", () => {
    render(<Logo isDark />);

    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain("logo-dark.svg");
  });
});
