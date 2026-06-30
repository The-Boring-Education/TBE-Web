import { PopoverContainer } from "@tbe/components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React, { useEffect, useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@headlessui/react", async () => {
  const { forwardRef } = await import("react");

  return {
    Popover: ({ children, className }: any) => (
      <div className={className}>
        {typeof children === "function" ? children({ open: false }) : children}
      </div>
    ),
    PopoverButton: forwardRef<HTMLButtonElement, any>(
      ({ children, ...props }, ref) => (
        <button ref={ref} type="button" {...props}>
          {children}
        </button>
      ),
    ),
    PopoverPanel: ({ children, className }: any) => (
      <div className={className}>{children}</div>
    ),
    Transition: ({ children, show }: any) => (show ? <>{children}</> : null),
  };
});

vi.mock("@heroicons/react/20/solid", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ChevronDownIcon: ({ className }: any) => (
      <svg className={className} data-testid="popover-chevron" />
    ),
  };
});

afterEach(() => {
  vi.useRealTimers();
});

function ControlledPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverContainer
      label="Tools"
      isOpen={isOpen}
      onToggle={() => setIsOpen((prev) => !prev)}
    >
      <div>Tools Content</div>
    </PopoverContainer>
  );
}

function NavbarLikePopovers() {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleSetOpen = (popoverName: string) => {
    setOpenPopover((prev) => (prev === popoverName ? null : popoverName));
  };

  return (
    <div>
      <PopoverContainer
        label="Learn"
        isOpen={openPopover === "products"}
        onToggle={() => handleSetOpen("products")}
      >
        <div>Learn Content</div>
      </PopoverContainer>

      <PopoverContainer
        label="Tools"
        isOpen={openPopover === "tools"}
        onToggle={() => handleSetOpen("tools")}
      >
        <div>Tools Content</div>
      </PopoverContainer>
    </div>
  );
}

function NavbarWithClickOutside() {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleSetOpen = (name: string) => {
    setOpenPopover((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openPopover &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpenPopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopover]);

  return (
    <div>
      <div ref={navRef} data-testid="navbar">
        <PopoverContainer
          label="Learn"
          isOpen={openPopover === "products"}
          onToggle={() => handleSetOpen("products")}
        >
          <div>Learn Content</div>
        </PopoverContainer>
      </div>
      <button data-testid="outside-button">Outside</button>
    </div>
  );
}

describe("PopoverContainer", () => {
  it("opens on hover by default", () => {
    render(<ControlledPopover />);

    const toolsButton = screen.getByRole("button", { name: /tools/i });
    expect(screen.queryByText("Tools Content")).not.toBeInTheDocument();

    fireEvent.mouseEnter(toolsButton);

    expect(screen.getByText("Tools Content")).toBeInTheDocument();
  });

  it("keeps click toggle behavior", () => {
    render(<ControlledPopover />);

    const toolsButton = screen.getByRole("button", { name: /tools/i });
    expect(screen.queryByText("Tools Content")).not.toBeInTheDocument();

    fireEvent.click(toolsButton);
    expect(screen.getByText("Tools Content")).toBeInTheDocument();

    fireEvent.click(toolsButton);
    expect(screen.queryByText("Tools Content")).not.toBeInTheDocument();
  });

  it("closes on mouse leave after delay", () => {
    vi.useFakeTimers();

    render(<ControlledPopover />);
    const toolsButton = screen.getByRole("button", { name: /tools/i });

    fireEvent.mouseEnter(toolsButton);
    expect(screen.getByText("Tools Content")).toBeInTheDocument();

    const hoverRegion = toolsButton.parentElement as HTMLElement;
    fireEvent.mouseLeave(hoverRegion);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText("Tools Content")).not.toBeInTheDocument();
  });

  it("does not close the newly hovered popover when previous popover leave timer completes", () => {
    vi.useFakeTimers();

    render(<NavbarLikePopovers />);

    const learnButton = screen.getByRole("button", { name: /learn/i });
    const toolsButton = screen.getByRole("button", { name: /tools/i });

    fireEvent.mouseEnter(learnButton);
    expect(screen.getByText("Learn Content")).toBeInTheDocument();

    fireEvent.mouseLeave(learnButton.parentElement as HTMLElement);
    fireEvent.mouseEnter(toolsButton);

    expect(screen.getByText("Tools Content")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText("Tools Content")).toBeInTheDocument();
  });

  it("closes open dropdown when clicking outside the navbar", () => {
    render(<NavbarWithClickOutside />);

    const learnButton = screen.getByRole("button", { name: /learn/i });
    fireEvent.mouseEnter(learnButton);
    expect(screen.getByText("Learn Content")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside-button"));

    expect(screen.queryByText("Learn Content")).not.toBeInTheDocument();
  });

  it("does not close dropdown when clicking inside the navbar", () => {
    render(<NavbarWithClickOutside />);

    const learnButton = screen.getByRole("button", { name: /learn/i });
    fireEvent.mouseEnter(learnButton);
    expect(screen.getByText("Learn Content")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("navbar"));

    expect(screen.getByText("Learn Content")).toBeInTheDocument();
  });
});
