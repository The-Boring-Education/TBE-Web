import { motion } from 'framer-motion';
import { FlexContainerProps } from '@/interfaces';

const FlexContainer = ({
  children,
  className = '',
  direction = 'row',
  itemCenter = true,
  justifyCenter = true,
  wrap = true,
  fullWidth = false,
  id = '',
  disabled = false,
}: FlexContainerProps) => {
  return (
    <motion.div
      id={id}
      className={`flex flex-${direction} ${itemCenter && 'items-center'} ${
        justifyCenter && 'justify-center'
      } ${className} ${wrap && 'flex-wrap'} ${fullWidth && 'w-full'} ${
        disabled ? 'pointer-events-none opacity-40' : ''
      }`}
      aria-disabled={disabled} // For accessibility
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

export default FlexContainer;
