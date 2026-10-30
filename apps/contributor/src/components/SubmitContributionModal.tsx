import {
  BASELINE_CATEGORY_XP,
  CONTRIBUTION_CATEGORIES,
  CONTRIBUTION_CATEGORY_LABELS,
  type ContributionCategoryType,
} from "@tbe/constants";
import { X } from "lucide-react";
import React, { useState } from "react";

import { useSubmitContribution } from "../hooks/useContributor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitContributionModal({ isOpen, onClose }: Props) {
  const [category, setCategory] = useState<ContributionCategoryType>(
    CONTRIBUTION_CATEGORIES[0],
  );
  const [title, setTitle] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [description, setDescription] = useState("");
  const submit = useSubmitContribution();

  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const timer = setTimeout(() => {
      const firstInput =
        modalRef.current?.querySelector<HTMLElement>("input, select");
      firstInput?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit.mutate(
      { category, title, proofUrl, description },
      {
        onSuccess: () => {
          setTitle("");
          setProofUrl("");
          setDescription("");
          onClose();
        },
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-gray-900">
              Submit a Contribution
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share your proof link to earn XP and level up.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submit.error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
            {submit.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="contrib-category"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="contrib-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ContributionCategoryType)
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none"
            >
              {CONTRIBUTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {`${CONTRIBUTION_CATEGORY_LABELS[cat]} (${BASELINE_CATEGORY_XP[cat]} XP)`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contrib-title"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Title / Summary
            </label>
            <input
              id="contrib-title"
              type="text"
              required
              placeholder="e.g. Fixed navbar layout on mobile Chrome"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="contrib-proof-url"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Proof URL
            </label>
            <input
              id="contrib-proof-url"
              type="url"
              required
              placeholder="https://github.com/The-Boring-Education/... or post link"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="contrib-description"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Notes (Optional)
            </label>
            <textarea
              id="contrib-description"
              rows={2}
              placeholder="Any additional context for reviewers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submit.isPending}
              className="rounded-xl bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all"
            >
              {submit.isPending ? "Submitting..." : "Submit for Review →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
