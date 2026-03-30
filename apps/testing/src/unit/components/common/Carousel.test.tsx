import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// `export * from "./ui"` in @tbe/components shadows the common Carousel; import explicitly.
import Carousel from "../../../../../../packages/components/src/common/Carousel";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  motion: {
    div: ({
      children,
      className,
    }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className}>{children}</div>
    ),
    button: ({
      children,
      onClick,
      className,
    }: React.PropsWithChildren<{
      onClick?: () => void;
      className?: string;
    }>) => (
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
    ),
  },
}));

vi.mock("@heroicons/react/20/solid", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@heroicons/react/20/solid")>();
  return {
    ...actual,
    ChevronLeftIcon: (props: Record<string, unknown>) => (
      <svg data-testid="chevron-left" {...props} />
    ),
    ChevronRightIcon: (props: Record<string, unknown>) => (
      <svg data-testid="chevron-right" {...props} />
    ),
  };
});

describe("Carousel", () => {
  it("renders the first item from items", () => {
    render(
      <Carousel
        items={["A", "B"]}
        renderItem={(item) => <span data-testid={`slide-${item}`}>{item}</span>}
      />,
    );

    expect(screen.getByTestId("slide-A")).toBeInTheDocument();
    expect(screen.queryByTestId("slide-B")).not.toBeInTheDocument();
  });

  it("advances to the next item when next control is activated", () => {
    render(
      <Carousel
        items={["A", "B"]}
        renderItem={(item) => <span data-testid={`slide-${item}`}>{item}</span>}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((b) =>
      b.querySelector('[data-testid="chevron-right"]'),
    );
    expect(nextButton).toBeDefined();
    fireEvent.click(nextButton!);

    expect(screen.getByTestId("slide-B")).toBeInTheDocument();
    expect(screen.queryByTestId("slide-A")).not.toBeInTheDocument();
  });

  it("wraps to the last item when previous is activated from the first slide", () => {
    render(
      <Carousel
        items={["A", "B", "C"]}
        renderItem={(item) => <span data-testid={`slide-${item}`}>{item}</span>}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((b) =>
      b.querySelector('[data-testid="chevron-left"]'),
    );
    fireEvent.click(prevButton!);

    expect(screen.getByTestId("slide-C")).toBeInTheDocument();
  });
});
