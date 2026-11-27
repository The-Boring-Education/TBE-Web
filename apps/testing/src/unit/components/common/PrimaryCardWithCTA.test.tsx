import { PrimaryCardWithCTA } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe("PrimaryCardWithCTA - Typography & Contrast", () => {
  const baseProps = {
    id: "card-1",
    title: "Zero to One Frontend",
    content:
      "Master HTML, CSS, JavaScript, and React by building real-world apps.",
    href: "/shiksha/zero-to-one-frontend",
    ctaText: "Start Learning",
    active: true,
    image: "/images/frontend.png",
    imageAltText: "Frontend course",
  };

  it("renders card description with WCAG AA light-mode contrast and relaxed line height", () => {
    render(<PrimaryCardWithCTA {...baseProps} theme="light" />);

    const description = screen.getByText(baseProps.content);
    expect(description).toHaveClass(
      "text-sm",
      "sm:text-[15px]",
      "leading-relaxed",
      "line-clamp-2",
      "text-slate-600",
    );
    expect(description.className).not.toContain("text-grey");
  });

  it("renders card description and title with readable dark-mode contrast and no conflicting light classes", () => {
    render(<PrimaryCardWithCTA {...baseProps} theme="dark" />);

    const title = screen.getByRole("heading", {
      level: 5,
      name: baseProps.title,
    });
    expect(title).toHaveClass("text-white");
    expect(title).not.toHaveClass("text-slate-900");

    const description = screen.getByText(baseProps.content);
    expect(description).toHaveClass("text-slate-300");
    expect(description).not.toHaveClass("text-slate-600");
  });

  it("renders card title with semantic cardTitle scale", () => {
    render(<PrimaryCardWithCTA {...baseProps} theme="light" />);

    const title = screen.getByRole("heading", {
      level: 5,
      name: baseProps.title,
    });
    expect(title).toHaveClass("text-base", "sm:text-lg", "font-semibold");
  });
});
