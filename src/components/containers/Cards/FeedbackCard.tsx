"use client";

import React, { Fragment, useState } from "react";
import { useFeedback } from "@/hooks/useFeedback";
import Modal from "@/components/common/Modal";
import StarRating from "./Items/StarRatingCard";
import { Button, Toast } from "../..";
import { FeedbackProps } from "@/interfaces";



const FeedbackPopup: React.FC<FeedbackProps> = ({ type, refId, position = "bottom-right" }) => {
  const {
    rating,
    hoverRating,
    feedbackText,
    showRatingModal,
    showFeedbackModal,
    showSuccessMessage,
    toastMessage,
    setHoverRating,
    setFeedbackText,
    setShowFeedbackModal,
    handleStarClick,
    handleFeedbackSubmit,
  } = useFeedback({ type, refId });

  const [showToast, setShowToast] = useState(false);

  const positionClasses =
    position === "bottom-center"
      ? "fixed bottom-3 left-1/2 -translate-x-1/2"
      : "fixed bottom-3 right-3";




  return (
    <Fragment>
      {showRatingModal && (
        <div
          className={`${positionClasses} bg-white shadow-lg rounded-lg p-3 flex flex-col items-center z-50 w-[250px] transition-all duration-300`}
        >
          <p className="text-center text-red-500 font-medium mb-2 text-md">Rate your experience</p>

          <StarRating
            rating={rating}
            hoverRating={hoverRating}
            onClick={handleStarClick}
            onMouseEnter={setHoverRating}
            onMouseLeave={() => setHoverRating(0)}
          />

          {showSuccessMessage && (
            <div className="text-xs text-red-500 mt-1 mb-1">Rating submitted successfully!</div>
          )}

          {rating > 0 && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Provide More Feedback
            </button>
          )}
        </div>
      )}

      <Modal
        isOpen={showFeedbackModal}
        closeModal={() => setShowFeedbackModal(false)}
        title="Your Feedback"
      >
        <div className="p-2 bg-white">
          <textarea
            rows={4}
            className="w-full border rounded-md p-2 resize-none text-sm"
            placeholder="Tell us more about your experience..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-3">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="text-xs text-gray-500 hover:underline"
            >
              Cancel
            </button>
            <Button
              variant="PRIMARY"
              text="Submit"
              onClick={() => {
                handleFeedbackSubmit();
                setShowToast(true);
              }}
              className="text-white px-3 py-1 rounded text-xs"
            />
          </div>
        </div>
      </Modal>

      {showToast && toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          position="top-right"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </Fragment>
  );
};

export default FeedbackPopup;
