import {
  ActionBanner,
  BannerVariantA,
  BannerVariantB,
  BannerVariantC,
} from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
    button: ({ children, onClick, ...props }: any) => (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const bannerProps = {
  title: "Banner title",
  description: "Banner description text",
  buttonText: "Go",
  buttonLink: "https://example.com/cta",
  imageSrc: "/banner.png",
};

describe("ActionBanner", () => {
  it("renders heading and subtext", () => {
    const onClick = vi.fn();
    render(
      <ActionBanner
        backgroundColor="bg-primary"
        heading="Unlock"
        subtext="Tap to continue"
        icon={() => <span data-testid="icon">★</span>}
        isLocked={false}
        onClick={onClick}
      />,
    );

    expect(screen.getByRole("heading", { name: "Unlock" })).toBeInTheDocument();
    expect(screen.getByText("Tap to continue")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("calls onClick when unlocked and clicked", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ActionBanner
        backgroundColor="bg-primary"
        heading="H"
        subtext="S"
        icon={() => <span />}
        isLocked={false}
        onClick={onClick}
      />,
    );

    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when locked", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ActionBanner
        backgroundColor="bg-primary"
        heading="H"
        subtext="S"
        icon={() => <span />}
        isLocked
        onClick={onClick}
      />,
    );

    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(onClick).not.toHaveBeenCalled();
  });
});

function getCtaAnchor(buttonLink: string) {
  const links = screen.getAllByRole("link");
  return links.find((el) => el.getAttribute("href") === buttonLink);
}

describe("BannerVariantA", () => {
  it("renders title, description, and CTA link", () => {
    render(<BannerVariantA {...bannerProps} />);

    expect(screen.getByText("Banner title")).toBeInTheDocument();
    expect(screen.getByText("Banner description text")).toBeInTheDocument();
    const ctaAnchor = getCtaAnchor(bannerProps.buttonLink);
    expect(ctaAnchor).toBeTruthy();
    expect(ctaAnchor).toHaveAttribute("target", "_blank");
  });
});

describe("BannerVariantB", () => {
  it("renders title and CTA link", () => {
    render(<BannerVariantB {...bannerProps} />);

    expect(screen.getByText("Banner title")).toBeInTheDocument();
    expect(getCtaAnchor(bannerProps.buttonLink)).toBeTruthy();
  });
});

describe("BannerVariantC", () => {
  it("renders title and CTA link", () => {
    render(<BannerVariantC {...bannerProps} />);

    expect(screen.getByText("Banner title")).toBeInTheDocument();
    expect(getCtaAnchor(bannerProps.buttonLink)).toBeTruthy();
  });
});
