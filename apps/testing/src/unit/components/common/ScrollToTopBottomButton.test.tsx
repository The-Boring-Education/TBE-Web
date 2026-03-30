import { ScrollToTopBottomButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const scrollPct = vi.hoisted(() => ({ value: 0 }));

vi.mock("@tbe/hooks", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tbe/hooks")>();
  return {
    ...mod,
    useScrollPosition: () => scrollPct.value,
  };
});

describe("ScrollToTopBottomButton", () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollPct.value = 0;
    scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 4000,
    });
  });

  afterEach(() => {
    scrollToSpy.mockRestore();
  });

  it("scrolls toward bottom when scroll position is low", () => {
    scrollPct.value = 10;
    render(<ScrollToTopBottomButton />);

    fireEvent.click(
      screen.getByRole("button", { name: "Floating Action Button" }),
    );
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 4000,
      behavior: "smooth",
    });
  });

  it("scrolls to top when scroll position is past threshold", () => {
    scrollPct.value = 50;
    render(<ScrollToTopBottomButton />);

    fireEvent.click(
      screen.getByRole("button", { name: "Floating Action Button" }),
    );
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });
});
