"use client";

import type { FeedbackType } from "@tbe/constants";
import { useGamifiedAction } from "@tbe/gamification";
import { useContentFeedback } from "@tbe/hooks";
import { Check, Lock, X } from "lucide-react";
import React, { Fragment, useState } from "react";
import { FaStar } from "react-icons/fa";

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ContentFeedbackWidgetProps {
  contentType: FeedbackType;
  contentId: string;
  meta?: Record<string, unknown>;
  /** Label shown on the FAB button. Defaults to "Rate this" */
  title?: string;
  /** Theme style: "dark" or "light". Defaults to "dark" */
  theme?: "dark" | "light";
  /** Callback after a successful submission */
  onFeedbackSubmitted?: () => void;
}

// ─── Star Rating UI with Labels & Micro-animations ────────────────────────────

const RATING_LABELS: Record<number, string> = {
  1: "Terrible 😞",
  2: "Bad 😐",
  3: "Okay 🙂",
  4: "Good 😊",
  5: "Amazing! 🚀",
};

function InteractiveStarRow({
  rating,
  onSelect,
  isLight,
}: {
  rating: number;
  onSelect: (star: number) => void;
  isLight: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const activeRating = hovered || rating;

  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = activeRating >= star;
          return (
            <button
              key={star}
              type="button"
              className="focus:outline-none p-0.5 transition-transform duration-150 hover:scale-[1.2] active:scale-95 cursor-pointer"
              onClick={() => onSelect(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <FaStar
                className={`w-5 h-5 transition-colors duration-150 ${
                  filled
                    ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]"
                    : isLight
                      ? "text-gray-300 hover:text-gray-400"
                      : "text-gray-700 hover:text-gray-500"
                }`}
              />
            </button>
          );
        })}
      </div>
      <div className="h-4 flex items-center justify-center">
        {activeRating > 0 ? (
          <span
            className={`text-[11px] font-medium animate-in fade-in duration-150 ${
              isLight ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            {RATING_LABELS[activeRating]}
          </span>
        ) : (
          <span
            className={`text-[10px] ${
              isLight ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Select a rating
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

const ContentFeedbackWidget = ({
  contentType,
  contentId,
  meta,
  title = "Rate this",
  theme = "dark",
  onFeedbackSubmitted,
}: ContentFeedbackWidgetProps) => {
  const [hasOpened, setHasOpened] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localRating, setLocalRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isLight = theme === "light";
  const gamifiedAction = useGamifiedAction();

  const {
    hasReviewed,
    existingRating,
    existingReviewText,
    isFetching,
    isSubmitting,
    isAuth,
    submitFeedback,
  } = useContentFeedback({
    contentType,
    contentId,
    meta,
    enabled: hasOpened,
  });

  // Sync pre-populated values when data loads
  React.useEffect(() => {
    if (existingRating) setLocalRating(existingRating);
    if (existingReviewText) setReviewText(existingReviewText);
  }, [existingRating, existingReviewText]);

  const openModal = () => {
    setHasOpened(true);
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localRating) return;

    const success = await submitFeedback(localRating, reviewText, meta);
    if (success) {
      setIsSuccess(true);

      // Trigger gamification only on first-ever submission
      if (!hasReviewed) {
        await gamifiedAction.triggerGamifiedAction({
          gamificationAction: "FEEDBACK_SUBMIT",
          analytics: {
            action: "FEEDBACK_SUBMITTED",
            category: "ContentFeedback",
            label: contentType,
          },
          customMessage: "Thanks for your feedback! 🎉",
          metadata: { contentType, contentId },
        });
      }

      onFeedbackSubmitted?.();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    }
  };

  // ── FAB Button (Bottom Right) ─────────────────────────────────────────────

  const renderFAB = () => {
    if (hasReviewed && existingRating) {
      const stars = "★".repeat(existingRating) + "☆".repeat(5 - existingRating);
      return (
        <button
          type="button"
          onClick={openModal}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl backdrop-blur-md ${
            isLight
              ? "bg-yellow-50/95 border border-yellow-300/60 text-yellow-700 hover:bg-yellow-100"
              : "bg-[#18181b]/90 border border-yellow-500/30 text-yellow-400 hover:bg-[#27272a] hover:border-yellow-500/50"
          }`}
          title="Click to edit your rating"
        >
          <span className="tracking-tight font-medium">Rated {stars}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={openModal}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl backdrop-blur-md group ${
          isLight
            ? "bg-white/95 border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300"
            : "bg-[#18181b]/90 border border-white/15 text-white hover:bg-[#27272a] hover:border-white/30"
        }`}
        title={title}
      >
        <FaStar className="w-3.5 h-3.5 text-yellow-400 group-hover:rotate-12 transition-transform duration-200" />
        <span>{title}</span>
      </button>
    );
  };

  // ── Centered Modal ──────────────────────────────────────────────────────────

  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeModal}
      >
        <div
          className={`relative w-full max-w-sm rounded-2xl p-5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
            isLight
              ? "bg-white border border-gray-200 text-gray-900"
              : "bg-[#121215] border border-white/10 text-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient background glow */}
          <div
            className={`absolute -top-16 -left-16 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
              isLight ? "bg-red-500/10" : "bg-red-600/15"
            }`}
          />
          <div
            className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
              isLight ? "bg-yellow-400/15" : "bg-yellow-500/15"
            }`}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={closeModal}
            className={`absolute top-4 right-4 p-1 transition-colors cursor-pointer focus:outline-none ${
              isLight
                ? "text-gray-400 hover:text-gray-700"
                : "text-gray-400 hover:text-white"
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-3 pr-6">
            <h3
              className={`text-sm font-bold tracking-tight mb-0.5 ${
                isLight ? "text-gray-900" : "text-white"
              }`}
            >
              {hasReviewed ? "Update Your Feedback" : "Rate & Review"}
            </h3>
            <p
              className={`text-[11px] ${
                isLight ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Share your thoughts to help improve this content!
            </p>
          </div>

          {!isAuth ? (
            /* Unauthenticated State */
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isLight
                    ? "bg-red-50 border border-red-100 text-red-500"
                    : "bg-white/5 border border-white/10 text-red-400"
                }`}
              >
                <Lock className="w-5 h-5" />
              </div>
              <p
                className={`text-sm font-medium ${
                  isLight ? "text-gray-800" : "text-gray-300"
                }`}
              >
                Authentication Required
              </p>
              <p
                className={`text-xs max-w-xs ${
                  isLight ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Please log in to submit ratings and feedback for this content.
              </p>
              <a
                href="/login"
                className="mt-2 inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-md shadow-red-600/20"
              >
                Log In
              </a>
            </div>
          ) : isFetching ? (
            /* Loading state */
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p
                className={`text-xs ${
                  isLight ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Loading feedback...
              </p>
            </div>
          ) : isSuccess ? (
            /* Success state */
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-500">
                <Check className="w-6 h-6" />
              </div>
              <h4
                className={`text-sm font-bold ${
                  isLight ? "text-gray-900" : "text-white"
                }`}
              >
                Thank You! 🎉
              </h4>
              <p
                className={`text-xs ${
                  isLight ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Your feedback has been saved successfully.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Stars */}
              <InteractiveStarRow
                rating={localRating}
                onSelect={(star) => setLocalRating(star)}
                isLight={isLight}
              />

              {/* Review Textarea */}
              <div className="space-y-1">
                <label
                  htmlFor={`content-feedback-review-${contentType}-${contentId}`}
                  className={`block text-[11px] font-medium ${
                    isLight ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Written Review (Optional)
                </label>
                <textarea
                  id={`content-feedback-review-${contentType}-${contentId}`}
                  className={`w-full rounded-xl p-2.5 text-xs placeholder-gray-400 focus:outline-none transition-all resize-none ${
                    isLight
                      ? "bg-gray-50/80 border border-gray-200 text-gray-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                      : "bg-white/[0.04] border border-white/10 text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
                  }`}
                  placeholder="What did you like or think could be improved?"
                  rows={3}
                  maxLength={500}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <div className="flex justify-end">
                  <span
                    className={`text-[10px] ${
                      isLight ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {reviewText.length}/500
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!localRating || isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/25 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : hasReviewed
                      ? "Update Feedback"
                      : "Submit Feedback"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  // ── Root Render ────────────────────────────────────────────────────────────

  return (
    <Fragment>
      {/* Fixed FAB button at bottom-right */}
      <div className="fixed bottom-5 right-5 z-40">{renderFAB()}</div>

      {/* Centered Modal */}
      {renderModal()}
    </Fragment>
  );
};

export default ContentFeedbackWidget;
