import {Feedback} from '@/database';

// Create new feedback
 const createFeedback = async ({ rating, type, ref, userId }: {
  rating: number;
  type: string;
  ref: string;
  userId: string;
}) => {
  const newFeedback = new Feedback({
    rating,
    type,
    ref,
    user: userId,
    feedback: '',
  });
  await newFeedback.save();
  return newFeedback;
};

// Find feedback by ID and user, then update the text
 const updateFeedbackText = async ({
  feedbackId,
  userId,
  feedback,
}: {
  feedbackId: string;
  userId: string;
  feedback: string;
}) => {
  const existingFeedback = await Feedback.findOne({
    _id: feedbackId,
    user: userId,
  });

  if (!existingFeedback) return null;

  existingFeedback.feedback = feedback;
  await existingFeedback.save();
  return existingFeedback;
};


export {
    createFeedback,
    updateFeedbackText
}