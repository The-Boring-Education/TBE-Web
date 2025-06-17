import { motion } from 'framer-motion';

import type { FlexContainerProps } from '@/interfaces';

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
}: FlexContainerProps) => (
  <motion.div
    animate={{ opacity: 1, scale: 1 }}
    aria-disabled={disabled} // For accessibility
    className={`flex flex-${direction} ${itemCenter && 'items-center'} ${
      justifyCenter && 'justify-center'
    } ${className} ${wrap && 'flex-wrap'} ${fullWidth && 'w-full'} ${
      disabled ? 'pointer-events-none opacity-40' : ''
    }`}
    exit={{ opacity: 0, scale: 0.98 }}
    id={id}
    initial={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

export default FlexContainer;
