import { GamificationToast } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock framer-motion as pass-through divs
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    p: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
  },
}));

// Mock react-icons/fa
vi.mock("react-icons/fa", () => ({
  FaStar: () => <span data-testid="fa-star" />,
  FaCrown: () => <span data-testid="fa-crown" />,
  FaTrophy: () => <span data-testid="fa-trophy" />,
}));

describe("GamificationToast Component", () => {
  const defaultProps = {
    isVisible: true,
    type: "points" as const,
    message: "Great job!",
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when isVisible is false", () => {
    const { container } = render(
      <GamificationToast {...defaultProps} isVisible={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders message when visible", () => {
    render(<GamificationToast {...defaultProps} />);
    expect(screen.getByText("Great job!")).toBeInTheDocument();
  });

  it("shows points text when points prop provided", () => {
    render(<GamificationToast {...defaultProps} points={50} />);
    expect(screen.getByText("+50 points earned!")).toBeInTheDocument();
  });

  it("does not show points text when points not provided", () => {
    render(<GamificationToast {...defaultProps} />);
    expect(screen.queryByText(/points earned!/)).not.toBeInTheDocument();
  });

  it("shows level text when both level and levelName provided", () => {
    render(
      <GamificationToast {...defaultProps} level={3} levelName="Expert" />,
    );
    expect(screen.getByText("Level 3: Expert")).toBeInTheDocument();
  });

  it("does not show level text when only level provided", () => {
    render(<GamificationToast {...defaultProps} level={3} />);
    expect(screen.queryByText(/Level 3:/)).not.toBeInTheDocument();
  });

  it("close button calls onClose", () => {
    const onClose = vi.fn();
    render(<GamificationToast {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("auto-close calls onClose after duration", () => {
    const onClose = vi.fn();
    render(
      <GamificationToast {...defaultProps} onClose={onClose} duration={2000} />,
    );

    vi.advanceTimersByTime(2000);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders correctly for levelup type", () => {
    render(
      <GamificationToast
        {...defaultProps}
        type="levelup"
        message="Level up!"
      />,
    );
    expect(screen.getByTestId("fa-crown")).toBeInTheDocument();
    expect(screen.getByText("Level up!")).toBeInTheDocument();
  });

  it("renders correctly for achievement type", () => {
    render(
      <GamificationToast
        {...defaultProps}
        type="achievement"
        message="Achievement unlocked!"
      />,
    );
    expect(screen.getByTestId("fa-trophy")).toBeInTheDocument();
    expect(screen.getByText("Achievement unlocked!")).toBeInTheDocument();
  });
});
