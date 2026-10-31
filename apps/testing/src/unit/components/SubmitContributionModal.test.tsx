import { createWrapper } from "@test-utils/query-wrapper";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSubmitContribution = vi.fn();

vi.mock("../../../../contributor/src/api/contributor", () => ({
  submitContribution: (payload: unknown) => mockSubmitContribution(payload),
}));

import SubmitContributionModal from "../../../../contributor/src/components/SubmitContributionModal";

const renderModal = (props: { isOpen: boolean; onClose: () => void }) => {
  const { queryClient, wrapper } = createWrapper();
  return {
    queryClient,
    ...render(<SubmitContributionModal {...props} />, { wrapper }),
  };
};

describe("SubmitContributionModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitContribution.mockReset();
  });

  it("does not render when isOpen is false", () => {
    renderModal({ ...defaultProps, isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with accessible dialog attributes when isOpen is true", () => {
    renderModal(defaultProps);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    expect(screen.getByText("Submit a Contribution")).toBeInTheDocument();
  });

  it("lists every contribution category with its baseline XP", () => {
    renderModal(defaultProps);
    expect(
      screen.getByRole("option", { name: "Pull Request / Bug Fix (5 XP)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Organize Event / Session (15 XP)" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(6);
  });

  it("calls onClose when Escape key is pressed", () => {
    renderModal(defaultProps);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close icon button is clicked", () => {
    renderModal(defaultProps);
    const closeBtn = screen.getByLabelText("Close modal");
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("submits the form, refreshes contributor data and closes", async () => {
    let resolveSubmit: (value: unknown) => void = () => {};
    mockSubmitContribution.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }),
    );

    const { queryClient } = renderModal(defaultProps);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Fixed login button alignment" },
    });
    fireEvent.change(screen.getByLabelText(/Proof URL/i), {
      target: { value: "https://github.com/pull/1" },
    });
    fireEvent.change(screen.getByLabelText(/Notes/i), {
      target: { value: "Corrected CSS padding in mobile viewport" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /Submit for Review/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(submitBtn).toBeDisabled());
    resolveSubmit({ status: true });

    await waitFor(() => {
      expect(mockSubmitContribution).toHaveBeenCalledWith({
        category: "PR_BUG_FIX",
        title: "Fixed login button alignment",
        proofUrl: "https://github.com/pull/1",
        description: "Corrected CSS padding in mobile viewport",
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["contributor"],
      });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("displays error message and retains form values when API returns failure", async () => {
    mockSubmitContribution.mockResolvedValueOnce({
      status: false,
      message: "Duplicate submission proof URL detected",
    });

    renderModal(defaultProps);

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Duplicate PR" },
    });
    fireEvent.change(screen.getByLabelText(/Proof URL/i), {
      target: { value: "https://github.com/pull/duplicate" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /Submit for Review/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Duplicate submission proof URL detected"),
      ).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  it("handles unexpected network exceptions gracefully without crashing", async () => {
    mockSubmitContribution.mockRejectedValueOnce(new Error("Network Error"));

    renderModal(defaultProps);

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Network fail PR" },
    });
    fireEvent.change(screen.getByLabelText(/Proof URL/i), {
      target: { value: "https://github.com/pull/fail" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /Submit for Review/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("An unexpected error occurred. Please try again."),
      ).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
