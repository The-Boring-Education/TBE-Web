import { routes } from "@tbe/constants";
import { useApi, useUser } from "@tbe/hooks";
import type { useFeedbackProps } from "@tbe/interface";
import { useState } from "react";

const useFeedback = ({ type, refId }: useFeedbackProps) => {
  const { user } = useUser();

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  const [feedbackModal, setFeedbackModal] = useState({
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
      url: routes.api.submitUserFeedback,
      method: "POST",
      body: { rating: value, type, ref: refId, userId: user?.id },
    });

    const isSuccess = response?.data?.feedbackId;

    if (isSuccess) {
      setFeedbackId(response.data.feedbackId);
      setFeedbackModal((prev) => ({ ...prev, success: true }));
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackId || !feedbackText.trim()) return;

    const response = await updateFeedbackApi.makeRequest({
      url: routes.api.submitUserFeedback,
      method: "PUT",
      body: { feedbackId, feedback: feedbackText, userId: user?.id },
    });

    if (response) {
      setToast({
        show: true,
        message: "Thanks for your feedback!",
      });
      setFeedbackModal({ rating: false, feedback: false, success: true });
    } else {
      setToast({
        show: true,
        message: "Failed to submit detailed feedback.",
      });
    }
  };

  return {
    rating,
    feedbackText,
    feedbackModal,
    toast,
    setRating,
    setFeedbackText,
    setFeedbackModal,
    setToast,
    handleStarClick,
    handleFeedbackSubmit,
  };
};

export default useFeedback;
