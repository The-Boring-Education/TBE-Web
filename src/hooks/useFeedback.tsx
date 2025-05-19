import { useState, useEffect } from "react";
import axios from "axios";
import { FeedbackProps } from "@/interfaces";



const useFeedback = ({ type, refId }: FeedbackProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

        useEffect(() => {
  // Only start timer if rating modal is shown and no rating given yet
  if (showRatingModal && rating === 0) {
    const timer = setTimeout(() => {
      setShowRatingModal(false);
    }, 5000);

    // Cleanup timer if rating changes or modal closes
    return () => clearTimeout(timer);
  }
}, [showRatingModal, rating]);

  const handleStarClick = async (selectedRating: number) => {
    setRating(selectedRating);
    try {
      const res = await axios.post("/api/v1/feedback", {
        rating: selectedRating,
        type,
        ref: refId,
      });

      const id = res.data?.data?.feedbackId;
      setFeedbackId(id);
      setShowSuccessMessage(true);

      if (!showFeedbackModal) {
        setTimeout(() => {
          setShowSuccessMessage(false);
          setShowRatingModal(false);
        }, 3000);
      }
    } catch (err) {
      setToastMessage("Failed to submit rating");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText || !feedbackId) return;

    try {
      await axios.put("/api/v1/feedback", {
        feedbackId,
        feedback: feedbackText,
      });

      setShowFeedbackModal(false);
      setShowRatingModal(false);
      setToastMessage("Thank you for your feedback!");
    } catch (err) {
      setToastMessage("Failed to submit feedback.");
    }
  };

  useEffect(() => {
    if (showFeedbackModal) {
      setShowSuccessMessage(false);
    }
  }, [showFeedbackModal]);

  return {
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
    setShowRatingModal,
    setToastMessage,
    handleStarClick,
    handleFeedbackSubmit,
  };
};


export default useFeedback;