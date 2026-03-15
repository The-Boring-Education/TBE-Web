import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "@tbe/components";

// Mock @headlessui/react
vi.mock("@headlessui/react", () => ({
  Dialog: ({ children, open, onClose }: any) =>
    open ? (
      <div data-testid="dialog" role="dialog">
        {children}
      </div>
    ) : null,
  DialogPanel: ({ children, className }: any) => (
    <div data-testid="dialog-panel" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
}));

describe("Modal Component", () => {
  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(
        <Modal isOpen={true} closeModal={vi.fn()} title="Test Modal">
          <div>Content</div>
        </Modal>,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(
        <Modal isOpen={false} closeModal={vi.fn()} title="Test Modal">
          <div>Content</div>
        </Modal>,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render title", () => {
      render(
        <Modal isOpen={true} closeModal={vi.fn()} title="My Title">
          <div>Content</div>
        </Modal>,
      );
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <Modal isOpen={true} closeModal={vi.fn()} title="Test">
          <div data-testid="child">Child Content</div>
        </Modal>,
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("should call closeModal when close button is clicked", () => {
      const closeModal = vi.fn();
      render(
        <Modal isOpen={true} closeModal={closeModal} title="Test">
          <div>Content</div>
        </Modal>,
      );

      const closeButton = screen.getByText("✖");
      fireEvent.click(closeButton);

      expect(closeModal).toHaveBeenCalled();
    });

    it("should have a close button", () => {
      render(
        <Modal isOpen={true} closeModal={vi.fn()} title="Test">
          <div>Content</div>
        </Modal>,
      );
      expect(screen.getByText("✖")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have dialog role", () => {
      render(
        <Modal isOpen={true} closeModal={vi.fn()} title="Accessible Modal">
          <div>Content</div>
        </Modal>,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should render title element", () => {
      render(
        <Modal isOpen={true} closeModal={vi.fn()} title="Title">
          <div>Content</div>
        </Modal>,
      );
      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    });
  });
});
