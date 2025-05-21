"use client";

import React from "react";
import { useFeedback } from "@/hooks";
import { Modal, Button, Toast, StartRatingCard } from "@/components";
import { FeedbackPopupProps } from "@/interfaces";

const FeedbackPopup = ({ type, refId, position = "bottom-right" }: FeedbackPopupProps) => {
  const {
    rating,
    hoverRating,
    feedbackText,
    modals,
    toast,
    setHoverRating,
    setFeedbackText,
    setModals,
    setToast,
    handleStarClick,
    handleFeedbackSubmit,
  } = useFeedback({ type, refId });

  const positionClasses =
    position === "bottom-center"
      ? "fixed bottom-3 left-1/2 -translate-x-1/2"
      : "fixed bottom-3 right-3";

  return (
    <>
      {modals.rating && (
        <div
          className={`${positionClasses} bg-white shadow-lg rounded-2xl p-2 flex flex-col items-center z-50 w-[280px] transition-all duration-300`}
        >
          <div className="w-full flex justify-end">
            <button onClick={() => setModals((prev) => ({ ...prev, rating: false }))} className="text-gray-400 hover:text-black text-sm">
              ✕
            </button>
          </div>

          <p className="text-center text-primary font-semibold mb-3 text-base">Rate your experience</p>

          <StartRatingCard
            rating={rating}
            hoverRating={hoverRating}
            onClick={handleStarClick}
            onMouseEnter={setHoverRating}
            onMouseLeave={() => setHoverRating(0)}
          />

          {modals.success && (
            <div className="text-xs text-green-600 mt-2">Rating submitted successfully!</div>
          )}

          {rating > 0 && (
            <Button
              text="Provide More Feedback"
              variant="PRIMARY"
              className="mt-2 p-2 w-30 h-10"
              onClick={() => setModals((prev) => ({ ...prev, feedback: true }))}
            />
          )}
        </div>
      )}

      <Modal
        isOpen={modals.feedback}
        closeModal={() => setModals((prev) => ({ ...prev, feedback: false }))}
        title="Your Feedback"
      >
        <div className="p-4 bg-white space-y-4">
          <textarea
            rows={4}
            className="w-full border rounded-xl p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tell us more about your experience..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <Button
              text="Cancel"
              variant="GHOST"
              onClick={() => setModals((prev) => ({ ...prev, feedback: false }))}
            />
            <Button
              text="Submit"
              variant="PRIMARY"
              onClick={() => {
                handleFeedbackSubmit();
              }}
            />
          </div>
        </div>
      </Modal>

      {toast.show && toast.message && (
        <Toast
          message={toast.message}
          type="success"
          position="top-right"
          duration={3000}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default FeedbackPopup;
