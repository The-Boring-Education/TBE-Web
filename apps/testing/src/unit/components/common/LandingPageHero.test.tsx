import { LandingPageHero } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
}));

const baseProps = {
  backgroundImageUrl: "/hero.svg",
  heroText: "Learn Tech Skills & Prepare yourself for a Tech Job.",
  primaryButton: <button type="button">Get Started</button>,
  sectionHeaderProps: {
    heading: "Tech Education for",
    focusText: "Everyone",
  },
};

describe("LandingPageHero", () => {
  it("renders heading, focus text, hero text, and primary button", () => {
    render(<LandingPageHero {...baseProps} />);

    expect(screen.getByText("Tech Education for")).toBeInTheDocument();
    expect(screen.getByText(/Everyone/)).toBeInTheDocument();
    expect(screen.getByText(baseProps.heroText)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Get Started" }),
    ).toBeInTheDocument();
  });

  it("renders the secondary button when provided", () => {
    render(
      <LandingPageHero
        {...baseProps}
        secondaryButton={<button type="button">Book Session</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Book Session" }),
    ).toBeInTheDocument();
  });

  it("renders the hero image with the provided source", () => {
    render(<LandingPageHero {...baseProps} />);

    const image = screen.getByAltText("landing-page-hero-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/hero.svg");
  });

  it("renders the optional eyebrow badge when provided", () => {
    render(
      <LandingPageHero {...baseProps} eyebrow="Trusted by 10k+ learners" />,
    );

    expect(screen.getByText("Trusted by 10k+ learners")).toBeInTheDocument();
  });

  it("does not render the eyebrow badge when not provided", () => {
    render(<LandingPageHero {...baseProps} />);

    expect(
      screen.queryByText("Trusted by 10k+ learners"),
    ).not.toBeInTheDocument();
  });

  it("does not throw when rendered with the dark theme", () => {
    expect(() =>
      render(<LandingPageHero {...baseProps} theme="dark" />),
    ).not.toThrow();
    expect(screen.getByText(baseProps.heroText)).toBeInTheDocument();
  });
});
