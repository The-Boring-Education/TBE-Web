  'use client';

import React, { Fragment } from 'react';

import {
  Button,
  FlexContainer,
  Modal,
  StarRatingCard,
  Toast,
} from '@tbe/components';
import { useFeedback, useGamifiedAction } from '@tbe/hooks';
import type { FeedbackPopupProps } from '@tbe/interface';

const FeedbackPopup = ({
  type,
  refId,
  position = 'bottom-right',
  onSubmit,
}: FeedbackPopupProps) => {
  const {
    rating,
    feedbackText,
    feedbackModal,
    toast,
    setFeedbackText,
    setFeedbackModal,
    setToast,
    handleStarClick: baseHandleStarClick,
    handleFeedbackSubmit: handleSubmit,
  } = useFeedback({ type, refId });

  const gamifiedAction = useGamifiedAction();

  const handleStarClick = async (value: number) => {
    await baseHandleStarClick(value);
  };

  const handleFeedbackSubmit = async () => {
    await handleSubmit();
    await gamifiedAction.triggerGamifiedAction({
      gamificationAction: 'FEEDBACK_SUBMIT',
      analytics: {
        action: 'FEEDBACK_SUBMITTED',
        category: 'User',
        label: 'Feedback Submitted',
      },
      customMessage: 'Thanks for your feedback! 🎉',
      metadata: {
        refId,
        type,
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleModalClose = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  const positionClasses =
    position === 'bottom-center'
      ? 'fixed bottom-3 left-1/2 -translate-x-1/2'
      : 'fixed bottom-3 right-3';

  return (
    <Fragment>
      {feedbackModal.rating && (
        <FlexContainer
          className={`${positionClasses} bg-white shadow-lg rounded-2xl p-2 flex flex-col items-center z-50 w-[280px] transition-all duration-300`}
        >
          <FlexContainer
            className='w-full'
            itemCenter={false}
            justifyCenter={false}
          >
            <button
              className='ml-auto text-gray-400 hover:text-black text-sm'
              onClick={() => {
                setFeedbackModal((prev) => ({ ...prev, rating: false }));
                handleModalClose();
              }}
            >
              ✕
            </button>
          </FlexContainer>

          <p className='text-center text-primary font-semibold mb-3 text-base'>
            Rate your experience
          </p>

          <StarRatingCard rating={rating} onClick={handleStarClick} />

          {feedbackModal.success && (
            <div className='text-xs text-green-600 mt-2'>
              Rating submitted successfully!
            </div>
          )}

          {rating > 0 && (
            <Button
              className='mt-2 p-2 w-30 h-10'
              text='Provide More Feedback'
              variant='PRIMARY'
              onClick={() =>
                setFeedbackModal((prev) => ({ ...prev, feedback: true }))
              }
            />
          )}
        </FlexContainer>
      )}

      <Modal
        closeModal={() => {
          setFeedbackModal((prev) => ({ ...prev, feedback: false }));
          handleModalClose();
        }}
        isOpen={feedbackModal.feedback}
        title='Your Feedback'
      >
        <FlexContainer className='p-4 bg-white space-y-4'>
          <textarea
            className='w-full border rounded-xl p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='Tell us more about your experience...'
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />

          <FlexContainer
            className='w-full justify-end gap-4'
            itemCenter={false}
            justifyCenter={false}
          >
            <Button
              text='Cancel'
              variant='GHOST'
              onClick={() => {
                setFeedbackModal((prev) => ({ ...prev, feedback: false }));
                handleModalClose();
              }}
            />
            <Button
              text='Submit'
              variant='PRIMARY'
              onClick={handleFeedbackSubmit}
            />
          </FlexContainer>
        </FlexContainer>
      </Modal>

      {toast.message && (
        <Toast
          duration={3000}
          message={toast.message}
          position='top-right'
          type='success'
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </Fragment>
  );
};

export default FeedbackPopup;
