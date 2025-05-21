import { useState } from "react";
import { useFeedbackProps } from "@/interfaces";
import { useUser, useApi } from "@/hooks";

const useFeedback = ({ type, refId }: useFeedbackProps) => {
  const { user } = useUser();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  const [modals, setModals] = useState({
    rating: true,
    feedback: false,
    success: false,
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  const submitRatingApi = useApi("submit-feedback");
  const updateFeedbackApi = useApi("update-feedback");

  const handleStarClick = async (value: number) => {
    setRating(value);

    const response = await submitRatingApi.makeRequest({
      url: "/feedback",
      method: "POST",
      body: { rating: value, type, ref: refId, userId: user?.id },
    });

    const isSuccess = response?.data?.feedbackId;

    if (isSuccess) {
      setFeedbackId(response.data.feedbackId);
      setModals((prev) => ({ ...prev, success: true }));
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackId || !feedbackText.trim()) return;

    const response = await updateFeedbackApi.makeRequest({
      url: "/feedback",
      method: "PUT",
      body: { feedbackId, feedback: feedbackText, userId: user?.id },
    });

    setToast({
      show: true,
      message: response ? "Thanks for your feedback!" : "Failed to submit detailed feedback.",
    });

    if (response) {
      setModals({ rating: false, feedback: false, success: true });
    }
  };

  return {
    rating,
    hoverRating,
    feedbackText,
    modals,
    toast,
    setRating,
    setHoverRating,
    setFeedbackText,
    setModals,
    setToast,
    handleStarClick,
    handleFeedbackSubmit,
  };
};

export default useFeedback;
