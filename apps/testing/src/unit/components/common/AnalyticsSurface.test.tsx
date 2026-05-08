import { AnalyticsSurface } from "@tbe/components";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("AnalyticsSurface", () => {
  it("wraps children with display:contents div and data-tbe-surface", () => {
    const { container } = render(
      <AnalyticsSurface surface="course_outline">
        <span>inside</span>
      </AnalyticsSurface>,
    );
    const wrapper = container.querySelector("[data-tbe-surface]");
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveAttribute("data-tbe-surface", "course_outline");
    expect(wrapper).toHaveTextContent("inside");
    expect(wrapper).toHaveStyle({ display: "contents" });
  });

  it("renders fragment only when surface is empty after trim", () => {
    const { container } = render(
      <AnalyticsSurface surface="   ">
        <span>bare</span>
      </AnalyticsSurface>,
    );
    expect(container.querySelector("[data-tbe-surface]")).toBeNull();
    expect(container).toHaveTextContent("bare");
  });
});
