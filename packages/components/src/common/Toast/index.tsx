import { XMarkIcon } from '@heroicons/react/20/solid';
import type { ToastProps } from '@tbe/interface';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

const Toast = ({
  message,
  type = 'success',
  position = 'bottom-right',
  duration = 3000,
  onClose,
}: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const positionClasses = {
    'bottom-right': 'bottom-8 right-4',
    'bottom-left': 'bottom-8 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const typeClasses = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-500 text-black',
  };

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1, y: 0 }} // Animate to visible position
        className={`fixed z-50 px-4 py-2 rounded-md shadow-md flex items-center space-x-3 ${typeClasses[type]} ${positionClasses[position]}`}
        exit={{ opacity: 0, y: 20 }} // Fade-out and slide-out on exit
        initial={{ opacity: 0, y: 20 }} // Start with fade-in + slide-in effect
        transition={{ duration: 0.3 }}
      >
        <span>{message}</span>
        <button onClick={onClose}>
          <XMarkIcon className='w-4 h-4 text-white hover:text-gray-200' />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
