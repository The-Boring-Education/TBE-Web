import { BackgroundImage } from "@tbe/components";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("BackgroundImage", () => {
  it("applies background image URL and optional class names", () => {
    const { container } = render(
      <BackgroundImage
        bannerImageUrl="https://cdn.example.com/hero.webp"
        classNames="extra"
      />,
    );

    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundImage).toContain(
      "https://cdn.example.com/hero.webp",
    );
    expect(el.className).toContain("bg-cover");
    expect(el.className).toContain("extra");
  });
});
