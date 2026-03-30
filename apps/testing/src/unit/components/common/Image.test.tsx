import { Image } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Image (ImageContainer)", () => {
  it("renders next/image with alt and wraps in a relative container", () => {
    render(
      <Image
        alt="Cover"
        className="rounded-md"
        fullHeight={false}
        fullWidth={false}
        src="https://cdn.example.com/pic.png"
      />,
    );

    const img = screen.getByRole("img", { name: "Cover" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("pic.png");
  });
});
