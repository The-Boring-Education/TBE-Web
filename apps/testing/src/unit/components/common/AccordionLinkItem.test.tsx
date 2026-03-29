import { AccordionLinkItem } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@headlessui/react", () => {
  const Panel = ({
    children,
    className,
    onClick,
  }: PropsWithChildren<{
    className?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  }>) => (
    <div data-testid="disclosure-panel" className={className} onClick={onClick}>
      {children}
    </div>
  );
  const Disclosure = () => null;
  Object.assign(Disclosure, { Panel });
  return { Disclosure };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    onClick,
  }: PropsWithChildren<{
    href: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }>) => (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
    >
      {children}
    </a>
  ),
}));

describe("AccordionLinkItem", () => {
  it("renders label inside a link with href", () => {
    render(
      <AccordionLinkItem
        href="/lesson/1"
        isActive={false}
        label="Introduction"
      />,
    );

    const link = screen.getByRole("link", { name: /introduction/i });
    expect(link).toHaveAttribute("href", "/lesson/1");
  });

  it("invokes onClick when the panel is clicked", () => {
    const onClick = vi.fn();
    render(
      <AccordionLinkItem
        href="/a"
        isActive={false}
        label="Topic"
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByTestId("disclosure-panel"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
