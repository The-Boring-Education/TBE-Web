import { CircularProgressBar } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tbe/interface", () => ({}));

describe("CircularProgressBar Component", () => {
  it("renders with default props", () => {
    const { container } = render(<CircularProgressBar percentage={50} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies custom size", () => {
    const { container } = render(
      <CircularProgressBar percentage={50} size={100} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: "100px", height: "100px" });
  });

  it("renders children centered", () => {
    render(
      <CircularProgressBar percentage={50}>
        <span data-testid="child">50%</span>
      </CircularProgressBar>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("SVG circle has correct strokeDasharray (circumference)", () => {
    const size = 56;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const { container } = render(
      <CircularProgressBar
        percentage={50}
        size={size}
        strokeWidth={strokeWidth}
      />,
    );
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute(
      "stroke-dasharray",
      String(circumference),
    );
  });

  it("SVG circle has correct strokeDashoffset for 50%", () => {
    const size = 56;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (50 / 100) * circumference;
    const { container } = render(
      <CircularProgressBar
        percentage={50}
        size={size}
        strokeWidth={strokeWidth}
      />,
    );
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute("stroke-dashoffset", String(offset));
  });

  it("SVG circle has correct strokeDashoffset for 100% (offset = 0)", () => {
    const { container } = render(<CircularProgressBar percentage={100} />);
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute("stroke-dashoffset", "0");
  });

  it("SVG circle has correct strokeDashoffset for 0% (offset = circumference)", () => {
    const size = 56;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const { container } = render(
      <CircularProgressBar
        percentage={0}
        size={size}
        strokeWidth={strokeWidth}
      />,
    );
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute(
      "stroke-dashoffset",
      String(circumference),
    );
  });
});
