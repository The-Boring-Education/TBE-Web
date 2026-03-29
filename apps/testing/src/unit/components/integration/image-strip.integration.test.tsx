import { BackgroundImage, Image } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("BackgroundImage + Image integration", () => {
  it("renders a stacked hero strip with background and foreground image", () => {
    render(
      <div className="relative min-h-[200px]">
        <BackgroundImage
          bannerImageUrl="https://cdn.example.com/bg.jpg"
          classNames="z-0"
        />
        <Image
          alt="Mascot"
          className="z-10 max-w-xs"
          fullHeight={false}
          fullWidth={false}
          src="https://cdn.example.com/mascot.png"
        />
      </div>,
    );

    const bg = document.querySelector(".bg-cover") as HTMLElement;
    expect(bg?.style.backgroundImage).toContain("bg.jpg");

    const fg = screen.getByRole("img", { name: "Mascot" });
    expect(fg.getAttribute("src") ?? "").toContain("mascot.png");
  });
});
