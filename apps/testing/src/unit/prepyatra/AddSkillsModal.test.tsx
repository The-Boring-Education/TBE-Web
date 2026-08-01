/** @vitest-environment jsdom */

import { AddSkillsModal } from "@tbe/components";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

// Mock sonner toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

describe("AddSkillsModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    userId: "test-user-id",
    userSkills: ["React", "TypeScript"],
    onSkillsUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  describe("skill list initialization", () => {
    it("initializes skillsList from userSkills when modal opens", () => {
      render(<AddSkillsModal {...defaultProps} />);

      // Should show the initial skills count
      expect(screen.getByText("My Tech Stack (2)")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("does not reset skillsList when userSkills prop changes while modal is open", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<AddSkillsModal {...defaultProps} />);

      // Add a skill while modal is open
      const input = screen.getByPlaceholderText("E.g. Rust, Kubernetes, Vue");
      await user.click(input);
      await user.type(input, "Python");
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Should now have 3 skills
      expect(screen.getByText("My Tech Stack (3)")).toBeInTheDocument();
      expect(screen.getByText("Python")).toBeInTheDocument();

      // Re-render with different userSkills prop (simulating parent re-render)
      rerender(
        <AddSkillsModal
          {...defaultProps}
          userSkills={["React", "TypeScript", "Node.js"]}
        />,
      );

      // Should still have our added Python skill, not be reset
      await waitFor(() => {
        expect(screen.getByText("My Tech Stack (3)")).toBeInTheDocument();
        expect(screen.getByText("Python")).toBeInTheDocument();
      });
    });

    it("resets skillsList when modal transitions from closed to open", async () => {
      const { rerender } = render(
        <AddSkillsModal {...defaultProps} isOpen={false} />,
      );

      // Open the modal
      rerender(<AddSkillsModal {...defaultProps} isOpen />);

      expect(screen.getByText("My Tech Stack (2)")).toBeInTheDocument();

      // Close the modal
      rerender(<AddSkillsModal {...defaultProps} isOpen={false} />);

      // Reopen with different userSkills
      rerender(
        <AddSkillsModal
          {...defaultProps}
          isOpen
          userSkills={["Go", "Docker"]}
        />,
      );

      // Should now show the new skills
      expect(screen.getByText("My Tech Stack (2)")).toBeInTheDocument();
      expect(screen.getByText("Go")).toBeInTheDocument();
      expect(screen.getByText("Docker")).toBeInTheDocument();
    });
  });

  describe("API response handling", () => {
    it("shows success toast and calls onSkillsUpdated when API returns status: true", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ status: true, data: {} }),
      });

      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      // Add a new skill
      const input = screen.getByPlaceholderText("E.g. Rust, Kubernetes, Vue");
      await user.click(input);
      await user.type(input, "Go");
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Save
      await user.click(screen.getByRole("button", { name: "Save Stack" }));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Tech stack saved successfully!",
        );
        expect(defaultProps.onSkillsUpdated).toHaveBeenCalledWith([
          "React",
          "TypeScript",
          "Go",
        ]);
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it("shows error toast when API returns status: false", async () => {
      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({ status: false, message: "User not found" }),
      });

      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      // Add a new skill
      const input = screen.getByPlaceholderText("E.g. Rust, Kubernetes, Vue");
      await user.click(input);
      await user.type(input, "Go");
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Save
      await user.click(screen.getByRole("button", { name: "Save Stack" }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("User not found");
        expect(defaultProps.onSkillsUpdated).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });

    it("shows generic error toast when API returns status: false without message", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ status: false }),
      });

      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      // Add a new skill
      const input = screen.getByPlaceholderText("E.g. Rust, Kubernetes, Vue");
      await user.click(input);
      await user.type(input, "Go");
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Save
      await user.click(screen.getByRole("button", { name: "Save Stack" }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to save tech stack",
        );
        expect(defaultProps.onSkillsUpdated).not.toHaveBeenCalled();
      });
    });

    it("shows error toast when fetch throws network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      // Add a new skill
      const input = screen.getByPlaceholderText("E.g. Rust, Kubernetes, Vue");
      await user.click(input);
      await user.type(input, "Go");
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Save
      await user.click(screen.getByRole("button", { name: "Save Stack" }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Network error");
        expect(defaultProps.onSkillsUpdated).not.toHaveBeenCalled();
      });
    });

    it("handles failure in one of multiple API calls", async () => {
      // First call succeeds (POST for added skills), second call fails (DELETE for removed skill)
      mockFetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ status: true }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({ status: false, message: "Delete failed" }),
        });

      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      // Add a new skill
      const input = screen.getByPlaceholderText("E.g. Rust, Kubernetes, Vue");
      await user.click(input);
      await user.type(input, "Go");
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Remove an existing skill by clicking the × button
      const reactSkill = screen.getByText("React");
      const removeButton = reactSkill.parentElement?.querySelector(
        "button",
      ) as HTMLButtonElement;
      await user.click(removeButton);

      // Save - should have 1 add and 1 remove
      await user.click(screen.getByRole("button", { name: "Save Stack" }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Delete failed");
        expect(defaultProps.onSkillsUpdated).not.toHaveBeenCalled();
      });
    });
  });

  describe("skill management", () => {
    it("prevents adding duplicate skills (case-insensitive)", async () => {
      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      const input = screen.getByPlaceholderText("E.g. Rust, Kubernetes, Vue");
      await user.click(input);
      await user.type(input, "react"); // lowercase version of existing skill
      await user.click(screen.getByRole("button", { name: "Add" }));

      expect(mockToastError).toHaveBeenCalledWith("Skill already added");
      // Should still have only 2 skills
      expect(screen.getByText("My Tech Stack (2)")).toBeInTheDocument();
    });

    it("toggles prebuilt skills correctly", async () => {
      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      // Click on "Python" prebuilt skill to add it (doesn't match MongoDB like Go does)
      const pythonButton = screen.getByRole("button", { name: /^Python/ });
      await user.click(pythonButton);

      // Should now have 3 skills
      expect(screen.getByText("My Tech Stack (3)")).toBeInTheDocument();

      // Click again to remove
      await user.click(pythonButton);

      // Should be back to 2 skills
      expect(screen.getByText("My Tech Stack (2)")).toBeInTheDocument();
    });
  });

  describe("no changes scenario", () => {
    it("does not make any API calls when there are no changes", async () => {
      const user = userEvent.setup();
      render(<AddSkillsModal {...defaultProps} />);

      // Save without making any changes
      await user.click(screen.getByRole("button", { name: "Save Stack" }));

      await waitFor(() => {
        // No fetch calls should be made
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Tech stack saved successfully!",
        );
        expect(defaultProps.onSkillsUpdated).toHaveBeenCalledWith([
          "React",
          "TypeScript",
        ]);
      });
    });
  });
});
