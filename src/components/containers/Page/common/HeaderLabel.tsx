import { HeaderLabelProps } from '@/interfaces';
import { motion } from 'framer-motion';

const HeaderLabel = ({
  label,
  className = 'bg-gradient-to-r from-primary/20 to-primary/10',
}: HeaderLabelProps) => {
  return (
    <motion.div
      className={` p-2 text-center text-primary ${className}`}
      initial='initial'
      animate='animate'
      exit='exit'
      variants={{
        initial: { x: -1000 },
        animate: { x: 0 },
        exit: { x: 1000 },
      }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {label}
    </motion.div>
  );
};

export default HeaderLabel;
