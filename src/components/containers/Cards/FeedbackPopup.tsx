'use client';

import React, { Fragment } from 'react';
import { useFeedback } from '@/hooks';
import {
  Modal,
  Button,
  Toast,
  StartRatingCard,
  FlexContainer,
} from '@/components';
import { FeedbackPopupProps } from '@/interfaces';

const FeedbackPopup = ({
  type,
  refId,
  position = 'bottom-right',
}: FeedbackPopupProps) => {
  const {
    rating,
    feedbackText,
    feedbackModal,
    toast,
    setFeedbackText,
    setFeedbackModal,
    setToast,
    handleStarClick,
    handleFeedbackSubmit,
  } = useFeedback({ type, refId });

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
              onClick={() =>
                setFeedbackModal((prev) => ({ ...prev, rating: false }))
              }
              className='ml-auto text-gray-400 hover:text-black text-sm'
            >
              ✕
            </button>
          </FlexContainer>

          <p className='text-center text-primary font-semibold mb-3 text-base'>
            Rate your experience
          </p>

          <StartRatingCard rating={rating} onClick={handleStarClick} />

          {feedbackModal.success && (
            <div className='text-xs text-green-600 mt-2'>
              Rating submitted successfully!
            </div>
          )}

          {rating > 0 && (
            <Button
              text='Provide More Feedback'
              variant='PRIMARY'
              className='mt-2 p-2 w-30 h-10'
              onClick={() =>
                setFeedbackModal((prev) => ({ ...prev, feedback: true }))
              }
            />
          )}
        </FlexContainer>
      )}

      <Modal
        isOpen={feedbackModal.feedback}
        closeModal={() =>
          setFeedbackModal((prev) => ({ ...prev, feedback: false }))
        }
        title='Your Feedback'
      >
        <FlexContainer className='p-4 bg-white space-y-4'>
          <textarea
            rows={4}
            className='w-full border rounded-xl p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='Tell us more about your experience...'
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />

          <FlexContainer
            className='w-full justify-end gap-4'
            justifyCenter={false}
            itemCenter={false}
          >
            <Button
              text='Cancel'
              variant='GHOST'
              onClick={() =>
                setFeedbackModal((prev) => ({ ...prev, feedback: false }))
              }
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
          message={toast.message}
          type='success'
          position='top-right'
          duration={3000}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </Fragment>
  );
};

export default FeedbackPopup;
